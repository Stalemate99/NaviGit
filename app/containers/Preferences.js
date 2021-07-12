import React from "react";

import Header from "../components/Header";
import Button from "../components/Button";

import Keyboard from "../../assets/Keyboard.svg";
import Retry from "../../assets/Retry.svg";

export default function Preferences() {
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
            defaultValue="Recording your shortcut..."
          />
          <Retry onClick={() => setHotKey("")} style={{ cursor: "pointer" }} />
        </div>
        <div className="hint">
          <p>Record a keystroke shortcut to quickly open the app</p>
          <p>Example : Press CMD + G </p>
        </div>
        <div className="finish">
          <Button type="Finish" text="Finish" />
        </div>
      </div>
    </div>
  );
}
