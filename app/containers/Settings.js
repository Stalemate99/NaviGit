import React, { useEffect } from "react";

import Header from "../components/Header";

import ChangeHotkey from "../../assets/ChangeHotkey.svg";
import RetrySec from "../../assets/RetrySec.svg";
import Logout from "../../assets/Logout.svg";

export default function Settings() {
  return (
    <div className="settings-container">
      {/*  Implement Settings toggle logic!! */}
      <Header settings={true} />
      <h2 className="settings-title">Settings</h2>
      <div className="settings-content">
        <div className="settings-hotkey">
          <ChangeHotkey />
          <p className="settings-text">Change HotKey Trigger</p>
        </div>
        <div className="settings-preferences">
          <RetrySec />
          <p className="settings-text">Re-visit the Navigit shortcuts</p>
        </div>
        <div className="settings-logout">
          <Logout />
          <p className="settings-text">Logout</p>
        </div>
      </div>
    </div>
  );
}
