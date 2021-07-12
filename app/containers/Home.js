import React, { useState } from "react";

import useKey from "../utility/useKey";

import Header from "../components/Header";
import Nav from "../components/Nav";
import RepoCard from "../components/RepoCard";
import PRCard from "../components/PRCard";
import IssueCard from "../components/IssueCard";

const DOWN_ARROW = "ArrowDown";
const UP_ARROW = "ArrowUp";
const TAB = "Tab";
const ENTER = "Enter";

export default function Home() {
  const [active, setActive] = useState("Repos");
  const [cursor, setCursor] = useState(0);
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
      name: "addtocalendar-bower-package",
      source: "org",
      source_name: "interviewstreet",
    },
    {
      name: "addtocalendar-bower-package",
      source: "org",
      source_name: "interviewstreet",
    },
  ];
  const prs = [
    {
      repo_name: "interviewstreet / local_ops",
      message: "Rails version 6 upgrade",
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
      message: "Rails version 6 upgrade",
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
  ];

  const issues = [
    {
      repo_name: "interviewstreet / local_ops",
      message: "Rails version 6 upgrade",
      status: "Assigned",
      time: "2 days back",
    },
    {
      repo_name: "interviewstreet / local_ops",
      message: "Rails version 6 upgrade",
      status: "Assigned",
      time: "2 days back",
    },
    {
      repo_name: "interviewstreet / local_ops",
      message: "Rails version 6 upgrade",
      status: "Assigned",
      time: "2 days back",
    },
    {
      repo_name: "interviewstreet / local_ops",
      message: "Rails version 6 upgrade",
      status: "Assigned",
      time: "2 days back",
    },
  ];

  function handleEnter(event) {
    console.log("ENter is pressed", event);
  }

  useKey("Enter", handleEnter);

  const renderCards = () => {
    if (active === "Repos") {
      return repos.map((repo, num) => {
        return <RepoCard data={repo} key={num} active={num === 0 && true} />;
      });
    } else if (active === "Issues") {
      return issues.map((issue, num) => {
        return <IssueCard data={issue} key={num} active={num === 0 && true} />;
      });
    } else if (active === "PR's") {
      return prs.map((pr, num) => {
        return <PRCard data={pr} key={num} active={num === 0 && true} />;
      });
    }
  };

  return (
    <div className="home-container">
      <Header settings={true} from="/" />
      <div className="home-nav">
        <Nav currentTab={(tab) => setActive(tab)} />
      </div>
      <div className="home-input-wrapper">
        <input
          type="text"
          className="home-input"
          defaultValue="Type and search private and public repos"
        />
      </div>
      <div className="home-list">{renderCards()}</div>
    </div>
  );
}
