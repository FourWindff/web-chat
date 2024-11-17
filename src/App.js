import React, {useEffect, useRef} from "react";
import ChatPage from "./componet/chatpage";
import styles from "./App.module.css";
import AuthPage from "./componet/authpage";
import {useState} from "react";
import {LoginObject, SocketAuthData, RegisterObject} from "./componet/chatpage/chatdata/SocketData";


const defaultServerAddress = "ws://localhost:8081/chat";
const LOGIN_SUCCESS = 100;
const LOGIN_FAILURE = 101;
const REGISTER_SUCCESS = 200;
const REGISTER_FAILURE = 201;


export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const currenUser = useRef(null);
  const serverUrl = useRef(null);
  const websocket = useRef(null);
  const [reConnect,setReConnect] = useState(0);


  useEffect(() => {
    const ws = new WebSocket(defaultServerAddress);
    websocket.current = ws;
    ws.onopen = () => {
      console.log("成功连上服务器");
    }
    // 接收消息时
    ws.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      const socketAuthData = new SocketAuthData();
      Object.assign(socketAuthData, receivedMessage);

      console.log("Socket Received Message:", receivedMessage);
      if (socketAuthData.statusCode === LOGIN_SUCCESS || socketAuthData.statusCode === REGISTER_SUCCESS) {
        currenUser.current = {
          username: socketAuthData.username,
          userId: socketAuthData.userId,
        }
        ws.close();
        setIsLogin(true);
      }
      if (socketAuthData.statusCode === LOGIN_FAILURE) {
        alert("登录失败，请检查帐号或者密码是否错误");
      }
      if (socketAuthData.statusCode === REGISTER_FAILURE) {
        alert("注册失败，帐号已存在");
      }
    };

    ws.onerror = () => {
      console.log("连接发送错误")
    }

    return () => {
      ws.close();
      websocket.current = null;
    }
  }, [reConnect])

  const handleLogin = (values) => {
    const serverAddress = values.serverAddress;
    const userId = values.userId;
    const password = values.password;

    serverUrl.current = serverAddress;

    console.log(`用户id：${userId} 密码: ${password} 尝试连接: ${serverAddress}`);
    if (websocket.current.readyState === WebSocket.OPEN) {
      const loginJSON = new LoginObject(userId, password).parse2JSON()
      websocket.current.send(loginJSON);
    }else{
      console.log("连接服务器失败");

      setReConnect(pre=>pre+1);
    }
  }
  const handleRegister = (values) => {
    const serverAddress = values.serverAddress;
    const username = values.username;
    const userId = values.userId;
    const password = values.password;

    serverUrl.current = serverAddress;
    console.log(`用户名: ${username} 用户id：${userId} 密码: ${password} 尝试注册: ${serverAddress}`);

    if (websocket.current.readyState === WebSocket.OPEN) {
      const registerJSON = new RegisterObject(userId, username, password).parse2JSON();
      websocket.current.send(registerJSON);
    }else{
      console.log("连接服务器失败");
      setReConnect(pre=>pre+1);
    }
  }


  return (

    <div className={styles.container}>
      {isLogin ?
        <ChatPage username={currenUser.current.username}
                  userId={currenUser.current.userId}
                  serverUrl={serverUrl.current}/>
        :
        <AuthPage onLogin={handleLogin}
                  onRegistry={handleRegister}
                  defaultServerAddress={defaultServerAddress}/>}
    </div>
  );
}
