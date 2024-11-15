import React, {useState, useRef} from "react";
import {Chat, Typography, Notification} from "@douyinfe/semi-ui";
import styles from "./css/ChatPage.module.css";
import FriendList from "./FriendList";
import UserItem from "./UserItem";
import useWebSocket from "./hooks/useWebSocket";
import {messageData} from "./chatdata/historyMessage";
import VideoChat from "./video";
import {
  ChatMessageObject,
  SockChatList,
  SocketChatData,
  SocketFriendList,
  transformOfflineMessages
} from "./chatdata/SocketData";
import CustomInputRender from "./CustomInputRender";


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

const uploadProps = {
  action: '1',
  limit: 1,
  beforeUpload: () => {
    return false
  },
};
const uploadTipProps = {content: "自定义上传按钮提示信息"};
const SENDER = 0;
const RECEIVER = 1;


export default function ChatPage({username, userId, password, serverUrl}) {
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
      case "initFriendList":
        const socketFriendList = new SocketFriendList();
        Object.assign(socketFriendList, socketMessage);
        //设置好友列表
        const list = socketFriendList.friendList;
        setFriendList(list);
        //初始化聊天记录
        const existingUserIds = new Set(messageData.keys());
        list.forEach((user) => {
          if (!existingUserIds.has(user.userId)) {
            updateMessageMap(user.userId, {id: getId(), createAt: Date.now()});
          }
        });
        break;
      case "initOfflineChatList":
        //获取当前好友的所有聊天记录，接下来需要填充到messageMap
        const socketChatList=new SockChatList();
        Object.assign(socketChatList,socketMessage);
        const chatMessageList=socketChatList.chatRecordList;
        const newMessageMap = transformOfflineMessages(chatMessageList,messageData);
        setMessageMap(newMessageMap);
        break;
      case "textChat":
        const socketChatData = new SocketChatData();
        Object.assign(socketChatData, socketMessage);
        const content = socketChatData.content
        const createAt = socketChatData.createAt;
        const userId = socketChatData.sourceUserId;

        const newMessage = {
          role: "friend",
          id: getId(),
          content: content,
          createAt: createAt,
        };
        updateMessageMap(userId, newMessage);
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

  const {
    closeWebSocket,
    isConnected,
    sendMessage
  } = useWebSocket(serverUrl, userId, password, handleSocketMessage);

  const onMessageSend = (content, attachment) => {
    // if (attachment) {
    //   const file = attachment[0];
    //   const chunkSize = 1024 * 1024; // 每块 1MB
    //   let offset = 0;
    //
    //   // 读取文件块
    //   const reader = new FileReader();
    //   reader.onload = (event) => {
    //     if (event.target.readyState === FileReader.DONE) {
    //       // 发送数据块
    //       sendMessage(event.target.result);
    //
    //       // 继续发送下一块
    //       offset += chunkSize;
    //       if (offset < file.size) {
    //         readNextChunk();
    //       } else {
    //         console.log('File upload completed');
    //         sendMessage('EOF');  // 发送完成标识
    //       }
    //     }
    //   };
    //
    //   function readNextChunk() {
    //     const chunk = file.slice(offset, offset + chunkSize);
    //     reader.readAsArrayBuffer(chunk);
    //   }
    //
    //   readNextChunk();
    // }

    // 发送文本消息
    const chatDataJSON = new ChatMessageObject("textChat", userId, currentFriendId, Date.now(), content).parse2JSON();
    sendMessage(chatDataJSON);

  };

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
    //清理上一次的状态
    setIsVideoChatting(false);
    hasNotified.current = false;
    receiverMessageRef.current = [];
    senderMessageRef.current = [];
    LinkMode.current = SENDER;
    exchangeDataFunctionRef.current = null;
    console.log("camera is closed");
  }

  return (
    <div className={styles.chatPageContainer}>
      <div className={styles.sideBar}>
        <UserItem
          username={username}
          userid={userId}
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
            sourceUserId={userId}
            targetUserId={currentFriendId}
            sendMessage={sendMessage}
            onCancelClick={handleCloseCamera}
            receiverMessageRef={receiverMessageRef}
            ref={exchangeDataFunctionRef}
          />
          :
          <Chat
            className={styles.chat}
            renderInputArea={(props) => <CustomInputRender {...props} onOpenVideo={handleOpenCamera}/>}
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

// {
//   type:"textChat"
//   sourceUserId:"1393402",
//   targetUserId:"1393402",
//   createAt: Date.now(),
//   content:"你好"
// }
// {
//   type:"fileChat"
//   sourceUserId:"1393402",
//     targetUserId:"1393402",
//   createAt: Date.now(),
//   content:"oisdhfoi.jpg"
// }
// //发送文件时附带文件名
//
// //接收文本消息
// const content = socketMessage.data.content;
// const createAt = socketMessage.data.createAt;
// const sourceUserId = socketMessage.sourceUserId;
//
// const newMessage = {
//   role: "friend",
//   id: getId(),
//   content: content,
//   createAt: createAt,
// };
// updateMessageMap(userId, newMessage);
