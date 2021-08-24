import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Octokit } from "@octokit/core";
import Store from "../js/store";
import Navigit from "../js/navigit";
import moment from "moment";
import Fuse from "fuse.js";

import Header from "../components/Header";
import Nav from "../components/Nav";
import RepoCard from "../components/RepoCard";
import BranchCard from "../components/BranchCard";
import PRCard from "../components/PRCard";
import IssueCard from "../components/IssueCard";
import PublicResultsHeader from "../components/PublicResultsHeader";
import Loader from "../components/Loader";
import { concat } from "async";
import EmptyState from "../components/EmptyState";

const { ipcRenderer } = window.require("electron");

const tabs = ["Repos", "PRs", "Issues"];
const store = new Store();

let token = JSON.parse(localStorage.getItem("signin"));
let pat = token ? token.authKey : '';
const octo = new Octokit({
  auth: pat,
});
const navigit = new Navigit(octo, store, pat);



export default function Home() {
  const [active, setActive] = useState(tabs[0]);
  const [content, setContent] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [text, setText] = useState("");
  const [filteredContent, setFilteredContent] = useState([]);
  const [isInitialText, setIsInitialText] = useState(true);

  const [filteredBranches, setFilteredBranches] = useState([])
  const [showBranches, setShowBranches] = useState(false)
  const [isLoading, setIsLoading] = useState(true);

  const [isPublicReposLoading, setIsPublicReposLoading] = useState(false)

  const [branchCursor, setBranchCursor] = useState(0);
  const [branches, setBranches] = useState([]);
  const [issue, setIssue] = useState(0);
  const [repo, setRepo] = useState(0);
  const [pr, setPr] = useState(0);
  const inputRef = useRef(null);

  const [isShownOnScreen, setIsShownOnScreen] = useState(true)

  const [shouldScroll, setShouldScroll] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false);

  const [includeSearchResult, setIncludeSearchResult] = useState(0)
  const [publicRepos, setPublicRepos] = useState([])

  useEffect(() => {
    // Listening for keypress
    document.addEventListener("keydown", handleKeyPress);
    ipcRenderer.on('hide', () => {
      console.log("sync repos hide")
    })
    ipcRenderer.on('show', async () => {
      console.log("sync repos show",)
      const since = localStorage.getItem("last_opened")
      let result
      if(since){ result = await navigit.syncRepos(since)}
      else { result = await navigit.syncRepos() }
      console.log("sync repos value", result)
      const now = new Date().toISOString()
      localStorage.setItem("last_opened", now);
      if (result && result > 0) {
        setRepo(result);
        if (active === "Repos") {
          const repos = store.getSorted("repos");
          setContent(repos);
        }
      }
    })
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      ipcRenderer.removeAllListeners()
    };
  });

  useEffect(() => {
    clearBranches();

    if (active === "Repos") {
      const repos = store.getSorted("repos");
      setContent(repos);
    } else if (active === "PRs") {
      const prs = store.getSorted("pr");
      setContent(prs);
    } else if (active === "Issues") {
      const issues = store.getSorted("issues");
      setContent(issues);
    }
    
    return () => {
      setContent([]);
    };
  }, [active]);

  useEffect(()=>{
    // Snapshot of updates
    console.log(pr,repo,issue);
  },[pr,repo,issue])

  const handleBadgeUpdate = () => {
    if (active=="Repos"){
      if(repo > 0) setRepo(0)
    }else if (active == "Issues"){
      if(issue > 0) setIssue(0)
    }else{
      if(pr > 0) setPr(0)
    }
  }

  // Debouncing text box
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialText) {
        setIsInitialText(false);
      } else if (active === "Repos" && text.includes(":")) {
        if (!showBranches) {
          setShowBranches(true)
          if (branches.length > 0) setBranches([])
          if (filteredBranches.length > 0) setFilteredBranches([])
          const repo = getRepoWithCursor()
          fetchBranches(repo.ownedBy, repo.name);
        }else{
          if (branches.length == 0){
            const repo = getRepoWithCursor()
            fetchBranches(repo.ownedBy, repo.name);
          }
          else filterBranches(branches)
        }
        
      }else{
        if (showBranches) {
          setShowBranches(false)
          console.log("setting branches empty")
        }
        setIsLoading(true)
        filterContent()
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if(!includeSearchResult || active!="Repos" || text==="") return
    console.log("enters include search use effect")
    setPublicRepos([])
    setIsPublicReposLoading(true)
    const timer = setTimeout(() => {
        (async () => {
          const searchText = text
          const result = await navigit.search(searchText);
          if(inputRef.current.value===searchText){
            // const data = [
            //   ...filteredContent,
            //   ...result
            // ]
            setPublicRepos(result)
            setIsPublicReposLoading(false)
          }else if (inputRef.current.value===""){
            setIsPublicReposLoading(false)
          }
        })()
    }, 400);

    return () => clearTimeout(timer);
  }, [includeSearchResult]);

  useEffect(() => {
    filterContent();
  }, [content]);

  // Sync Issues
  useEffect(() => {
    const interval = setInterval(async () => {
      if(!isSyncing) {
        setShouldScroll(false)
        setIsSyncing(true)
      }
      const result = 10;//await navigit.syncIssues();
      console.log("issues result returned",result);
      if (result && result > 0) {
        console.log("Issue badge results  issue s came brroooo",result);
        setShouldScroll(false)
        setIssue(result);
        console.log("issues fetched bro");
        if (active === "Issues") {
          const issues = store.getSorted("issues");
          setContent(issues);
        }
      }
      if (isSyncing) {
        setShouldScroll(false)
        setIsSyncing(false)
        }
    }, 8000);

    return () => clearInterval(interval);
  });

  // Sync PR
  useEffect(() => {
    const interval = setInterval(async () => {
      if(!isSyncing) {
        setShouldScroll(false)
        setIsSyncing(true)
      }
      const result = await navigit.syncPR();
      if (result && result > 0) {
        console.log(" results came brroooo",result);
        setShouldScroll(false)
        setPr(result);
        console.log("PRs fetched bro");
        if (active === "PRs") {
          const prs = store.getSorted("pr");
          setContent(prs);
        }
      }
      if(isSyncing) {
        setShouldScroll(false)
        setIsSyncing(false)
      }
    }, 8000);

    return () => clearInterval(interval);
  });

  const getRepoWithCursor = ()=>{
    const i = cursor >= filteredContent.length? cursor - filteredContent.length : cursor
    const repo = cursor >= filteredContent.length ? publicRepos[i] : filteredContent[i]
    console.log("REPO WITH CURSOR", i, cursor)
    return repo
  }

  const filterBranches = (allBranches) => {
    const branchSplit = text.split(":")
    const query = branchSplit[branchSplit.length -1]
    if(query != ""){
      const options = {
        keys : [
          "name"
        ],
        threshold : 0.1
      };
      const fuse = new Fuse(allBranches, options);
      const data = fuse.search(query).map((val) => {
        return val['item']
      })
      setFilteredBranches(data)
      if (data.length > 0){
        setBranchCursor(0)
      }
    }else{
      setFilteredBranches(allBranches)
      setBranchCursor(0)
    }
  }

  const filterContent = () => {
    if (text != "") {
      let keys = [];
      if (active === "Repos") {
        keys = ["name", "ownedBy"];
      } else if (active === "PRs") {
        keys = ["repo", "title"];
      } else if (active === "Issues") {
        keys = ["repo", "title"];
      }
      const options = {
        keys,
        threshold: 0.1,
      };
      const fuse = new Fuse(content, options);
      // Change the pattern
      const pattern = text;
      const data = fuse.search(pattern).map((val) => {
        return val["item"];
      });
      setFilteredContent(data);
      console.log(
        "gonna set include search result to true",
        includeSearchResult
      );
      setIncludeSearchResult(includeSearchResult + 1);
    } else {
      setFilteredContent(content);
    }
    setShouldScroll(true)
    setCursor(0);
    setIsLoading(false);
  };

  const fetchBranches = async (ownedBy, name) => {
    const result = await navigit.searchBranches(ownedBy, name)
    if (inputRef.current.value!==text) return
    const data = result.map((branch) => {
      return {
        name : branch
      }
    })
    setBranches(data)
    filterBranches(data)
    }

  const clearBranches = async () => {
    if(showBranches) setShowBranches(false)
    if(branches.length > 0) setBranches([])
    if(filteredBranches.length > 0) setFilteredBranches([])
    const textArr = text.split(":")
    setText(textArr[0])
  }


  const handleKeyPress = async (e) => {
    if (e.code === "Tab") {
      e.preventDefault();
      var i = tabs.indexOf(active);
      i = (i + 1) % 3;
      setIsLoading(true);
      setShouldScroll(true);
      setActive(tabs[i]);
    } else if (e.code.includes("Arrow")) {
      // if (e.code.includes("Left")) {
      //   if(showBranches){
      //     ipcRenderer.send("open-repo", `${getRepoWithCursor().url}/tree/${filteredBranches[branchCursor]}`);
      //   }else{
      //     ipcRenderer.send("open-repo", getRepoWithCursor().issues);
      //   }
      //   markVisited()

      // } else if (e.code.includes("Right")) {
      //   if(showBranches){
      //     ipcRenderer.send("open-repo", `${getRepoWithCursor().url}/tree/${filteredBranches[branchCursor]}`);
      //   }else{
      //     ipcRenderer.send("open-repo", getRepoWithCursor().pr);
      //   }
      //   markVisited();
      // } else 
      if (e.code.includes("Up")) {
        e.preventDefault()
        handleBadgeUpdate()
        setShouldScroll(true)
        if(showBranches){
          var index = branchCursor == 0 ? filteredBranches.length + 3 - 1 : (branchCursor - 1) % (filteredBranches.length + 3);
          setBranchCursor(index);
        }else{
          var index = cursor == 0 ? (filteredContent.length + publicRepos.length) - 1 : (cursor - 1) % (filteredContent.length + publicRepos.length);
          setCursor(index);
        }
      } else if (e.code.includes("Down")){
        handleBadgeUpdate()
        setShouldScroll(true)
        if(showBranches){
          var index = (branchCursor + 1) % (filteredBranches.length + 3);
          setBranchCursor(index);
        }else{
          var index = (cursor + 1) % (filteredContent.length + publicRepos.length);
          setCursor(index);
        }
      }
    } else if (e.code.includes("Enter")) {
      markVisited()
      if(showBranches){
        let url = ''
        switch(branchCursor) {
          case 0:
            url = `${getRepoWithCursor().pr}`
            break;
          case 1:
            url = `${getRepoWithCursor().issues}`
            break;
          case 2:
            url = `${getRepoWithCursor().url}/actions`
            break;
          default:
            url = `${getRepoWithCursor().url}/tree/${filteredBranches[branchCursor]}`
        }
        ipcRenderer.send("open-repo", url);
      }else{
      ipcRenderer.send("open-repo", getRepoWithCursor().url);
      }
      // ipcRenderer.once("Enter-reply", (e, data) => {
      //   console.log(data, "From Main Process");
      // });
    }
  };

  function handleClick(msg) {
    toast.error("Unable to sync.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setCursor(
      content.reduce((cur, cont) => {
        if (cont.message === msg) cur = content.indexOf(cont);
        return cur;
      }, 0)
    );
  }

  const markVisited = () => {
    console.log("inside markvisited", filteredContent[cursor]);
    if (filteredContent[cursor].key) {
      const branch =
        active === "Repos" ? "repos" : active == "PRs" ? "pr" : "issues";
      store.markVisited(branch, filteredContent[cursor].key);
    }
  };

  const renderCards = () => {
    // No content
    if (isLoading) {
      return (<Loader text="Seaching in Github"/>)
      // return (
      //   <div className="home-nocontent-wrapper">
      //     <p>We couldn't fetch you the required data</p>
      //     <p>
      //       Use <span>Cmd + Enter</span> to search{" "}
      //       {active === "Repos"
      //         ? "github in general"
      //         : active === "PRs"
      //         ? "closed PRs"
      //         : "closed issues"}
      //     </p>
      //     <p>
      //       or open <span>settings</span> and sync to update local cache.
      //     </p>
      //   </div>
      // );
    } else if(!isLoading && !isPublicReposLoading && publicRepos.length == 0 && filteredContent.length == 0){
      return <EmptyState active={active}/>
      } else if (active==="Repos" & showBranches){
      console.log("filtered branches are", filteredBranches)
      const actionCards = [
        <BranchCard
            branchName="Pull requests"
            key={0}
            active={branchCursor == 0}
            handleCardClick={() => {
              setShouldScroll(true)
              setBranchCursor(num);
            }}
            pullRequest={true}
            shouldScroll={shouldScroll}
          />,
          <BranchCard
          branchName="Issues"
          key={1}
          active={branchCursor == 1}
          handleCardClick={() => {
            setShouldScroll(true)
            setBranchCursor(num);
          }}
          issues={true}
          shouldScroll={shouldScroll}
        />,
        <BranchCard
            branchName="Actions"
            key={2}
            active={branchCursor == 2}
            handleCardClick={() => {
              setShouldScroll(true)
              setBranchCursor(num);
            }}
            actions={true}
            shouldScroll={shouldScroll}
          />
      ]
      const branchCards = filteredBranches.map((branch, num) => {
        return (
          <BranchCard
            branchName={branch.name}
            key={num+3}
            active={branchCursor == num+3}
            handleCardClick={() => {
              setShouldScroll(true)
              setBranchCursor(num);
            }}
            shouldScroll={shouldScroll}
          />
        );
      });
      return [...actionCards, ...branchCards]
    } else if (active === "Repos") {
      // Repos
      return filteredContent.map((cont, num) => {
        let repo = {
          name: cont.name,
          source: cont.isOwnedByUser ? "individual" : "org",
          source_name: cont.ownedBy,
        };
        return (
          <RepoCard
            data={repo}
            key={num}
            active={cursor === num}
            handleCardClick={(name) => {
              console.log(cont.name, "clicked outer")
              handleBadgeUpdate()
              setShouldScroll(true)
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.name === name) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
            handleIssuesClick={() => {
              ipcRenderer.send('open-repo', cont.issues)
            }}
            handlePRClick={() => {
              ipcRenderer.send('open-repo', cont.pr)
            }}
            shouldScroll={shouldScroll}
          />
        );
      });
    } else if (active === "Issues") {
      //Issues
      console.log(content);
      return filteredContent.map((cont, num) => {
        let issue = {
          message: cont.title,
          status:
            cont.role === "author"
              ? "Opened"
              : cont.role === "assignee"
              ? "Assigned"
              : "Review",
          time: moment(cont.time).fromNow(),
          repo_name: cont.repo,
        };
        return (
          <IssueCard
            data={issue}
            key={num}
            active={cursor === num}
            handleCardClick={(msg) => {
              handleBadgeUpdate()
              setShouldScroll(true)
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.message === msg) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
            shouldScroll={shouldScroll}
          />
        );
      });
    } else if (active === "PRs") {
      // Prs
      return filteredContent.map((cont, num) => {
        let pr = {
          number: cont.number,
          message: cont.title,
          status:
            cont.role === "author"
              ? "Opened"
              : cont.role === "asignee"
              ? "Assigned"
              : "Review",
          time: moment(cont.time).fromNow(),
          repo_name: cont.repo,
        };
        // console.log(pr);
        return (
          <PRCard
            data={pr}
            key={num}
            active={cursor === num}
            handleCardClick={(msg) => {
              handleBadgeUpdate()
              setShouldScroll(true)
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.message === msg) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
            shouldScroll={shouldScroll}
          />
        );
      });
    }
  };

  const renderBranchRespository = () => {
    if (!showBranches) return
    const repo = getRepoWithCursor()
    if(repo){
      return (
        <RepoCard className="home-selected-repo"
            data={{
              name: repo.name,
              source: repo.isOwnedByUser ? "individual" : "org",
              source_name: repo.ownedBy,
            }}
            active={true}
            isStatic={true}
            handleCardClick={() => {}}
          />
      )
    }else{
      return (<></>)
    }
  };

  const renderPublicRepos = () => {
    if (active === "Repos" && !showBranches){
      if (text!="" && isPublicReposLoading){
        return (<Loader text="Fetching public repos"/>)
      }else if(publicRepos.length > 0){
        const cards = publicRepos.map((cont, num) => {
          let repo = {
            name: cont.name,
            source: cont.isOwnedByUser ? "individual" : "org",
            source_name: cont.ownedBy,
          };
          const index = filteredContent.length + num
          return (
            <RepoCard
              data={repo}
              key={index}
              active={cursor === index}
              handleCardClick={() => {
                setShouldScroll(true)
                setCursor(index)
              }}
              handleIssuesClick={() => {
              ipcRenderer.send('open-repo', cont.issues)
            }}
            handlePRClick={() => {
              ipcRenderer.send('open-repo', cont.pr)
            }}
              shouldScroll={shouldScroll}
            />
          );
        })
        return (
        <>
        <PublicResultsHeader/>
        {cards}
        </>
        )
      }
    }
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="home-container">
        <Header settings={true} from="/" sync={isSyncing}/>
        {console.log("Issue Badge going to nav", issue)}
        <div className="home-nav">
          <Nav
            currentTab={(tab) => {
              setActive(tab);
              setIsLoading(true);
            }}
            keyUpdate={active}
            issueBadgeCount={issue}
            repoBadgeCount={repo}
            prBadgeCount={pr}
            handleBadgeChange={handleBadgeUpdate}
          />
        </div>
        <div className="home-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="home-input"
            placeholder="Type and search private and public repos"
            value={text}
            onChange={(e) => {
              console.log(e);
              setText(e.target.value);
            }}
            autoFocus={true}
          />
        </div>
        {renderBranchRespository()}
        <div className="home-list">
          {renderCards()}
          {renderPublicRepos()}
        </div>
      </div>
    </>
  );
}
