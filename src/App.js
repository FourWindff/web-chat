import React, {useRef} from "react";
import ChatPage from "./componet/chatpage";
import styles from "./App.module.css";
import AuthPage from "./componet/authpage";
import {useState} from "react";

export default function App() {
    const [isLogin, setIsLogin] = useState(false);
    const currenUser = useRef({username: '', userid: ''});

    const handleLogin = (name, id) => {
        currenUser.current.username = name;
        currenUser.current.userid = id;
        setIsLogin(true);
    }
    return (

        <div className={styles.container}>
            {isLogin ?
                <ChatPage username={currenUser.current.username} userid={currenUser.current.userid}/>
                :
                <AuthPage onLogin={handleLogin}/>}
        </div>
    );
}
