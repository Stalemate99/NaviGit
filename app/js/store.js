import path from "path";
import fs from "fs";
const { remote } = window.require("electron");

class Store {
  constructor(opts = {}) {
    const userDataPath = remote.app.getPath("userData");
    opts.defaults = { username: null, repos: {}, issues: {}, pr: {} };
    this.path = path.join(userDataPath, "pref.json");
    this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    this.sync();
  }

  getSorted(key) {
    return Object.values(this.data[key]).sort((a, b) => b.visited - a.visited);
  }

  repoGet(key) {
    return this.data["repos"][key];
  }

  repoSet(key, value) {
    this.data["repos"][key] = value;
    this.registerVisited(this.data["repos"], key);
    this.sync();
  }

  issueSet(key, value) {
    this.data["issues"][key] = value;
    this.registerVisited(this.data["issues"], key);
    this.sync();
  }

  prSet(key, value) {
    this.data["pr"][key] = value;
    this.registerVisited(this.data["pr"], key);
    this.sync();
  }

  issueGet(key) {
    return this.data["issues"][key];
  }

  prGet(key) {
    return this.data["pr"][key];
  }

  registerVisited(obj, key) {
    if (!("visited" in obj[key])) {
      obj[key].visited = 0;
      return;
    }
  }

  markVisited(branch, key) {
    if (this.data[branch][key]) {
      this.data[branch][key].visited += 1;
    }
  }

  clear() {
    this.data = { username: null, repos: {}, issues: {}, pr: {} };
    this.sync();
  }

  sync() {
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
  get src() {
    return this.data;
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaults;
  }
}

export default Store;
