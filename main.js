const {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  MenuItem,
  globalShortcut,
  screen,
  Dock,
} = require("electron");
const { platform } = require("os");
const path = require("path");

let mainWindow;
let tray;
let trayX,
  trayY = 0;

app.on("ready", () => {
  // app.dock.hide();
  mainWindow = new BrowserWindow({
    height: 632,
    width: 536,
    frame: false,
    show: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(
    true,
    process.platform === "win32" ? "screen-saver" : "floating",
    1
  );
  mainWindow.setFullScreenable(false);

  mainWindow.loadFile(`${__dirname}/app/index.html`);

  const iconName = process.platform === "win32" ? "icon.ico" : "Logo.png";
  const iconPath = path.join(__dirname, `/assets/${iconName}`);

  tray = new Tray(iconPath);
  tray.setToolTip("Navi~Git");

  const menu = new Menu();

  // app.dock.hide();

  // if (!mainWindow.isVisible()) {
  app.dock.show();
  //   mainWindow.showInactive();

  //   // And also hide it after a while
  //   setTimeout(() => {
  //     mainWindow.show();
  //     app.dock.hide();
  //   }, 1000);
  // }

  const isMac = process.platform === "darwin";

  const template = [
    {
      label: "Navi~Git",
      submenu: [
        {
          role: "quit",
        },
      ],
    },
    {
      label: "File",
      submenu: [isMac ? { role: "close" } : { role: "quit" }],
    },
    {
      label: "View",
      submenu: [{ role: "toggleDevTools" }],
    },

    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://electronjs.org");
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Setting up Global Shortcuts

  globalShortcut.register("CommandOrControl+I", () => {
    toggleView();
  });

  tray.on("click", (events, bound) => {
    const { x, y } = bound;
    trayX = x;
    trayY = y;

    // Toggling Visibility
    toggleView();
  });

  mainWindow.on("blur", (events, bound) => {
    // mainWindow.hide();
  });
});

function toggleView() {
  let x = trayX;
  let y = trayY;

  const { height, width } = mainWindow.getBounds();
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    const yPos = parseInt(screen.getPrimaryDisplay().workAreaSize.height / 5);
    const xPos = parseInt(
      screen.getPrimaryDisplay().workAreaSize.width / 2 - width / 2
    );

    mainWindow.setBounds({
      x: xPos,
      y: yPos,
      width: 536,
      height: 632,
    });

    mainWindow.show();
  }
}
