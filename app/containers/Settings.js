import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

import Header from "../components/Header";

import ChangeHotkey from "../../assets/ChangeHotkey.svg";
import RetrySec from "../../assets/RetrySec.svg";
import Logout from "../../assets/Logout.svg";
import About from "../../assets/About.svg";

export default function Settings() {
  const history = useHistory();

  function handleSync() {}

  return (
    <div className="settings-container">
      {/*  Implement Settings toggle logic!! */}
      <Header settings={true} from="/settings" />
      <h2 className="settings-title">Settings</h2>
      <div className="settings-content">
        <div
          className="settings-content-item"
          onClick={() => history.push("/preferences")}
        >
          <ChangeHotkey />
          <p className="settings-text">Change HotKey Trigger</p>
        </div>
        <div className="settings-content-item" onClick={handleSync}>
          <RetrySec />
          <p className="settings-text">Sync</p>
        </div>
        <div
          className="settings-content-item"
          onClick={() => history.push("/about")}
        >
          <About />
          <p className="settings-text">Re-visit the Navigit shortcuts</p>
        </div>
        <div
          className="settings-content-item"
          onClick={() => history.push("/signin")}
        >
          <Logout />
          <p className="settings-text">Logout</p>
        </div>
      </div>
    </div>
  );
}
