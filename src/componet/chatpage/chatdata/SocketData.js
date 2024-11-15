const LOGIN = "login";
const REGISTER = "register";
const TEXT_CHAT = "textChat";
const FILE_CHAT = "fileChat";
const INIT_FRIEND_LIST = "initFriendList";
const INIT_OFFLINE_CHAT_LIST = "initOfflineChatList";

export {
  LOGIN,
  REGISTER,
  TEXT_CHAT,
  FILE_CHAT,
  INIT_FRIEND_LIST,
  INIT_OFFLINE_CHAT_LIST
}

function getId() {
  return crypto.randomUUID();
}

//通用发送数据载体
class SocketObject {
  constructor(sourceUserId, targetUserId, data, type) {
    this.sourceUserId = sourceUserId;
    this.targetUserId = targetUserId;
    this.type = type;//init chat file link login
    this.data = data;
  }

  parse2JSON() {
    return JSON.stringify({
      sourceUserId: this.sourceUserId,
      targetUserId: this.targetUserId,
      type: this.type,
      data: this.data,
    });
  }

}

//发送登录数据载体
class LoginObject {
  constructor(sourceUserId, password) {
    this.type = LOGIN;
    this.sourceUserId = sourceUserId;
    this.password = password;
  }

  parse2JSON() {
    return JSON.stringify(this);
  }
}

//发送注册数据载体
class RegisterObject {
  constructor(sourceUserId, username, password) {
    this.type = REGISTER;
    this.sourceUserId = sourceUserId;
    this.username = username;
    this.password = password;
  }

  parse2JSON() {
    return JSON.stringify(this);
  }
}

//发送聊天数据载体
class ChatMessageObject {
  constructor(type, sourceUserId, targetUserId, createAt, content) {
    this.type = type;
    this.sourceUserId = sourceUserId;
    this.targetUserId = targetUserId;
    this.createAt = createAt;
    //当type为textChat时 content为字符串
    //当type为fileChat时 content为文件名
    this.content = content;
  }

  parse2JSON() {
    return JSON.stringify(this);
  }
}

//接收认证结果载体
class SocketAuthData {
  constructor(type, statusCode, message, username, userId, password) {
    this.type = type;
    this.statusCode = statusCode;
    this.message = message;
    this.username = username;
    this.userId = userId;
    this.password = password;
  }
}
//接收好友列表载体
class SocketFriendList {
  constructor(type, userId, friendList) {
    this.type = type;
    this.userId = userId;
    this.friendList = friendList;
  }
}
//接收用户聊天记录
class SockChatList {
  constructor(type, chatList) {
    this.type = type;
    this.chatRecordList = chatList;
  }
}
//接收聊天信息
class SocketChatData{
  constructor(type, sourceUserId, targetUserId, createAt, content) {
    this.type = type;
    this.sourceUserId = sourceUserId;
    this.targetUserId = targetUserId;
    this.createAt = createAt;
    //当type为textChat时 content为字符串
    //当type为fileChat时 content为文件名
    this.content = content;
  }
}

function transformOfflineMessages(chatRecordList, messageData) {
  const updatedMap = new Map(messageData);


  chatRecordList.forEach((chatRecord) => {
    const { senderId, messageType, messageContent, createAt} = chatRecord;
    const senderRole = 'friend';

    // 判断发送者和接收者角色，并为它们创建消息
    if(messageType===TEXT_CHAT){

    }
    if(messageType===FILE_CHAT){

    }
    const senderMessage = {
      role: senderRole,
      id: getId(),
      createAt: createAt || Date.now(), // 使用消息的创建时间，如果没有，则使用当前时间
      content: messageContent,
    };

    // 将消息按发送者ID和接收者ID存入Map
    if (!updatedMap.has(senderId)) {
      updatedMap.set(senderId, []);
    }
    updatedMap.get(senderId).push(senderMessage);

  });
  return updatedMap;
}


export {
  SocketObject,
  LoginObject,
  RegisterObject,
  ChatMessageObject,

  SocketAuthData,
  SocketChatData,
  SocketFriendList,
  SockChatList,
  transformOfflineMessages,

};