import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import Header from "../components/Header";

import Help from "./Help";
import ChangeHotkey from "../../assets/ChangeHotkey.svg";
import RetrySec from "../../assets/RetrySec.svg";
import Logout from "../../assets/Logout.svg";
import About from "../../assets/About.svg";
import Back from "../../assets/Back.svg";

export default function Settings() {
  const history = useHistory();
  const [help, setHelp] = useState(false)

  function handleSync() {}

  if(help){
    return (
      <Help closeTour={() => setHelp(false)} />
    )
  }


  return (
    <div className="settings-container">
      {/*  Implement Settings toggle logic!! */}
      <Header settings={true} from="/settings" />
      <div className="settings-header"> 
        <h2 className="settings-title">Settings</h2>
        <div className="settings-back" onClick={() => {history.goBack()}}>
          <Back></Back>
          <p>Back</p>
        </div>
      </div>
      <div className="settings-content">
        <div
          className="settings-content-item"
          onClick={() => history.push({
            pathname : "/preferences",
            state : "fromSettings"
          })}
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
          onClick={() => setHelp(true)}
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
