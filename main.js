const {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
  screen,
  remote,
} = require("electron");
const path = require("path");
const open = require("open");
const { electron } = require("process");

let mainWindow;
let tray;
let trayX,
  trayY = 0;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    height: 632,
    width: 536,
    frame: false,
    show: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
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

  // Configuring Tray
  const iconName = "Logo.png"; // Irrespective of OS png works fine
  const iconPath = path.join(__dirname, `/assets/${iconName}`);

  tray = new Tray(iconPath);
  tray.setToolTip("Navi~Git");

  const isMac = process.platform === "darwin";

  const trayTemplate = [
    {
      label: "Quit",
      role: "quit",
    },
    {
      label: "Settings",
      click: () => {
        // Invoke event cycle to infrom UI to trigger settings route.
      },
      accelerator: "CommandOrControl+S",
    },
  ];

  tray.setContextMenu(Menu.buildFromTemplate(trayTemplate));

  // Configuring Application Menu
  const menuTemplate = [
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

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // Setting up Global Shortcuts
  globalShortcut.register("CommandOrControl+I", () => {
    toggleView();
  });

  // Tray event handlers
  tray.on("click", (events, bound) => {
    const { x, y } = bound;
    trayX = x;
    trayY = y;

    // Toggling Visibility
    toggleView();
  });

  // Close when focus is outside
  mainWindow.on("blur", (events, bound) => {
    mainWindow.hide();
    process.platform === "darwin" && app.dock.show();
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

// Handle IPC
ipcMain.on("Enter", async (event, data) => {
  console.log(data, "Inside Electron");
  // await open("https://sindresorhus.com");
  event.reply("Enter-reply", "Gotcha");
});
