import React, { useEffect, useRef } from "react";

import RepoPri from "../../assets/RepoPri.svg";
import IssuePri from "../../assets/IssuePri.svg";
import PRPri from "../../assets/PRPri.svg";
import Org from "../../assets/Org.svg";
import Branch from "../../assets/Branch.svg";
import Individual from "../../assets/Host.svg";

export default function RepoCard({ active, data, handleCardClick, handlePRClick, handleIssuesClick, isStatic = false, shouldScroll = true, num}) {
  const { name, source, source_name } = data;
  const card = useRef(null);

  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      if(!isStatic && shouldScroll) card.current.scrollIntoView();
    } else if (card.current && card.current.classList.contains("active") > -1) {
      card.current.classList.remove("active");
    }
    // return card.current;
  });

  function renderRepoSource(source) {
    if (source === "org") {
      return <Org />;
    }

    if (source === "branch") {
      return <Branch />;
    }

    if (source === "individual") {
      return <Individual />;
    }
  }

  function renderRepoSpecs() {
    return (
      <>
        
      </>
    );
  }

  function renderActiveRepoSpecs() {
    return (
      <>
        <IssueSec onClick={(e) => {
          e.stopPropagation()
          if(handleIssuesClick) handleIssuesClick()
        }} />
        <PRSec onClick={(e) => {
          if (handlePRClick) {
          e.stopPropagation()
            handlePRClick()
          }
        }}/>
      </>
    );
  }

  console.log("rendered card",num)
  return (
    <div

      className="card-wrapper"
      ref={card}
      onClick={() => handleCardClick(name)}
      style={
        isStatic? {
          background:'none'
        }: {}
      }
    >
      <div className="card-type svg">{<RepoPri />}</div>
      <div className="card-content-repo">
        <p className="card-content-repo-name">{name}</p>
        <label className="card-content-repo-source">
          {renderRepoSource(source)}
        </label>
        <p className="card-content-repo-source-name">{source_name}</p>
      </div>
      <div className="card-specification svg">
        <IssuePri onClick={(e) => {
            e.stopPropagation()
            if(handleIssuesClick) handleIssuesClick()
          }} />
      <PRPri onClick={(e) => {
        if (handlePRClick) {
          e.stopPropagation()
          handlePRClick()
        }
      }}/>
      </div>
    </div>
  );
}
