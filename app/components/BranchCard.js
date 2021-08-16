import React, { useEffect, useRef } from "react";

import BranchPri from "../../assets/BranchPri.svg";
import BranchSec from "../../assets/BranchSec.svg";
import RepoIssuesPri from "../../assets/RepoIssuesPri.svg";
import RepoIssuesSec from "../../assets/RepoIssuesSec.svg";
import RepoPRPri from "../../assets/RepoPRPri.svg";
import RepoPRSec from "../../assets/RepoPRSec.svg";
import RepoActionsPri from "../../assets/RepoActionsPri.svg";
import RepoActionsSec from "../../assets/RepoActionsSec.svg";



export default function BranchCard({ active, branchName, handleCardClick, pullRequest = false, issues = false, actions = false }) {
  const card = useRef(null);

  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      card.current.scrollIntoView();
    } else if (card.current && card.current.classList.contains("active") > -1) {
      card.current.classList.remove("active");
    }
    // return card.current;
  });

  const getIcon = () => {
    if (active){
      if(pullRequest) return <RepoPRSec/>
      else if(issues) return <RepoIssuesSec/>
      else if(actions) return <RepoActionsSec/>
      else return <BranchSec/>
    }else{
      if(pullRequest) return <RepoPRPri/>
      else if(issues) return <RepoIssuesPri/>
      else if(actions) return <RepoActionsPri/>
      else return <BranchPri/>
    }
  }

  return (
    <div
      className="card-branch-wrapper"
      ref={card}
      onClick={() => handleCardClick()}
    >
        <div className="card-type">{getIcon}</div>
        <p className="card-content-branch">{branchName}</p>
    </div>
  );
}
