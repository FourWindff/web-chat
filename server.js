
const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 3001});

let connectedClientsCount = 0; // 初始化连接人数为0
const user = [
    {username: "wqk", userid: "1"},
    {username: "czx", userid: "2"},
    {username: "zqh", userid: "3"},
    {username: "lsc", userid: "4"},
];

const friendList = [
    {userid: "1", list: ["2", "3", "4"]},
    {userid: "2", list: ["1", "3", "4"]},
    {userid: "3", list: ["2", "1", "4"]},
    {userid: "4", list: ["2", "3", "1"]},
];

function getFriendsByUserId(userid) {
    const friendIds = friendList.find((friend) => friend.userid === userid)?.list;
    if (!friendIds) {
        return [];
    }
    return user.filter((u) => friendIds.includes(u.userid));
}

wss.on("connection", (ws) => {
    console.log("A user connected");
    connectedClientsCount++; // 增加连接人数

    // 在首次收到消息时分配socket的ID
    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        console.log("Received message", parsedMessage);
        const type = parsedMessage.type;

        const sourceUserId = parsedMessage.sourceUserId;
        const targetUserId = parsedMessage?.targetUserId;

        //为每个连接分配一个连接（客户自己的连接）
        if (!ws.userid && sourceUserId) {
            ws.userid = sourceUserId;
            console.log(`User ${ws.userid} has connected`);
        }

        if (type === "init") {
            //客户端第一次登录，获取用户列表
            const list = getFriendsByUserId(sourceUserId);
            ws.send(JSON.stringify({type: "init", data: list}));
        } else if (type === "chat" || type==="link") {
            // 向好友发送消息
            wss.clients.forEach((client) => {
                const isFriend = friendList
                    .find((friend) => friend.userid === ws.userid)
                    ?.list.includes(client.userid);
                if (
                    isFriend && // 确保是好友关系
                    client.readyState === WebSocket.OPEN && // 确保连接打开
                    client.userid === targetUserId // 只发送给目标用户
                ) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        }
    });

    ws.on("close", () => {
        console.log(`User ${ws.userid} disconnected`);
        connectedClientsCount--; // 减少连接人数
        console.log(
            `Current number of connected clients: ${connectedClientsCount}`
        );
    });
});

setInterval(() => {
    console.log(
        `${new Date()} Current number of connected clients: ${connectedClientsCount}`
    );
}, 2000); // 每2秒打印一次连接人数

console.log("WebSocket server is running on ws://localhost:3001");
