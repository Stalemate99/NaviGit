import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Home from "./containers/Home";
import Help from "./containers/Help";
import Preferences from "./containers/Preferences";
import SignIn from "./containers/SignIn";
import Sync from "./containers/Sync";
import Settings from "./containers/Settings";
import Pat from "./containers/Pat";

import "./App.css";

export default function App() {
  const [signIn, setSignIn] = useState(false); // by default false - Changing to work with others
  // const [hotKey, setHotKey] = useState(
  //     JSON.parse(localStorage.getItem('hotkey') || '' )
  // )
  // const [help, setHelp] = useState(false)

  return (
    <>
      {signIn ? null : <Redirect to="/about" />}
      <Switch>
        <Route path="/settings" component={Settings} />
        <Route path="/pat" component={Pat} />
        <Route path="/sync" component={Sync} />
        <Route path="/signin" component={SignIn} />
        <Route path="/preferences" component={Preferences} />
        <Route path="/about" component={Help} />
        <Route exact path="/" component={Home} />
      </Switch>
    </>
  );
}
