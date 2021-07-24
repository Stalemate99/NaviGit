import parse from "parse-link-header";
import parallel from "async-await-parallel";
class Navigit {
  constructor(git, store) {
    this.git = git;
    this.store = store;
  }
  async fetchUserReposV2(page, since = undefined, response) {
    try {
      if (!response) {
        console.log("shtitt2");
        let payload;
        if (since) {
          console.log("since caughtzzz", since);
          payload = { page, per_page: 100, since };
        } else {
          console.log("since doesnt comeeee ", since);

          payload = { page, per_page: 100 };
        }
        response = await this.git.request("GET /user/repos", payload);
      }
      console.log(response);
      const { data } = response;
      for (let repo of data) {
        this.store.repoSet(repo.full_name, {
          name: repo.name,
          isOwnedByUser: repo.owner.type === "Organization" ? false : true,
          url: repo.html_url,
          ownedBy: repo.full_name.split("/")[0],
          pr: `${repo.html_url}/pulls`,
          private: repo.private,
          issues: `${repo.html_url}/issues`,
        });
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
  async fetchUserRepos(page = 1, since = undefined) {
    try {
      const response = await this.git.request("GET /user/repos", {
        page,
        per_page: 100,
        since,
      });
      const lastPage = checkLastPage(page, response);
      await this.fetchUserReposV2(page, since, response);
      if (lastPage != page) {
        const self = this;
        let tasks = [];
        for (let i = page + 1; i <= lastPage; i += 1) {
          tasks.push(async () => await self.fetchUserReposV2(i, since));
        }
        await parallel(tasks);
        return true;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async fetchUserOrgReposV2(org, page, response) {
    try {
      if (!response) {
        response = await this.git.request("GET /orgs/{org}/repos", {
          org: org,
          page,
          sort: "created",
          direction: "desc",
          per_page: 100,
        });
      }
      const { data } = response;
      for (let repo of data) {
        if (this.store.repoGet(repo.full_name)) {
          console.log("gottem", repo.full_name);
          return false;
        }
        this.store.repoSet(repo.full_name, {
          name: repo.name,
          isOwnedByUser: repo.owner.type === "Organization" ? false : true,
          url: repo.html_url,
          ownedBy: repo.full_name.split("/")[0],
          pr: `${repo.html_url}/pulls`,
          private: repo.private,
          issues: `${repo.html_url}/issues`,
        });
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async fetchOrgRepos(org, page = 1) {
    try {
      const response = await this.git.request("GET /orgs/{org}/repos", {
        org: org,
        page,
        sort: "created",
        direction: "desc",
        per_page: 100,
      });
      const lastPage = checkLastPage(page, response);
      const notRedundant = await this.fetchUserOrgReposV2(org, page, response);
      let tasks = [];
      if (lastPage !== page) {
        const self = this;
        for (let i = page + 1; i <= lastPage; i += 1) {
          tasks.push(async () => {
            return await self.fetchUserOrgReposV2(org, i);
          });
        }
        console.log(parallel);
        await parallel(tasks);
        return true;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async fetchIssuesAndPr(page = 1, config) {
    try {
      let { role, username, isIssue } = config;
      if (!isIssue) {
        console.log("pr entry point");
      }
      const response = await this.git.request("GET /search/issues", {
        q: `${role}:${username} is:open ${
          isIssue ? "is:issue" : "is:pull-request"
        }`,
        sort: "updated",
        direction: "desc",
        per_page: 100,
        page,
      });

      for (let item of response.data.items) {
        this.store[isIssue ? "issueSet" : "prSet"](item.id, {
          role,
          title: item.title,
          created: item.created_at,
          url: item.html_url,
          events: item.events_url,
          id: item.id,
          state: item.state,
        });
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async syncUserRepos(since = undefined) {
    try {
      this.store.set("lastSync", +new Date());
      console.log("gonna call", since);
      const done = await this.fetchUserRepos(1, since);
      console.log("resolving user repos");
      return true;
    } catch (e) {
      throw e;
    }
  }

  async syncUserOrgRepos() {
    this.store.set("lastSync", +new Date());
    try {
      const self = this;
      const { data } = await this.git.request("GET /user/orgs");
      const names = data.map((x) => x.login);
      if (names.length) {
        await parallel(
          names.map((x) => async () => {
            return await self.fetchOrgRepos(x);
          })
        );
        console.log("userorgrepos synced");
        return true;
      }
    } catch (err) {
      throw err;
    }
  }

  async syncIssues() {
    this.store.set("lastSync", +new Date());
    try {
      const roles = ["author", "assignee"];
      const self = this;
      let tasks = [];
      for (let role of roles) {
        tasks.push(
          async () =>
            await self.fetchIssuesAndPr(1, {
              role,
              username: self.store.get("username"),
              isIssue: true,
            })
        );
      }
      await parallel(tasks);
      return true;
    } catch (e) {
      throw e;
    }
  }

  async syncPR() {
    this.store.set("lastSync", +new Date());
    try {
      const roles = ["author", "review-requested", "assignee"];
      const self = this;
      let tasks = [];
      for (let role of roles) {
        tasks.push(async () => {
          await self.fetchIssuesAndPr(1, {
            role,
            username: self.store.get("username"),
            isIssue: false,
          });
          return true;
        });
      }
      await parallel(tasks);
      return true;
    } catch (e) {
      throw e;
    }
  }

  async registerAccessToken() {
    this.store.clear();
    try {
      const response = await this.git.request("GET /user");
      const { headers, data } = response;
      let scopes = ["read:org", "repo"];
      let isPermit =
        headers["x-oauth-scopes"]
          .split(",")
          .filter((x) => ~scopes.indexOf(x.trim())).length === scopes.length;
      console.log(isPermit, "permit");
      if (isPermit) {
        this.store.set("username", data.login);
      } else {
        return false;
      }
      return true;
    } catch (err) {
      throw "invalid_key";
    }
  }

  async initialSetup() {
    console.time("Sync");
    try {
      const self = this;
      await parallel([
        async function () {
          await self.syncUserRepos();
          return true;
        },
        async function () {
          await self.syncUserOrgRepos();
          return true;
        },
        async function () {
          await self.syncIssues();
          return true;
        },
        async function () {
          await self.syncPR();
          return true;
        },
      ]);
      console.timeEnd("Sync");
      return true;
    } catch (err) {
      throw err;
    }
  }

  async search(term) {
    const res = await this.git.request("GET /search/repositories", {
      q: `${term} in:name`,
      per_page: 100,
    });
    return res.data.items.map((repo) => ({
      name: repo.name,
      isOwnedByUser: repo.owner.type === "Organization" ? false : true,
      ownedBy: repo.full_name.split("/")[0],
      url: repo.html_url,
      pr: `${repo.html_url}/pulls`,
      private: repo.private,
      issues: `${repo.html_url}/issues`,
    }));
  }
}

function checkLastPage(page, response) {
  link: '<https://api.github.com/search/issues?q=author%3Amohanpierce99+is%3Apull-request&per_page=30&page=2>; rel="next", <https://api.github.com/search/issues?q=author%3Amohanpierce99+is%3Apull-request&per_page=30&page=2>; rel="last"';
  if ("link" in response.headers) {
    const obj = parse(response.headers["link"]);
    if ("last" in obj) {
      return obj.last.page;
    }
    return false;
  } else {
    return page;
  }
}

export default Navigit;
