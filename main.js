const { BrowserWindow, app, ipcMain, Tray, Menu, MenuItem, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let tray = "nothing";

app.on('ready', ()=> {

  mainWindow = new BrowserWindow({
    height: 400,
    width: 300,
    frame: false,
    show: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname,'preload.js')
    }
  });

  mainWindow.loadFile(`${__dirname}/app/index.html`);

  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon-128.png';
  const iconPath = path.join(__dirname,`/assets/${iconName}`);

  tray = new Tray(iconPath);
  tray.setToolTip("Cruize");

  const menu = new Menu();

  // Setting up Browser Shortcuts.

  menu.append(new MenuItem({
    label: 'Electron',
    submenu: [{
      role: 'help',
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
      click: () => { 
          console.log("Quitting Electron Tray Application...");
          app.quit();
       }
    }]
  }));

  Menu.setApplicationMenu(menu);

  // Setting up Global Shortcuts

  globalShortcut.register('CommandOrControl+I', () => {
    console.log('Electron loves global shortcuts!');
  });

  tray.on('click', (events, bound) => {

    const {x,y} = bound;
    const { height, width } = mainWindow.getBounds();

    // Toggling Visibility

    if(mainWindow.isVisible()){
      mainWindow.hide();
    } else {

      const yPos = process.platform === 'darwin' ? y : (y - height);
      const xPos = x - parseInt(width / 2);

      mainWindow.setBounds({
        x: xPos, y: yPos, width: 300, height: 400
      });

      mainWindow.show();

    }

  })

})