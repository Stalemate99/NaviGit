import React from "react";

import Header from "../components/Header";
import Button from "../components/Button";
import SampleCard from "../components/SampleCard";
import Nav from "../components/Nav";

import Repo from "../../assets/Repo.svg";
import Issue from "../../assets/Issue.svg";
import PR from "../../assets/PR.svg";

export default function Help() {
  return (
    <div className="help-container">
      <Header />
      <div className="help-subtitle">
        <p>
          Nice, now here's how you use navigit like a <span>pro !</span>
        </p>
      </div>
      <div className="help-content">
        <div className="help-gif-large"></div>
        <div className="help-hotkey-section">
          <p>
            Press your hotkey <span>CMD + G</span> to quickly open/ minimise
          </p>
        </div>
        <div className="help-gif"></div>
        <div className="help-tab-section"></div>
        <div className="help-button-next">
          <Button type="Finish" text="All right !" />
        </div>
      </div>
    </div>
  );
}
