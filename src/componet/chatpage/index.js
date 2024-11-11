import React, {useState, useCallback, useEffect, useRef} from "react";
import {Chat, Button, Typography, Notification} from "@douyinfe/semi-ui";
import styles from "./css/ChatPage.module.css";
import FriendList from "./FriendList";
import UserItem from "./UserItem";
import useWebSocket from "./hooks/useWebSocket";
import {messageData} from "./chatdata/historyMessage";
import {IconCamera,} from "@douyinfe/semi-icons";
import VideoChat from "./video";
import {SocketObject} from "./chatdata/SocketData";


const roleInfo = {
    user: {
        name: "user",
        avatar:
            "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png",
    },
    friend: {
        name: "friend",
        avatar:
            "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png",
    },
    system: {
        name: "System",
        avatar:
            "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png",
    },
};

function getId() {
    return crypto.randomUUID();
}

const uploadProps = {action: "https://api.semi.design/upload"};
const uploadTipProps = {content: "自定义上传按钮提示信息"};
const SENDER = 0;
const RECEIVER = 1;

function CustomInputRender({onOpenVideo, ...props}) {
    const {defaultNode} = props;
    return (
        <div className={styles.inputContainer}>
            <div
                style={{
                    border: "1px solid var(--semi-color-border)",
                    borderRadius: "16px",
                    margin: "0px -5px 0px 5px",
                    padding: "10px"
                }}
            >
                <Button
                    icon={<IconCamera size="large" style={{color: "#1f1f1f"}} onClick={onOpenVideo}/>}
                    theme="borderless"
                />
            </div>
            <div style={{flex: 1}}>{defaultNode}</div>
        </div>
    );
}

export default function ChatPage({username, userid}) {
    const [messageMap, setMessageMap] = useState(messageData);
    const [friendList, setFriendList] = useState([]);
    const [isVideoChatting, setIsVideoChatting] = useState(false);
    const [currentFriendId, setCurrentFriendId] = useState("0");

    const LinkMode = useRef(SENDER);
    const currentMessages = messageMap.get(currentFriendId) || [];

    const receiverMessageRef = useRef([]);
    const senderMessageRef = useRef([]);

    const exchangeDataFunctionRef = useRef(null);
    const hasNotified = useRef(false);

    const handleSocketMessage = (socketMessage) => {
        if (socketMessage === null) {
            return;
        }
        switch (socketMessage.type) {
            case "login":
                break;
            case "init":
                //初始化好友列表
                const list = socketMessage.data;
                setFriendList(list);
                const existingUserIds = new Set(messageData.keys());
                //初始化聊天记录
                list.forEach((user) => {
                    if (!existingUserIds.has(user.userid)) {
                        updateMessageMap(user.userid, {id: getId()});
                    }
                });
                break;
            case "chat":
                const content = socketMessage.data;
                const userid = socketMessage.sourceUserId;
                const newMessage = {
                    role: "friend",
                    id: getId(),
                    content: content,
                };
                updateMessageMap(userid, newMessage);
                break;
            case "link":
                //设置当前会话角色是发送方还是接收方
                if (socketMessage.data?.type === "offer") {
                    LinkMode.current = RECEIVER;
                }
                //当前是发送方，发送方已经显示了视频窗口所以可以使用VideoChat暴露的方法
                if (LinkMode.current === SENDER) {
                    //当前是发送方
                    if (socketMessage.data) {
                        senderMessageRef.current.push(socketMessage.data)
                    } else {
                        const list = senderMessageRef.current;
                        exchangeDataFunctionRef.current.handleAsSender(list);
                    }
                }
                //当前接收方,目前视频窗口还没有显示出来，所以需要先存起来
                if (LinkMode.current === RECEIVER) {
                    if (socketMessage.data) {
                        receiverMessageRef.current.push(socketMessage.data);
                        //先把offer和ice先存起来再提醒当前存在用户连接请求
                    } else {
                        const {Text} = Typography;
                        let opts = {
                            title: '有人想和你视频聊天',
                            content: (
                                <>
                                    <div>来自：{socketMessage.sourceUserId}</div>
                                    <div style={{marginTop: 8}}>
                                        <Text link onClick={() => {
                                            handleOpenCamera();
                                            setCurrentFriendId(socketMessage.sourceUserId);
                                            hasNotified.current = true;
                                        }}>查看</Text>
                                    </div>
                                </>
                            ),
                            duration: 5,
                        }
                        Notification.info(opts);
                    }

                }
                break;
            default:
                console.log("未知的消息类型");
                break;
        }
    }
    const {isConnected, sendMessage} = useWebSocket("ws://localhost:3001/ws", userid, handleSocketMessage);

    const onMessageSend = (content, attachment) => {
        sendMessage(new SocketObject(userid, currentFriendId, content, 'chat').parse2JSON());
    }

    const onChatsChange = (chats) => {
        updateMessageMap(currentFriendId, chats[chats.length - 1]);
    }

    const handleFriendSelect = (id) => {
        setCurrentFriendId(id);
    };

    const updateMessageMap = (conversationId, newMessage) => {
        setMessageMap((prevMessageMap) => {
            // 创建 `Map` 的副本
            const updatedMap = new Map(prevMessageMap);

            // 获取现有的消息数组，如果不存在则创建一个空数组
            const conversationMessages = updatedMap.get(conversationId) || [];

            // 在副本上更新消息数组
            updatedMap.set(conversationId, [...conversationMessages, newMessage]);

            // 返回更新后的 Map
            return updatedMap;
        });
    };

    const handleOpenCamera = () => {
        setIsVideoChatting(true);
        console.log("camera is opened");
    }

    const handleCloseCamera = () => {
        setIsVideoChatting(false);
        hasNotified.current = false;
        console.log("camera is closed");
    }

    const renderInputArea = useCallback((props) => {
        return <CustomInputRender {...props} onOpenVideo={handleOpenCamera}/>;
    }, []);

    return (
        <div className={styles.chatPageContainer}>
            <div className={styles.sideBar}>
                <UserItem
                    username={username}
                    userid={userid}
                    isConnected={isConnected}
                />
                <FriendList
                    friendList={friendList}
                    onSelectFriend={handleFriendSelect}
                />
            </div>
            <div className={styles.chatContainer}>
                {isVideoChatting ?
                    <VideoChat
                        sourceUserId={userid}
                        targetUserId={currentFriendId}
                        sendMessage={sendMessage}
                        onCancelClick={handleCloseCamera}
                        receiverMessageRef={receiverMessageRef}
                        ref={exchangeDataFunctionRef}
                    />
                    :
                    <Chat
                        className={styles.chat}
                        renderInputArea={renderInputArea}
                        uploadProps={uploadProps}
                        chats={currentMessages}
                        roleConfig={roleInfo}
                        uploadTipProps={uploadTipProps}
                        onChatsChange={onChatsChange}
                        onMessageSend={onMessageSend}
                    />
                }
            </div>
        </div>
    );
}
