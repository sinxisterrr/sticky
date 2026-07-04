import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';

let win: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setIgnoreMouseEvents(false);

  if (isDev) {
    win.loadURL(WEB_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(process.resourcesPath, 'web', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('set-always-on-top', (_, flag: boolean) => {
  win?.setAlwaysOnTop(flag, 'floating');
});

ipcMain.on('set-ignore-mouse', (_, ignore: boolean) => {
  win?.setIgnoreMouseEvents(ignore, { forward: true });
});
