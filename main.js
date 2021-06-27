const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('path');

// const isDev = !app.isPackaged;

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // win.setMenu(null);

  win.loadFile('./app/index.html');

  win.once('ready-to-show', ()=> {
      win.show();
  });

}

app.whenReady().then(createWindow)