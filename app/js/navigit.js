import async from "async";
import parse from "parse-link-header";
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
  fetchUserRepos(page = 1, since = undefined) {
    return new Promise(async (res, rej) => {
      try {
        let payload;
        if (since) {
          console.log("since caught", since);
          payload = { page, per_page: 100, since };
        } else {
          console.log("since didnt come", since);
          payload = { page, per_page: 100 };
        }
        const response = await this.git.request("GET /user/repos", payload);
        console.log("got resp", response);
        const lastPage = checkLastPage(page, response);
        console.log("shit storm");
        await this.fetchUserReposV2(page, since, response);
        if (lastPage) {
          const self = this;
          let tasks = [];
          for (let i = page + 1; i <= lastPage; i += 1) {
            tasks.push(this.fetchUserReposV2.bind(self, i, since));
          }
          console.log("launching tasks", tasks.length);
          async.parallel(tasks, (e, r) => {
            console.log("all tasks done");
            if (e) {
              rej(e);
              return;
            }
            res(this.store.src);
            return;
          });
        } else {
          res(this.store.src);
          return;
        }
      } catch (e) {
        rej(e);
      }
    });
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
          return true;
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
      await this.fetchUserOrgReposV2(org, page, response);
      if (lastPage) {
        const self = this;
        let tasks = [];
        for (let i = page + 1; i <= lastPage; i += 1) {
          tasks.push(this.fetchUserOrgReposV2.bind(self, org, i));
        }
        await async.parallel(tasks);
        console.log("fully filmy");
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
        await async.parallel(
          names.map((x) => this.fetchOrgRepos.bind(self, x))
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
          this.fetchIssuesAndPr.bind(self, 1, {
            role,
            username: this.store.get("username"),
            isIssue: true,
          })
        );
      }
      await async.parallel(tasks);
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
        tasks.push(
          this.fetchIssuesAndPr.bind(self, 1, {
            role,
            username: this.store.get("username"),
            isIssue: false,
          })
        );
      }
      await async.parallel(tasks);
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
    try {
      const self = this;
      await async.parallel([
        this.syncUserRepos.bind(self, undefined),
        this.syncUserOrgRepos.bind(self, undefined),
        this.syncIssues.bind(self, undefined),
        this.syncPR.bind(self, undefined),
      ]);
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
