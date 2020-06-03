import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "fs";

export interface FileResult {
  path: string,
  data: Uint8Array,
}

let win: BrowserWindow;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.

  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

app.allowRendererProcessReuse = true;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle("get-message", () => "electron");

ipcMain.handle("choose-file", async (event, path): Promise<FileResult | null> => {
  let opts: Electron.OpenDialogOptions = {
    filters: [
      {extensions: ["xml"], name: "XML files"}
    ],
    properties: ["openFile"]
  }
  const result = await dialog.showOpenDialog(win, opts);
  if (!result.canceled && result.filePaths.length > 0) {
    const fname = result.filePaths[0];
    console.log(fname);
    const data = fs.readFileSync(fname);
    return {
      path: fname,
      data
    }
  }
  return null;
});

ipcMain.handle("read-file", async (event, path): Promise<Uint8Array | null> => {
  if (typeof path === "string" && fs.existsSync(path)) {
    const data = fs.readFileSync(path);
    return data;
  }
  return null;
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.