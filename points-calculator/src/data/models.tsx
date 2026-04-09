import React from 'react';
import { Cloud, Flame, BrainCircuit } from 'lucide-react';

export interface LLMModel {
  id: string;
  name: string;
  inputPrice: number; // RMB per 1k tokens
  outputPrice: number; // RMB per 1k tokens
}

export interface ModelProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  models: LLMModel[];
}

export const providers: ModelProvider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: <BrainCircuit className="w-5 h-5 text-violet-700" />,
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat (V3)", inputPrice: 0.002, outputPrice: 0.008 },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)", inputPrice: 0.004, outputPrice: 0.016 },
    ]
  },
  {
    id: "alibaba",
    name: "阿里百炼 (Qwen)",
    icon: <Cloud className="w-5 h-5 text-orange-500" />,
    models: [
      { id: "qwen-max", name: "qwen-max", inputPrice: 0.0024, outputPrice: 0.0096 },
      { id: "qwen-plus", name: "qwen-plus", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "qwen-turbo", name: "qwen-turbo", inputPrice: 0.0003, outputPrice: 0.0006 },
      { id: "qwen-long", name: "qwen-long", inputPrice: 0.0005, outputPrice: 0.002 },
    ]
  },
  {
    id: "volcengine",
    name: "字节火山 (Doubao)",
    icon: <Flame className="w-5 h-5 text-red-500" />,
    models: [
      { id: "doubao-pro-32k", name: "Doubao-pro-32k", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "doubao-lite-32k", name: "Doubao-lite-32k", inputPrice: 0.0003, outputPrice: 0.0006 },
      { id: "doubao-pro-128k", name: "Doubao-pro-128k", inputPrice: 0.005, outputPrice: 0.009 },
      { id: "doubao-lite-128k", name: "Doubao-lite-128k", inputPrice: 0.0008, outputPrice: 0.0015 },
    ]
  }
];
