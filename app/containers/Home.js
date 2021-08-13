import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Octokit } from "@octokit/core";
import Store from "../js/store";
import Navigit from "../js/navigit";
import moment from "moment";
import Fuse from 'fuse.js'

import Header from "../components/Header";
import Nav from "../components/Nav";
import RepoCard from "../components/RepoCard";
import BranchCard from "../components/BranchCard";
import PRCard from "../components/PRCard";
import IssueCard from "../components/IssueCard";


const { ipcRenderer } = window.require("electron");

const tabs = ["Repos", "PRs", "Issues"];
const store = new Store();

let pat = JSON.parse(localStorage.getItem("signin")).authKey;
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
  const [isLoading, setIsLoading] = useState(true)
  const [includeSearchResult, setIncludeSearchResult] = useState(0)
  const [showBranches, setShowBranches] = useState(false)
  const [branchCursor, setBranchCursor] = useState(0)
  const [branches, setBranches] = useState([])
  const inputRef = useRef(null);

  useEffect(() => {
    // Listening for keypress
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  useEffect(() => {
    if (active === "Repos") {
      const repos = store.getSorted("repos");
      console.log(repos);
      setContent(repos);
    } else if (active === "PRs") {
      const prs = store.getSorted("pr");
      console.log(prs);
      setContent(prs);
    } else if (active === "Issues") {
      const issues = store.getSorted("issues");
      console.log(issues);
      setContent(issues);
    } 
    setCursor(0);
    return () => {
      setContent([]);
    };
  }, [active]);

  // Debouncing text box
  useEffect(() => {
    const timer = setTimeout(() => {
      if(isInitialText){
        setIsInitialText(false)
      } else if(text.includes(':')){
        if (!showBranches) setShowBranches(true)
        fetchBranches(filteredContent[cursor].ownedBy, filteredContent[cursor].name);
      }else{
        if (showBranches) setShowBranches(false)
        filterContent()
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if(!includeSearchResult || active!="Repos" || text==="") return
    console.log("enters include search use effect")
    const timer = setTimeout(() => {
        (async () => {
          const searchText = text
          console.log("made a call bro with". searchText)
          const result = await navigit.search(searchText);
          if(inputRef.current.value===searchText){
            const data = [
              ...filteredContent,
              ...result
            ]
            setFilteredContent(data)
          }
        })()
    }, 200);

    return () => clearTimeout(timer);
  }, [includeSearchResult]);

  useEffect(() => {
    console.log("gonna filter content cause of content change")
      filterContent()
  }, [content]);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const result = await navigit.syncIssues()
  //     if(result) {
  //       console.log("issues fetched bro")
  //       if (active === "Issues") {
  //         const issues = store.getSorted("issues");
  //         setContent(issues)
  //       }
  //     }
  //   }, 5000)

  //   return () => clearInterval(interval)
  // })

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const result = await navigit.syncPR()
  //     if(result) {
  //       console.log("PRs fetched bro")
  //       if (active === "PRs") {
  //         const prs = store.getSorted("pr");
  //         setContent(prs)
  //       }
  //     }
  //   }, 5000)

  //   return () => clearInterval(interval)
  // })

  const filterContent = () => {
    if(text!=""){
      let keys = []
      if (active === "Repos") {
        keys = [
          "name",
          "ownedBy"
        ]
      } else if (active === "PRs") {
        keys = [
          "repo",
          "title"
        ]
      } else if (active === "Issues") {
        keys = [
          "repo",
          "title"
        ]
      }
      const options = {
        keys,
        threshold : 0.1
      };
      const fuse = new Fuse(content, options);
      // Change the pattern
      const pattern = text
      const data = fuse.search(pattern).map((val) => {
        return val['item']
      })
      setFilteredContent(data)
      if(data.length>0){
        setCursor(0)
      }
      console.log("gonna set include search result to true", includeSearchResult)
      setIncludeSearchResult(includeSearchResult+1)
    }else{
      setFilteredContent(content)
    }
    setIsLoading(false);
  }

  const fetchBranches = async (ownedBy, name) => {
    console.log("fetch branches of", ownedBy, name)
    const result = await navigit.searchBranches(ownedBy, name)
    setBranches(result)
    }


  const handleKeyPress = async (e) => {
    if (e.code === "Tab") {
      e.preventDefault();
      var i = tabs.indexOf(active);
      i = (i + 1) % 3;
      setIsLoading(true);
      setActive(tabs[i]);
    } else if (e.code.includes("Arrow")) {
      if (e.code.includes("Left")) {
        ipcRenderer.send("open-repo", filteredContent[cursor].issues);
        markVisited()

      } else if (e.code.includes("Right")) {
        ipcRenderer.send("open-repo", filteredContent[cursor].pr);
        markVisited()

      } else if (e.code.includes("Up")) {
        var index = (cursor - 1) % filteredContent.length;
        if (cursor == 0) {
          index = filteredContent.length - 1;
        }
        setCursor(index);
      } else {
        var index = (cursor + 1) % filteredContent.length;
        setCursor(index);
      }
    } else if (e.code.includes("Enter")) {
      markVisited()
      ipcRenderer.send("open-repo", filteredContent[cursor].url);
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
    console.log("inside markvisited", filteredContent[cursor])
    if(filteredContent[cursor].key){
      const branch = active === "Repos" ? "repos" : active == "PRs" ? "pr" : "issues"
      store.markVisited(branch, filteredContent[cursor].key)
    }
  }

  const renderCards = () => {
    // No content
    if (isLoading || content.length == 100) {
      return (
        <div className="home-nocontent-wrapper">
          <p>We couldn't fetch you the required data</p>
          <p>
            Use <span>Cmd + Enter</span> to search{" "}
            {active === "Repos"
              ? "github in general"
              : active === "PRs"
              ? "closed PRs"
              : "closed issues"}
          </p>
          <p>
            or open <span>settings</span> and sync to update local cache.
          </p>
        </div>
      );
    } else if (active==="Repos" & showBranches){
      return branches.map((branchName, num) => {
        return (
          <BranchCard
            branchName={branchName}
            key={num}
            active={branchCursor == num}
            handleCardClick={()=>{
              setBranchCursor(num)
            }
            }
          />      
        );
      })
    }else if (active === "Repos") {
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
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.name === name) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
          />
        );
      });
    } else if (active === "Issues") {
      //Issues
      console.log(content)
      return filteredContent.map((cont, num)=>{
        let issue = {
          message: cont.title,
          status: cont.role === "author"
          ? "Opened"
          : cont.role === "assignee"
          ? "Assigned"
          : "Review",
          time: moment(cont.time).fromNow(),
          repo_name: cont.repo,
        }
        return (
          <IssueCard
            data={issue}
            key={num}
            active={cursor === num}
            handleCardClick={(msg) => {
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.message === msg) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
          />
        );
      })
      
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
              setCursor(
                // content.reduce((cur, cont) => {
                //   if (cont.message === msg) cur = content.indexOf(cont);
                //   return cur;
                // }, 0)
                num
              );
            }}
          />
        );
      });
    }
  };

  const renderBranchRespository = () => {
    console.log('branch repo', filteredContent, cursor)
    if(filteredContent[cursor] && showBranches){
      return (
        <RepoCard className="home-selected-repo"
            data={{
              name: filteredContent[cursor].name,
              source: filteredContent[cursor].isOwnedByUser ? "individual" : "org",
              source_name: filteredContent[cursor].ownedBy,
            }}
            active={true}
            isStatic={true}
            handleCardClick={() => {}}
          />
      )
    }else{
      return (<></>)
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
        <Header settings={true} from="/" />
        <div className="home-nav">
          <Nav currentTab={
            (tab) => {
            setActive(tab)
            setIsLoading(true)
            }
            } keyUpdate={active} />
        </div>
        <div className="home-input-wrapper">
          <input ref={inputRef}
            type="text"
            className="home-input"
            placeholder="Type and search private and public repos"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus={true}
          />
        </div>
        {renderBranchRespository()}
        <div className="home-list">{renderCards()}</div>
      </div>
    </>
  );
}
