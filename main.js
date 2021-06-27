const { BrowserWindow, app, ipcMain, Tray, Menu, MenuItem, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let trayX,trayY = 0;

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

  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
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
    toggleView();
  });

  console.log(tray.getBounds());

  tray.on('click', (events, bound) => {

    const {x,y} = bound;
    trayX = x;
    trayY = y;
    
    // Toggling Visibility
    toggleView();

  })

})

function toggleView() {

  let x = trayX;
  let y = trayY;

  const { height, width } = mainWindow.getBounds();
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
}