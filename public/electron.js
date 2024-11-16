const { app, BrowserWindow ,ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');

try {
  require('electron-reloader')(module, {});
} catch (_) {}


function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 如果需要，可以添加 preload.js
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
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

ipcMain.on('save-file', (event, data, fileChatReplaceMapArray, messageData) => {
  const fileChatReplaceMap=Object.entries(fileChatReplaceMapArray)
  console.log(fileChatReplaceMap);
  console.log(messageData);

  const uint8Array = new Uint8Array(data);
  const size = data.length;
  console.log("save-file");
  //
  // const fileInfoList = findChatIdBySize(size, fileChatReplaceMap);
  // if (fileInfoList.length > 1) {
  //   console.error("这里有bug，没有区分图片对应的会话");
  // }
  // const chatId=fileInfoList[0].id;
  // const fileName=fileInfoList[0].name;
  //
  // // 获取用户数据目录
  // const userDataPath = app.getPath('userData');
  // const filePath = path.join(userDataPath, fileName); // 这里可以根据需要构建文件名
  //
  // fs.writeFile(filePath, Buffer.from(uint8Array), (err) => {
  //   if (err) {
  //     console.log("Error saving file:", err);
  //     event.reply('save-file-response', { success: false, error: err });
  //   } else {
  //     console.log("File saved successfully to", filePath);
  //     const fileUrl = `file://${filePath}`;
  //     const newMessageMap = updateMessageMap(chatId, fileUrl, messageData);
  //     event.reply('save-file-response', { success: true, newMessageMap });
  //   }
  // });
});

function findChatIdBySize(size, fileChatReplaceMap) {
  const result = [];
  // 遍历 Map 中的每个条目

  fileChatReplaceMap.forEach((value, key) => {
    if (value.size === size) {
      // 如果 size 匹配，添加到结果数组中
      result.push({id: key, ...value});
    }
  });
  return result;
}

function updateMessageMap(chatId,fileUrl, messageData) {
  const newMessageMap = new Map(messageData);
  newMessageMap.forEach((messageArray,key)=>{
    messageArray.forEach(message=>{
      if(message.id===chatId){
        delete message.status;
        message.content={
          type:"image_url",
          image_url:{
            url:fileUrl
          }
        }
      }
    })
  });
  return newMessageMap;
}


