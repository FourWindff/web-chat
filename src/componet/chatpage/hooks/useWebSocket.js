// src/hooks/useWebSocket.js

import {useEffect, useRef, useState} from "react";
import {INIT_FRIEND_LIST, INIT_OFFLINE_CHAT_LIST, LoginObject, SocketObject} from "../chatdata/SocketData";
import {messageData} from "../chatdata/historyMessage";

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
      socket.current.send(message);
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

  const saveFile = (data, fileChatReplaceMap, messageData) => {
    console.log("转换后的",Object.fromEntries(fileChatReplaceMap));
    console.log("转换后的",Object.fromEntries(messageData));
    window.electron.send('save-file', data, Object.fromEntries(fileChatReplaceMap), Object.fromEntries(messageData));
  }

  const handleSaveFileResponse = (event, response) => {
    if (response.success) {
      setMessageMap(response.newMessageMap);
      console.log("File saved and message map updated.");
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
        const chunk = new Uint8Array(data);
        //拼接
        receiveChunksRef.current.byteLength += chunk.byteLength;
        receiveChunksRef.current.array.push(...chunk);
        //组合
        if (chunk.byteLength < 1024 * 1024) {
          const result = receiveChunksRef.current.array;
          // saveFile(result, fileChatReplaceMapRef.current, messageData);
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

    // window.electron.receive('save-file-response', handleSaveFileResponse);

    // 组件卸载时清理连接
    return () => {
      ws.close();
      // window.electron.removeListener('save-file-response', handleSaveFileResponse);
    };

  }, [url, userId]); // 依赖 URL，URL 变化时重新连接

  return {
    isConnected: isConnected,
    closeWebSocket: closeWebSocket,
    sendMessage: sendMessage,
    sendBinary: sendBinary
  };

}








