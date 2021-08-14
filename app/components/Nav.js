import React, { useState, useEffect } from "react";

import GitN from "../../assets/GitN.svg";
import Issue from "../../assets/Issue.svg";
import PR from "../../assets/PR.svg";

export default function Nav({
  currentTab,
  keyUpdate = "Repos",
  issueBadgeCount = 0,
  prBadgeCount = 0,
  repoBadgeCount = 0,
}) {
  const [issueBadge, setIssueBadge] = useState(issueBadgeCount);
  const [repoBadge, setRepoBadge] = useState(repoBadgeCount);
  const [prBadge, setPrBadge] = useState(prBadgeCount);

  const style = {
    active: {
      background: "#69CC8E",
      boxShadow: "0px 14px 50px 26px rgba(0, 0, 0, 0.3)",
      borderRadius: "52px",
      width: "100%",
      height: "90%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      cursor: "pointer",
      fontWeight: "700",
    },
    normal: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      cursor: "pointer",
    },
  };

  useEffect(() => {
    if (keyUpdate === "Issues") {
      setIssueBadge(0);
    } else if (keyUpdate === "Repos") {
      setRepoBadge(0);
    } else if (keyUpdate === "PRs") {
      setPrBadge(0);
    }
  }, [keyUpdate]);

  return (
    <div className="bg">
      <div
        style={keyUpdate === "Issues" ? style.active : style.normal}
        onClick={() => {
          currentTab("Issues");
          setIssueBadge(0);
        }}
      >
        <label>
          <div className="centerIcon">
            <Issue />
          </div>
        </label>
        Issues
        {issueBadge !== 0 ? (
          <label>
            <div className="badge">{issueBadge}</div>
          </label>
        ) : null}
      </div>
      <div
        style={keyUpdate === "Repos" ? style.active : style.normal}
        onClick={() => {
          currentTab("Repos");
          setRepoBadge(0);
        }}
      >
        <label>
          <div className="centerIcon">
            <GitN />
          </div>
        </label>
        Repos
        {repoBadge !== 0 ? (
          <label>
            <div className="badge">{repoBadge}</div>
          </label>
        ) : null}
      </div>
      <div
        style={keyUpdate === "PRs" ? style.active : style.normal}
        onClick={() => {
          currentTab("PRs");
          setPrBadge(0);
        }}
      >
        <label>
          <div className="centerIcon">
            <PR />
          </div>
        </label>
        PR's
        {prBadge !== 0 ? (
          <label>
            <div className="badge">{prBadge}</div>
          </label>
        ) : null}
      </div>
    </div>
  );
}
