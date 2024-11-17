// preload.js
const {contextBridge, ipcRenderer} = require('electron');
const validChannels = ['save-file', 'save-file-response'];

contextBridge.exposeInMainWorld('electron', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  send: (channel, data, fileChatReplaceMap) => {
    // 只允许特定的频道
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data, fileChatReplaceMap);
    }
  },
  receive: (channel, func) => {
    if (validChannels.includes(channel)) {
      // 在接收到消息时调用回调函数
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
});
