const crypto = require('crypto');

// 生成 AES 密钥
function generateAESKey() {
  // 选择密钥长度（128、192 或 256 位）
  const keyLength = 32; // 256 位
  const key = crypto.randomBytes(keyLength); // 生成随机字节

  // 将密钥转换为 Base64 字符串
  const base64Key = key.toString('base64');

  console.log("Generated AES Key (Base64):", base64Key);
  return key; // 返回生成的密钥
}

// 调用函数生成 AES 密钥
generateAESKey();
