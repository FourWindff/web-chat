import React, {useEffect, useRef} from "react";
import ChatPage from "./componet/chatpage";
import styles from "./App.module.css";
import AuthPage from "./componet/authpage";
import {useState} from "react";
import {LoginObject, SocketAuthData, RegisterObject} from "./componet/chatpage/chatdata/SocketData";


const LOGIN_SUCCESS = 100;
const LOGIN_FAILURE = 101;
const REGISTER_SUCCESS = 200;
const REGISTER_FAILURE = 201;

//ws://172.16.89.241:8081/chat
export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const currenUser = useRef(null);
  const formRef = useRef(null);
  const websocket = useRef(null);

  const [serverAddress, setServerAddress] = useState("");
  const [reConnect, setReConnect] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [tipText, setTipText] = useState("");


  useEffect(() => {
    const ws = new WebSocket(serverAddress);
    websocket.current = ws;
    ws.onopen = () => {
      console.log("成功连上服务器");
      setIsConnected(true);
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
        setTipText("登录失败，请检查帐号或者密码是否错误");
      }
      if (socketAuthData.statusCode === REGISTER_FAILURE) {
        setTipText("注册失败，帐号已存在");
      }
    };
    ws.onerror = () => {
      setTipText("当前尚未连接服务器")
    }
    ws.onclose = () => {
      setIsConnected(false);
    }

    return () => {
      ws.close();
      websocket.current = null;
    }
  }, [reConnect, serverAddress])

  const handleLogin = (values) => {
    const userId = values.userId;
    const password = values.password;

    console.log(`用户id：${userId} 密码: ${password} 尝试连接: ${serverAddress}`);
    if (websocket.current.readyState === WebSocket.OPEN) {
      const loginJSON = new LoginObject(userId, password).parse2JSON()
      websocket.current.send(loginJSON);
    } else {
      console.log("连接服务器失败");
      setReConnect(pre => pre + 1);
    }
  }

  const handleRegister = (values) => {
    const username = values.username;
    const userId = values.userId;
    const password = values.password;

    console.log(`用户名: ${username} 用户id：${userId} 密码: ${password} 尝试注册: ${serverAddress}`);

    if (websocket.current.readyState === WebSocket.OPEN) {
      const registerJSON = new RegisterObject(userId, username, password).parse2JSON();
      websocket.current.send(registerJSON);
    } else {
      console.log("连接服务器失败");
      setReConnect(pre => pre + 1);
    }
  }

  const handleLink = () => {
    if (formRef.current) {
      const value = formRef.current.formApi.getValue('serverAddress');
      setServerAddress(value);
      if (value === serverAddress) {
        setReConnect(pre => pre + 1);
      }
    }
  }

  return (

    <div className={styles.container}>
      {isLogin ?
        <ChatPage username={currenUser.current.username}
                  userId={currenUser.current.userId}
                  password={currenUser.current.password}
                  serverUrl={serverAddress}
        />
        :
        <AuthPage onLogin={handleLogin}
                  onRegistry={handleRegister}
                  onLink={handleLink}
                  formRef={formRef}
                  disabled={!isConnected}
                  tip={tipText}
        />
      }
    </div>
  );
}
