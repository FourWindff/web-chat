const LOGIN = "login";
const REGISTER = "register";
const TEXT_CHAT = "textChat";
const FILE_CHAT = "fileChat";
const LINK = "link";
const INIT_FRIEND_LIST = "initFriendList";
const INIT_OFFLINE_CHAT_LIST = "initOfflineChatList";
const ADD_FRIEND_OFFER = "addFriendOffer";
const ADD_FRIEND_SUCCESS = "addFriendSuccess";
const ADD_FRIEND_FAIL = "addFriendFail";


export {
  LOGIN,
  REGISTER,
  TEXT_CHAT,
  FILE_CHAT,
  LINK,
  INIT_FRIEND_LIST,
  INIT_OFFLINE_CHAT_LIST,
  ADD_FRIEND_OFFER,
  ADD_FRIEND_SUCCESS,
  ADD_FRIEND_FAIL


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
  constructor(type, sourceUserId, targetUserId, createAt, content, size) {
    this.type = type;
    this.sourceUserId = sourceUserId;
    this.targetUserId = targetUserId;
    this.createAt = createAt;
    //当type为textChat时 content为字符串
    //当type为fileChat时 content为文件名
    this.content = content;
    this.size = size;
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
class SocketChatData {
  constructor(type, sourceUserId, targetUserId, createAt, content, size) {
    this.type = type;
    this.sourceUserId = sourceUserId;
    this.targetUserId = targetUserId;
    this.createAt = createAt;
    //当type为textChat时 content为字符串
    //当type为fileChat时 content为文件名
    this.content = content;
    this.size = size;
  }
}

//当用户上线时开始处理离线时为接收的消息
function transformOfflineMessages(chatRecordList, messageData, fileChatToReplaceRef) {
  console.log("离线时未接收的消息", chatRecordList);
  console.log("此时", messageData);
  const updatedMap = new Map(messageData);

  chatRecordList.forEach((chatRecord) => {
    const {senderId, messageType, messageContent, createAt, size} = chatRecord;
    const senderRole = 'friend';

    //未接收消息为文本
    if (messageType === TEXT_CHAT) {
      const senderMessage = {
        role: senderRole,
        id: getId(),
        createAt: createAt,
        content: messageContent,
      };
      updatedMap.has(senderId) ?
        updatedMap.get(senderId).push(senderMessage) :
        updatedMap.set(senderId, [senderMessage]);
    }
    //未接收消息为文件记录（不是文件本体）
    if (messageType === FILE_CHAT) {
      const id = getId();
      const senderFileMessage = {
        role: senderRole,
        id: id,
        createAt: createAt,
        content:`文件：${messageContent}`
      }
      fileChatToReplaceRef.current.set(id, {fileName: messageContent, size: size})
      updatedMap.has(senderId) ?
        updatedMap.get(senderId).push(senderFileMessage) :
        updatedMap.set(senderId, [senderFileMessage]);
    }
  })
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