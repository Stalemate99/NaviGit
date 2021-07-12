import React, { useState } from "react";

import GitN from "../../assets/GitN.svg";
import Issue from "../../assets/Issue.svg";
import PR from "../../assets/PR.svg";

export default function Nav({ currentTab }) {
  const [active, setActive] = useState("Repos");

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

  return (
    <div className="bg">
      <div
        style={active === "Issues" ? style.active : style.normal}
        onClick={() => {
          currentTab("Issues");
          setActive("Issues");
        }}
      >
        <label>
          <div className="centerIcon">
            <Issue />
          </div>
        </label>
        Issues
        <label>
          <div className="badge">1</div>
        </label>
      </div>
      <div
        style={active === "Repos" ? style.active : style.normal}
        onClick={() => {
          currentTab("Repos");
          setActive("Repos");
        }}
      >
        <label>
          <div className="centerIcon">
            <GitN />
          </div>
        </label>
        Repos
        <label>
          <div className="badge">1</div>
        </label>
      </div>
      <div
        style={active === "PR's" ? style.active : style.normal}
        onClick={() => {
          currentTab("PR's");
          setActive("PR's");
        }}
      >
        <label>
          <div className="centerIcon">
            <PR />
          </div>
        </label>
        PR's
        <label>
          <div className="badge">1</div>
        </label>
      </div>
    </div>
  );
}
