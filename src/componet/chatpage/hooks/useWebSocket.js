// src/hooks/useWebSocket.js

import {useEffect, useRef, useState} from "react";
import {INIT_FRIEND_LIST, INIT_OFFLINE_CHAT_LIST, LoginObject, SocketObject} from "../chatdata/SocketData";

export default function useWebSocket(url, userId, password, onSocketMessage) {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // 发送消息函数
  const sendMessage = (message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(message);
      console.log("Socket sending message:", JSON.parse(message))
    } else {
      console.log("WebSocket is not open.");
    }
  };
  const closeWebSocket = () => {
    if (socket.current) {
      socket.current.close();
    }
  }

  useEffect(() => {
    // 初始化 WebSocket 连接
    const ws = new WebSocket(url);

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
      const receivedMessage = JSON.parse(event.data);
      console.log("Socket Received Message:", receivedMessage);
      onSocketMessage(receivedMessage)
    };

    // 连接关闭时
    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    socket.current = ws;

    // 组件卸载时清理连接
    return () => {
      ws.close();
    };

  }, [url, userId]); // 依赖 URL，URL 变化时重新连接

  return {closeWebSocket, isConnected, sendMessage};
}
