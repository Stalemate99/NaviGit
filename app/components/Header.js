import React from "react";
import { Redirect } from "react-router-dom";

import Logo from "../../assets/Logo.svg";
import LogoL from "../../assets/LogoL.svg";
import NaviGit from "../../assets/Navi-Git.svg";
import NaviGitL from "../../assets/Navi-Git-L.svg";
import Settings from "../../assets/Cog.svg";

export default function Header({ settings, from }) {
  return (
    <div className={settings ? "header-large" : "header"}>
      <div className="logo">{settings ? <Logo /> : <LogoL />}</div>
      <div className="title">{settings ? <NaviGit /> : <NaviGitL />}</div>
      <div className="settings">
        {settings && (
          <Settings
            onClick={() =>
              from === "/settings" ? (
                <Redirect to="/" />
              ) : (
                <Redirect to="/settings" />
              )
            }
          />
        )}
      </div>
    </div>
  );
}
