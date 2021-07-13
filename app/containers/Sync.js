import React from "react";

import Header from "../components/Header";
import Button from "../components/Button";

export default function Sync() {
  return (
    <div className="sync-container">
      <Header />
      <div className="sync-content">
        <p className="sync-subtitle">
          Importing your profile, repos, pr’s and issues
        </p>
        <div className="sync-buttons">
          <Button type="Continue" active={false} text="Continue" />
          <Button type="Tour" text="Start tour" />
        </div>
      </div>
      <div className="sync-footer">
        <p>In the meantime, take a quick tour and be back in a snap!</p>
      </div>
    </div>
  );
}
