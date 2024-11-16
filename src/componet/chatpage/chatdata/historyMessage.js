const messageData = new Map([
  [
    "0",
    [
      {
        role: "system",
        id: "1",
        createAt: 1715676751919,
        content: "welecome to web-chat",
      },
    ],
  ]
]);

function getMessageById(userid) {
  return messageData.get(userid);
}

export {getMessageById, messageData} 



