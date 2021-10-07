import React, { useEffect, useRef } from "react";

import PRPri from "../../assets/PRPri.svg";
import PRSec from "../../assets/PRSec.svg";
import PlusOnePri from "../../assets/PlusOnePri.svg";
import PlusOneSec from "../../assets/PlusOneSec.svg";
import MentionedPri from "../../assets/MentionPri.svg";
import MentionedSec from "../../assets/MentionSec.svg";
import OpenPri from "../../assets/OpenPri.svg";
import OpenSec from "../../assets/OpenSec.svg";
import AssignedPri from "../../assets/IdPri.svg";
import AssignedSec from "../../assets/IdSec.svg";
import Pending from "../../assets/Pending.svg";

export default function Card({ data, active, handleCardClick, shouldScroll = true }) {
  const { number = 1, message, status, time, repo_name = "kq" } = data;
  const card = useRef();

  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      if(shouldScroll) card.current.scrollIntoView();
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
      <div className="card-pr-type">
        <div className="card-type-icon">{active ? <PRSec /> : <PRPri />}</div>
        <p
          className={
            active ? "card-pr-type-number-active" : "card-pr-type-number"
          }
        >
          # {" " + number}
        </p>
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
