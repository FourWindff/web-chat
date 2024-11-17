const crypto = require('crypto');

// 生成一个 16 字节的随机密钥（128 位）
const key128 = crypto.randomBytes(16).toString('hex'); // 以十六进制字符串表示
console.log("Generated 128-bit Key:", key128);

// 生成一个 24 字节的随机密钥（192 位）
const key192 = crypto.randomBytes(24).toString('hex');
console.log("Generated 192-bit Key:", key192);

// 生成一个 32 字节的随机密钥（256 位）
const key256 = crypto.randomBytes(32).toString('hex');
console.log("Generated 256-bit Key:", key256);
