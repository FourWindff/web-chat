// src/hooks/useWebSocket.js

import {useEffect, useRef, useState} from "react";
import {INIT_FRIEND_LIST, INIT_OFFLINE_CHAT_LIST, LoginObject, SocketObject} from "../chatdata/SocketData";
import {messageData} from "../chatdata/historyMessage";
import CryptoJS from 'crypto-js';

const secretKey = 'QQnLh2njgXra91fz/5BF6/Rz26/jLUG495h1gllUpMA=';

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}


function concatenateArrayBuffers(arrayBuffers) {
  // 计算所有 ArrayBuffer 的总字节长度
  const totalLength = arrayBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);

  // 创建一个新的 ArrayBuffer
  const resultBuffer = new ArrayBuffer(totalLength);
  const resultView = new Uint8Array(resultBuffer);

  let offset = 0;

  // 将每个 ArrayBuffer 的内容复制到新的 ArrayBuffer 中
  for (const buffer of arrayBuffers) {
    const view = new Uint8Array(buffer);
    resultView.set(view, offset);
    offset += view.byteLength;
  }
  console.log(resultBuffer);

  return resultBuffer;
}

export default function useWebSocket(
  url,
  userId,
  password,
  onSocketMessage,
  fileChatReplaceMapRef,
  setMessageMap
) {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const receiveChunksRef = useRef({byteLength: 0, array: []});

  // 发送消息函数
  const sendMessage = (message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(encryptData(message));
      console.log("Socket sending message:", JSON.parse(message))
    } else {
      console.log("WebSocket is not open.");
    }
  };

  const sendBinary = (binary) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(binary);
      console.log("Socket sending message:", binary)
    } else {
      console.log("WebSocket is not open.");
    }
  }

  const closeWebSocket = () => {
    if (socket.current) {
      socket.current.close();
    }
  }

  const saveFile = (data, fileChatReplaceMap) => {
    // 发送消息到主进程
    window.electron.send(
      'save-file',
      data,
      fileChatReplaceMap,
    )
  }

  const handleSaveFileResponse = (response) => {
    if (response.success) {
      console.log("File saved ");
    } else {
      console.error("Failed to save file:", response.error);
    }
  }

  useEffect(() => {
    // 初始化 WebSocket 连接
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    // 连接打开时
    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      //登录
      sendMessage(new LoginObject(userId, password).parse2JSON());
      //好友列表
      sendMessage(new SocketObject(userId, null, null, INIT_FRIEND_LIST).parse2JSON());
      //聊天记录
      sendMessage(new SocketObject(userId, null, null, INIT_OFFLINE_CHAT_LIST).parse2JSON());
    };
    // 接收消息时
    ws.onmessage = (event) => {
      const data = event.data;
      if (data instanceof Blob) {
        alert("Received binary data as Blob");
        // 处理 Blob 数据
      } else if (data instanceof ArrayBuffer) {
        console.log("Received binary data as ArrayBuffer", data);
        console.log("文件替换队列：", fileChatReplaceMapRef.current);
        //拼接
        receiveChunksRef.current.byteLength += data.byteLength;
        receiveChunksRef.current.array.push(data);
        //组合
        if (data.byteLength < 1024 * 1024) {
          const totalLength=receiveChunksRef.current.byteLength
          console.log(totalLength);
          console.log("文件接收完毕",totalLength);
          const result=concatenateArrayBuffers(receiveChunksRef.current.array);
          saveFile(result, fileChatReplaceMapRef.current, messageData);
          receiveChunksRef.current.byteLength=0;
          receiveChunksRef.current.array=[];

        }
        // 处理 ArrayBuffer 数据
      } else if (typeof data === "string") {
        const receivedMessage = JSON.parse(data);
        console.log("Socket Received Message:", receivedMessage);
        onSocketMessage(receivedMessage);
      }
    };
    // 连接关闭时
    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    socket.current = ws;

    window.electron.receive('save-file-response', handleSaveFileResponse);

    // 组件卸载时清理连接
    return () => {
      ws.close();
      window.electron.removeListener('save-file-response', handleSaveFileResponse);
    };

  }, [url, userId]); // 依赖 URL，URL 变化时重新连接

  return {
    isConnected: isConnected,
    closeWebSocket: closeWebSocket,
    sendMessage: sendMessage,
    sendBinary: sendBinary
  };

}








