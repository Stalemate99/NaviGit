import React, { useEffect, useRef } from "react";

import BranchPri from "../../assets/BranchPri.svg";
import BranchSec from "../../assets/BranchSec.svg";

export default function BranchCard({ active, branchName, handleCardClick, isStatic = false }) {
  const card = useRef(null);

  useEffect(() => {
    if (active) {
      card.current.classList.add("active");
      if(!isStatic) card.current.scrollIntoView();
    } else if (card.current && card.current.classList.contains("active") > -1) {
      card.current.classList.remove("active");
    }
    // return card.current;
  });

  return (
    <div
      className="card-branch-wrapper"
      ref={card}
      onClick={() => handleCardClick(name)}
      style={
        isStatic? {
          background:'none'
        }: {}
      }
    >
        <div className="card-type">{active ? <BranchSec /> : <BranchPri />}</div>
        <p className="card-content-branch">{branchName}</p>
    </div>
  );
}
