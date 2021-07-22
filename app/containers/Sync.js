import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Octokit } from "@octokit/core";
import Store from "../js/store";
import Navigit from "../js/navigit";

import Header from "../components/Header";
import Button from "../components/Button";

export default function Sync() {
  const history = useHistory();

  const [sync, setSync] = useState(false);

  useEffect(async () => {
    let pat = JSON.parse(localStorage.getItem("signin")).authKey;
    const store = new Store();
    const octo = new Octokit({
      auth: pat,
    });
    const navigit = new Navigit(octo, store);
    setTimeout(async () => {
      try {
        await navigit.initialSetup();
        localStorage.setItem("sync", true);
        setSync(true);
        toast.success("Sync successsful", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (err) {
        toast.error("Unable to sync", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }, 5000);
    return () => {
      localStorage.removeItem("sync");
    };
  });

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="sync-container">
        <Header />
        <div className="sync-content">
          <p className="sync-subtitle">
            Importing your profile, repos, pr’s and issues
          </p>
          <div className="sync-buttons">
            <Button
              type="Continue"
              active={sync}
              text="Continue"
              eventCall={() => history.push("/")}
            />
            <Button
              type="Tour"
              text="Start tour"
              active={true}
              eventCall={() => history.push("/about")}
            />
          </div>
        </div>
        <div className="sync-footer">
          <p>In the meantime, take a quick tour and be back in a snap!</p>
        </div>
      </div>
    </>
  );
}
