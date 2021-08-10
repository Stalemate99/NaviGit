import React, { useEffect, useRef } from "react";

import IssuePri from "../../assets/IssuePri.svg";
import IssueSec from "../../assets/IssueSec.svg";
import PlusOnePri from "../../assets/PlusOnePri.svg";
import PlusOneSec from "../../assets/PlusOneSec.svg";
import MentionedPri from "../../assets/MentionPri.svg";
import MentionedSec from "../../assets/MentionSec.svg";
import OpenPri from "../../assets/OpenPri.svg";
import OpenSec from "../../assets/OpenSec.svg";
import AssignedPri from "../../assets/IdPri.svg";
import AssignedSec from "../../assets/IdSec.svg";
import Pending from "../../assets/Pending.svg";

export default function Card({ data, active, handleCardClick }) {
  const { message, status, time, repo_name } = data;
  const card = useRef();

  
  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      card.current.scrollIntoView();
    } else if (card.current && card.current.classList.contains("active") > -1) {
      card.current.classList.remove("active");
    }
    // return card.current;
  });

  function renderIcon() {
    if (status === "Review") {
      return <>{active ? <PlusOneSec /> : <PlusOnePri />}</>;
    } else if (status === "Assigned") {
      return <>{active ? <AssignedSec /> : <AssignedPri />}</>;
    } else if (status === "Opened") {
      return <>{active ? <OpenSec /> : <OpenPri />}</>;
    } else if (status === "Mentioned") {
      return <>{active ? <MentionedSec /> : <MentionedPri />}</>;
    }
  }

  return (
    <div
      className="card-wrapper"
      ref={card}
      onClick={() => handleCardClick(message)}
    >
      <div className="card-type">
        <div className="card-type-icon">
          {active ? <IssueSec /> : <IssuePri />}
        </div>
      </div>
      <div className="card-content-pr">
        <div className="card-content-pr-repo-name">{repo_name}</div>
        <div className="card-content-pr-message">{message}</div>
        <label className="card-content-pr-status">
          <Pending />
          <p className="card-content-pr-status-message">{status}</p>
        </label>
        <p className="card-content-pr-time">{"- " + time}</p>
      </div>
      <div className="card-specification">{renderIcon()}</div>
    </div>
  );
}
