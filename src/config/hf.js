// src/config/hf.js
const path  = require('path');
const axios = require('axios');

// 1) Load env nằm trong src/.env
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

// 2) Lấy token
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_TOKEN chưa được thiết lập trong src/.env');
  process.exit(1);
} else {
  console.log('✅ HUGGINGFACE_API_TOKEN đã load:', HF_TOKEN.slice(0,6) + '…');
}

// 3) Chuyển qua pipeline/text-generation
const MODEL_URL =
  'https://api-inference.huggingface.co/pipeline/text-generation/gpt2?use_cache=false';

// 4) Hàm gọi inference
async function generateReply(prompt) {
  console.log('→ Gửi prompt lên HF:', prompt);
  const res = await axios.post(
    MODEL_URL,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 64,
        temperature: 0.7
      }
    },
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Kết quả trả về dạng mảng [{ generated_text: "..." }]
  const data = res.data;
  console.log('← HF trả về:', data);
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  throw new Error('Không tìm thấy generated_text trong response');
}

module.exports = { generateReply };
