const { app, BrowserWindow } = require('electron');


function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'), // 如果需要，可以添加 preload.js
      contextIsolation: true,

    },
  });

  win.loadURL('http://localhost:3000'); // 加载 React 应用
}

// 当 Electron 完全初始化并准备创建浏览器窗口时调用
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
