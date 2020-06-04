import { ipcMain, dialog, BrowserWindow } from "electron";
import * as fs from "fs";

export interface FileResult {
	path: string,
	data: Uint8Array,
  }

export const registerHandlers = (win: BrowserWindow) => {

	ipcMain.handle("get-message", () => "electron");

	ipcMain.handle("choose-file", async (event): Promise<FileResult | null> => {
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

	ipcMain.handle("save-file", async (event, path, data): Promise<string|null> => {
	if (typeof path !== "string") {
		return `Path argument must be string. Recieved: ${path}`;
	}
	try {
		if (fs.existsSync(path)) {
		// backup the existing file
		fs.copyFileSync(path, `${path}.bak`);
		}
		// write data
		fs.writeFileSync(path, data);
	} catch (err) {
		return err.message;
	}
	return null;
	})
}
