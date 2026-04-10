import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Converts local file to base64
function fileToBase64(filePath: string): string {
  const fileData = fs.readFileSync(filePath);
  return Buffer.from(fileData).toString('base64');
}

export async function generateTagsForImage(imagePath: string): Promise<string[]> {
  try {
    const base64Image = fileToBase64(imagePath);
    
    const response = await openai.chat.completions.create({
      model: "qwen-vl-max", // 阿里云通义千问视觉大模型
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: "你是一个资深设计师，我会给你一张设计灵感图片，请返回5到10个中文的设计术语便签，用于灵感收集。格式要求：仅返回以逗号分隔的术语列表，不需要任何多余文字和标点。例如：极简主义,留白,网格排列,手写字体,温暖琥珀色",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "请解析这张图片的设计词汇。" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      // Split by comma and return clean array
      return content.split(/,|，/).map(tag => tag.trim()).filter(Boolean);
    }
    return ["无标签"];
  } catch (error) {
    console.error("AI Error:", error);
    return ["AI 解析失败"];
  }
}
