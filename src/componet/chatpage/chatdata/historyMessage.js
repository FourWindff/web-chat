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
    ],
    [
      "1",
      [
        {
          role: "friend",
          id: "1",
          createAt: 1715676751919,
          content: "我是韦淇凯",
        },
        {
          role: "user",
          id: "2",
          createAt: 1715676751919,
          content: "我在的",
        },
      ],
    ],
    [
      "2",
      [
        {
          role: "friend",
          id: "1",
          createAt: 1715676751919,
          content: "我是陈梓欣",
        },
      ],
    ],
  ]);

function getMessageById(userid) {
  return messageData.get(userid);
}

export {getMessageById, messageData} 



