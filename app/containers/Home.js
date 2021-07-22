import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
const { ipcRenderer } = window.require("electron");

import Header from "../components/Header";
import Nav from "../components/Nav";
import RepoCard from "../components/RepoCard";
import PRCard from "../components/PRCard";
import IssueCard from "../components/IssueCard";

const repos = [
  {
    name: "addtocalendar-bower-packagedqweqweqweqweqwe",
    source: "org",
    source_name: "interviewstreet",
  },
  {
    name: "addtocalendar-bower-package",
    source: "org",
    source_name: "interviewstreet",
  },
  {
    name: "addtocalendar-bowers-package",
    source: "org",
    source_name: "interviewstreet",
  },
  {
    name: "addtocalendar-bowr-package",
    source: "org",
    source_name: "interviewstreet",
  },
];
const prs = [
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rail version 6 upgrade",
    status: "Assigned",
    time: "2 days back",
    number: 5,
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 6 upgrade",
    status: "Assigned",
    time: "2 days back",
    number: 5,
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 5 upgrade",
    status: "Assigned",
    time: "2 days back",
    number: 5,
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 6 upgrades",
    status: "Assigned",
    time: "2 days back",
    number: 5,
  },
];

const issues = [
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails versions 6 upgrade",
    status: "Assigned",
    time: "2 days back",
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 1 upgrade",
    status: "Assigned",
    time: "2 days back",
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 4 upgrade",
    status: "Assigned",
    time: "2 days back",
  },
  {
    repo_name: "interviewstreet / local_ops",
    message: "Rails version 44 upgrade",
    status: "Assigned",
    time: "2 days back",
  },
];

const tabs = ["Repos", "PRs", "Issues"];

export default function Home() {
  const [active, setActive] = useState(tabs[0]);
  const [content, setContent] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    // Listening for keypress
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  useEffect(() => {
    if (active === "Repos") {
      setContent(repos);
    } else if (active === "PRs") {
      setContent(prs);
    } else if (active === "Issues") {
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
      // Insert API calls
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  const handleKeyPress = async (e) => {
    if (e.code === "Tab") {
      e.preventDefault();
      var i = tabs.indexOf(active);
      i = (i + 1) % 3;
      setActive(tabs[i]);
    } else if (e.code.includes("Arrow")) {
      if (e.code.includes("Left")) {
        // setCursor((cursor - 1)%3)
      } else if (e.code.includes("Right")) {
        // setCursor((cursor + 1)%3)
      } else if (e.code.includes("Up")) {
        var index = (cursor - 1) % content.length;
        if (cursor == 0) {
          index = content.length - 1;
        }
        setCursor(index);
      } else {
        var index = (cursor + 1) % content.length;
        setCursor(index);
      }
    } else if (e.code.includes("Enter")) {
      ipcRenderer.send("Enter", content[cursor].name);
      ipcRenderer.once("Enter-reply", (e, data) => {
        console.log(data, "From Main Process");
      });
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

  const renderCards = () => {
    // No content
    if (content.length == 0) {
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
    } else if (active === "Repos") {
      // Repos
      return repos.map((repo, num) => {
        return (
          <RepoCard
            data={repo}
            key={num}
            active={cursor === num}
            handleCardClick={(name) => {
              setCursor(
                content.reduce((cur, cont) => {
                  if (cont.name === name) cur = content.indexOf(cont);
                  return cur;
                }, 0)
              );
            }}
          />
        );
      });
    } else if (active === "Issues") {
      // Issues
      return issues.map((issue, num) => {
        return (
          <IssueCard
            data={issue}
            key={num}
            active={cursor === num}
            handleCardClick={handleClick}
          />
        );
      });
    } else if (active === "PRs") {
      // Prs
      return prs.map((pr, num) => {
        return (
          <PRCard
            data={pr}
            key={num}
            active={cursor === num}
            handleCardClick={(msg) => {
              setCursor(
                content.reduce((cur, cont) => {
                  if (cont.message === msg) cur = content.indexOf(cont);
                  return cur;
                }, 0)
              );
            }}
          />
        );
      });
    }
  };

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
          <Nav currentTab={(tab) => setActive(tab)} keyUpdate={active} />
        </div>
        <div className="home-input-wrapper">
          <input
            type="text"
            className="home-input"
            placeholder="Type and search private and public repos"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus={true}
          />
        </div>
        <div className="home-list">{renderCards()}</div>
      </div>
    </>
  );
}
