import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import Header from "../components/Header";
import Button from "../components/Button";

import Keyboard from "../../assets/Keyboard.svg";
import Retry from "../../assets/Retry.svg";

export default function Preferences() {
  const [hotKey, setHotKey] = useState("");
  const history = useHistory();

  // useEffect(() => {
  //   let value = JSON.parse(localStorage.getItem("hotkey"));
  //   if (value != []) {
  //     setHotKey(value);
  //   }
  // }, []);

  useEffect(() => {
    // Listening for keypress
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  function handleKeyPress(e) {
    e.preventDefault();
    let key = e.code;
    // OS Exclusive change
    let OSName;
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
    if (key.includes("Meta")) {
      key = OSName === "Windows" || OSName === "Linux" ? "Win" : "Cmd";
    }

    // Control and Alt check
    if (key.includes("Alt")) {
      key = "Alt";
    }
    if (key.includes("Control")) {
      key = "Ctrl";
    }
    if (key.includes("Arrow")) {
      key = key.slice(5);
    }
    if (key.includes("Key")) {
      key = key.slice(3);
    }
    if (hotKey === "") {
      setHotKey(key);
    } else {
      setHotKey(hotKey + " + " + key);
    }
  }

  function handleGlobalShotcut() {
    // Set global shortcut
    localStorage.setItem("global", JSON.stringify(hotKey));
    history.push("/sync");
  }

  return (
    <div className="container-preferences">
      <Header />
      <div className="command">
        <div className="hotkey">
          <Keyboard style={{ cursor: "pointer" }} />
          <input
            className="commandText"
            type="text"
            onChange={(e) => setHotKey(e.target.value)}
            value={hotKey}
            placeholder="Recording your shortcut..."
          />
          <Retry onClick={() => setHotKey("")} style={{ cursor: "pointer" }} />
        </div>
        <div className="hint">
          <p>Record a keystroke shortcut to quickly open the app</p>
          <p>Example : Press CMD + G </p>
        </div>
        <div className="finish">
          <Button
            type="Finish"
            text="Finish"
            active={hotKey != "" ? true : false}
            eventCall={handleGlobalShotcut}
          />
        </div>
      </div>
    </div>
  );
}
