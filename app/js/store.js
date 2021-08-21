import path from "path";
import fs from "fs";
const { remote } = window.require("electron");

class Store {
  constructor(opts = {}) {
    const userDataPath = remote.app.getPath("userData");
    opts.defaults = { username: null, repos: {}, issues: {}, pr: {} };
    this.path = path.join(userDataPath, "pref.json");
    console.log(this.path);
    console.log(this.path);
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
  }

  issueSet(key, value) {
    this.data["issues"][key] = value;
    this.registerVisited(this.data["issues"], key);
  }

  prSet(key, value) {
    this.data["pr"][key] = value;
    this.registerVisited(this.data["pr"], key);
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

  registerTime(isIssue, id, time) {
    const access = isIssue ? "issues" : "pr";
    this.data[access][id].time = time;
  }

  markVisited(branch, key) {
    console.log(arguments,"heou")
    if (this.data[branch][key]) {
      this.data[branch][key].visited += 1;
      console.log(this.data[branch][key])

    }
    this.sync();
  }

  clear() {
    this.data = { username: null, repos: {}, issues: {}, pr: {} };
    this.sync();
  }

  sync(localDump, name) {
    if(localDump){
      if(name=="repos"){
        Object.keys(localDump["repos"]).forEach((key)=>{
          this.repoSet(key, localDump["repos"][key])
        })  
      } else if (name=="pr"){
        this.data[name] = {}
        Object.keys(localDump["pr"]).forEach((key)=>{
          this.prSet(key, localDump["pr"][key])
        })
      }else if (name == "issues"){
        this.data[name] = {}
        Object.keys(localDump["issues"]).forEach((key)=>{
          this.issueSet(key, localDump["issues"][key])
        });
      }
    }
   
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    return true;
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
