import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || 'gemini-1.5-flash';
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';

async function callGemini({ model, contents }) {
  if (!GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set, returning stubbed response');
    return { candidates: [{ content: { parts: [{ text: 'STUB' }] } }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }
  return await res.json();
}

function parseDetectionsFromText(text) {
  try {
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const arr = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  const items = [];
  text.split(/\n|,|;/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const match = line.match(/^(.*?)(?:\((\d+)g\))?(?:.*?([01](?:\.\d+)?))?$/i);
    const name = (match?.[1] || line).trim();
    const grams = match?.[2] ? Number(match[2]) : undefined;
    const confidence = match?.[3] ? Number(match[3]) : undefined;
    if (name) items.push({ name, locale: 'vi', servingGrams: grams, confidence: confidence ?? 0.6 });
  });
  return items.slice(0, 6);
}

export async function analyzeFoodImage({ imageBase64, imageUrl, locale = 'vi' }) {
  if (!GEMINI_API_KEY) {
    return {
      items: [
        { name: 'Phở bò', locale: 'vi', servingGrams: 350, confidence: 0.92 },
        { name: 'Gỏi cuốn', locale: 'vi', servingGrams: 180, confidence: 0.78 }
      ]
    };
  }

  const parts = [];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  } else if (imageUrl) {
    parts.push({ text: `Image URL: ${imageUrl}` });
  }
  parts.push({
    text:
      `Bạn là chuyên gia dinh dưỡng. Hãy liệt kê các món ăn trong ảnh (hỗ trợ món Việt). ` +
      `Kết quả dạng JSON array, mỗi phần tử: {"name":"Tên món (vi)","servingGrams": số ước lượng theo gram, "confidence": 0..1}.\n` +
      `Nếu nhiều món, liệt kê tối đa 6.`
  });

  const response = await callGemini({ model: GEMINI_VISION_MODEL, contents: [{ role: 'user', parts }] });
  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const detections = parseDetectionsFromText(text);
  return { items: detections.map((d) => ({ ...d, locale })) };
}

export async function chatWithUser({ messages, userProfile, todaySummary, locale = 'vi' }) {
  if (!GEMINI_API_KEY) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return { reply: `STUB: ${lastUser?.content || 'Xin chào!'}\n\n(Hãy cấu hình GEMINI_API_KEY để nhận câu trả lời thông minh.)` };
  }

  const systemPrompt = `Bạn là trợ lý dinh dưỡng tiếng Việt cho ứng dụng NutriScanVN. ` +
    `Sử dụng hồ sơ và mục tiêu người dùng để đưa ra lời khuyên thực tế, lịch sự, ngắn gọn. ` +
    `Đơn vị: gram, kcal, ml. Tránh ngôn ngữ y khoa phức tạp.`;

  const context = {
    profile: userProfile || null,
    todaySummary: todaySummary || null
  };

  const parts = [ { text: systemPrompt }, { text: `Ngữ cảnh: ${JSON.stringify(context, null, 2)}` } ];
  for (const m of messages) {
    parts.push({ text: `${m.role.toUpperCase()}: ${m.content}` });
  }

  const response = await callGemini({ model: GEMINI_CHAT_MODEL, contents: [{ role: 'user', parts }] });
  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin chào!';
  return { reply: text };
}
