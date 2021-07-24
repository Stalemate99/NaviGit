import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Octokit } from "@octokit/core";
import Store from "../js/store";
import Navigit from "../js/navigit";
import moment from "moment";

import Header from "../components/Header";
import Nav from "../components/Nav";
import RepoCard from "../components/RepoCard";
import PRCard from "../components/PRCard";
import IssueCard from "../components/IssueCard";

const { ipcRenderer } = window.require("electron");

const tabs = ["Repos", "PRs", "Issues"];
const store = new Store();
const octo = new Octokit({
  auth: JSON.parse(localStorage.getItem("signin")).authKey,
});
const navigit = new Navigit(octo, store);

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
      const repos = store.getSorted("repos");
      console.log(repos);
      setContent(repos);
    } else if (active === "PRs") {
      const prs = store.getSorted("pr");
      console.log(prs);
      setContent(prs);
    } else if (active === "Issues") {
      // const issues = store.getSorted("issues");
      // console.log(issues);
      // setContent(issues);
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
        ipcRenderer.send("open-repo", content[cursor].issues);
      } else if (e.code.includes("Right")) {
        ipcRenderer.send("open-repo", content[cursor].pr);
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
      ipcRenderer.send("open-repo", content[cursor].url);
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
      return content.map((cont, num) => {
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
      // return issues.map((issue, num) => {
      //   return (
      //     <IssueCard
      //       data={issue}
      //       key={num}
      //       active={cursor === num}
      //       handleCardClick={handleClick}
      //     />
      //   );
      // });
    } else if (active === "PRs") {
      // Prs
      return content.map((cont, num) => {
        let pr = {
          number: cont.number,
          message: cont.title,
          status:
            cont.role === "author"
              ? "Opened"
              : cont.role === "asignee"
              ? "Assigned"
              : "Review",
          time: moment(cont.created).fromNow(),
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
