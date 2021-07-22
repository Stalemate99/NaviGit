import React, { useState } from "react";
import PRSec from "../../assets/PRSec.svg";

import Header from "../components/Header";
import Button from "../components/Button";

import RepoSec from "../../assets/RepoSec.svg";
import IssueSec from "../../assets/IssueSec.svg";
import { useHistory } from "react-router-dom";

export default function Help() {
  const [page, setPage] = useState(1);

  const history = useHistory();

  function renderSubtitle() {
    if (page === 1) {
      return (
        <p>
          Nice, now here's how you use navigit like a <span>pro !</span>
        </p>
      );
    } else if (page === 2) {
      return <p>One more tutorial screen and your free!</p>;
    } else if (page === 3) {
      return <p>To being a lazy sloth forever 🍻</p>;
    }
  }

  function renderContent() {
    if (page === 1) {
      return (
        <div className="help-page-wrapper">
          <div className="help-gif-large"></div>
          <p>
            Press your hotkey <span>CMD + G</span> to quickly open/ minimise
          </p>
          <div className="help-gif"></div>
          <p>
            Press <span>Tab</span> to quickly switch tabs between issues, pr and
            repos
          </p>
          <div className="help-page-button">
            <Button
              type="Finish"
              text="All right !"
              active={true}
              eventCall={() => setPage(2)}
            />
          </div>
        </div>
      );
    } else if (page === 2) {
      return (
        <div className="help-page-wrapper">
          <div className="help-gif-large"></div>
          <div className="help-page2-hints">
            <p>
              On <span>selecting</span> a repo :
            </p>
            <p>
              Pressing Enter opens the repo{" "}
              <label>
                <RepoSec />
              </label>{" "}
            </p>
            <p>
              Pressing Left arrow opens the Issues{" "}
              <label>
                <IssueSec />
              </label>{" "}
            </p>
            <p>
              Pressing right arrow opens the pull requests{" "}
              <label>
                <PRSec />
              </label>{" "}
            </p>
          </div>
          <div className="help-page-button">
            <Button
              type="Finish"
              text="okay, next"
              active={true}
              eventCall={() => setPage(3)}
            />
          </div>
        </div>
      );
    } else if (page === 3) {
      return (
        <div className="help-page-wrapper">
          <div className="help-gif-large"></div>
          <div className="help-page2-hints">
            <p>
              Press <span>colon</span> button on any selection to browse and
              jump to any branch of the repo
            </p>
          </div>
          <div className="help-page-button">
            <Button
              type="Help"
              text="Aye Aye"
              active={true}
              eventCall={() => history.push("/sync")}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="help-container">
      <Header settings={true} />
      <div className="help-subtitle">{renderSubtitle()}</div>
      <div className="help-content">{renderContent()}</div>
    </div>
  );
}
