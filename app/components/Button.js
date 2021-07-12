import React, { useState } from "react";

import Git from "../../assets/Git.svg";
import GitHover from "../../assets/GitHover.svg";
import Next from "../../assets/Next.svg";
import NextHover from "../../assets/NextHover.svg";
import Flag from "../../assets/Flag.svg";
import Pirate from "../../assets/Pirate.svg";

export default function Button({ type, text }) {
  const [hover, setHover] = useState(false);

  if (type === "Git") {
    return (
      <button
        onMouseLeave={() => setHover(false)}
        onMouseEnter={() => setHover(true)}
        className="button"
      >
        <label>{hover ? <GitHover /> : <Git />}</label>
        <p style={{ color: "white", marginLeft: "0.5em" }}>{text}</p>
      </button>
    );
  }

  if (type === "Finish") {
    return (
      <button
        onMouseLeave={() => setHover(false)}
        onMouseEnter={() => setHover(true)}
        className="button-finish"
      >
        <label>{hover ? <NextHover /> : <Next />}</label>
        <p style={{ color: "white", fontSize: "25px" }}>{text}</p>
        {text !== "All right !" && (
          <label>
            <Flag />
          </label>
        )}
      </button>
    );
  }

  if (type === "Help") {
    return (
      <button
        onMouseLeave={() => setHover(false)}
        onMouseEnter={() => setHover(true)}
        className="button-help"
      >
        {hover ? <NextHover /> : <Next />}

        <p style={{ color: "white", fontSize: "25px" }}>{text}</p>
        <label>
          <Pirate />
        </label>
      </button>
    );
  }

  return <button className="button">{text}</button>;
}
