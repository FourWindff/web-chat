// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    // 只允许特定的频道
    const validChannels = ['save-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['save-file-response'];
    if (validChannels.includes(channel)) {
      // 在接收到消息时调用回调函数
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },

});
