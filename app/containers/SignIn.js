import React from "react";

import Header from "../components/Header";
import Button from "../components/Button";

export default function SignIn() {
  return (
    <div className="container-signin">
      <Header />
      <div className="main">
        <p className="subtitle">
          Navigate around git without leaving your keyboard
        </p>
        <div className="signin">
          <Button type="Git" text="Sign in with GitHub" />
        </div>
      </div>
    </div>
  );
}
