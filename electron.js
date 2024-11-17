const {app, BrowserWindow, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const {type} = require("@testing-library/user-event/dist/type");
const isDevelopment = !app.isPackaged;
if (isDevelopment) {
  require('electron-reload')(path.join(__dirname, "build"));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 950,
    height: 600,
    resizable: false ,//禁止改变主窗口尺寸
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 如果需要，可以添加 preload.js
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadURL('http://localhost:3000'); // 加载 React 应用
  win.show();
}

// 当 Electron 完全初始化并准备创建浏览器窗口时调用
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('save-file', (event, data, fileChatReplaceMap) => {
  console.log(data);
  console.log(fileChatReplaceMap);

  const size = data.byteLength;
  console.log(size);

  // 确保路径存在
  const fileName = getFileNameBySize(size, fileChatReplaceMap);
  if(fileName){
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, "fileData"); // 这里可以根据需要构建文件名
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {recursive: true}); // 递归创建目录
    }
    const dataPath = path.join(filePath, fileName);

    fs.writeFile(dataPath, Buffer.from(data), (err) => {
      if (err) {
        console.log("Error saving file:", err);
        event.reply('save-file-response', {success: false, error: err});
      } else {
        console.log("File saved successfully to", dataPath);
        event.reply('save-file-response', {success: true});
      }
    });

  }else{
    console.log("fileName不存在");
  }


});

function getFileNameBySize(size, fileChatReplaceMap) {
  for (const [key, value] of fileChatReplaceMap) {
    if (value.size === size) {
      return value.fileName; // 找到匹配的 size，返回对应的 fileName
    }
  }
  return null; // 如果没有找到，返回 null
}


