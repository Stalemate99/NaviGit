import React, { useEffect, useRef } from "react";

import RepoPri from "../../assets/RepoPri.svg";
import RepoSec from "../../assets/RepoSec.svg";
import IssuePri from "../../assets/IssuePri.svg";
import IssueSec from "../../assets/IssueSec.svg";
import PRPri from "../../assets/PRPri.svg";
import PRSec from "../../assets/PRSec.svg";
import Org from "../../assets/Org.svg";
import Branch from "../../assets/Branch.svg";
import Individual from "../../assets/Host.svg";

export default function RepoCard({ active, data, handleCardClick }) {
  const { name, source, source_name } = data;
  const card = useRef(null);

  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      card.current.scrollIntoView();
    } else if (card.current && card.current.classList.contains("active") > -1) {
      card.current.classList.remove("active");
    }
    return card.current;
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
        <IssuePri />
        <PRPri />
      </>
    );
  }

  function renderActiveRepoSpecs() {
    return (
      <>
        <IssueSec />
        <PRSec />
      </>
    );
  }

  return (
    <div
      className="card-wrapper"
      ref={card}
      onClick={() => handleCardClick(name)}
    >
      <div className="card-type">{active ? <RepoSec /> : <RepoPri />}</div>
      <div className="card-content-repo">
        <p className="card-content-repo-name">{name}</p>
        <label className="card-content-repo-source">
          {renderRepoSource(source)}
        </label>
        <p className="card-content-repo-source-name">{source_name}</p>
      </div>
      <div className="card-specification">
        {active ? renderActiveRepoSpecs() : renderRepoSpecs()}
      </div>
    </div>
  );
}
