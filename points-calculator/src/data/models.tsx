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
      { id: "qwen3-max", name: "qwen3-max", inputPrice: 0.0025, outputPrice: 0.01 },
      { id: "qwen3-max-2026-01-23", name: "qwen3-max-2026-01-23", inputPrice: 0.0025, outputPrice: 0.01 },
      { id: "qwen3-max-2025-09-23", name: "qwen3-max-2025-09-23", inputPrice: 0.006, outputPrice: 0.024 },
      { id: "qwen3-max-preview", name: "qwen3-max-preview", inputPrice: 0.006, outputPrice: 0.024 },
      { id: "qwen-max", name: "qwen-max", inputPrice: 0.0024, outputPrice: 0.0096 },
      { id: "qwen-max-2024-09-19", name: "qwen-max-2024-09-19", inputPrice: 0.02, outputPrice: 0.06 },
      { id: "qwen-max-2024-04-28", name: "qwen-max-2024-04-28", inputPrice: 0.04, outputPrice: 0.12 },
      { id: "qwen-max-latest", name: "qwen-max-latest", inputPrice: 0.011743, outputPrice: 0.046971 },
      { id: "qwen-plus", name: "qwen-plus", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "qwen-plus-2025-07-14", name: "qwen-plus-2025-07-14", inputPrice: 0.0008, outputPrice: 0.008 },
      { id: "qwen-plus-2025-01-25", name: "qwen-plus-2025-01-25", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "qwen-plus-latest", name: "qwen-plus-latest", inputPrice: 0.001541, outputPrice: 0.004624 },
      { id: "qwen3.5-flash", name: "qwen3.5-flash", inputPrice: 0.000734, outputPrice: 0.002936 },
      { id: "qwen-turbo", name: "qwen-turbo", inputPrice: 0.0003, outputPrice: 0.0006 },
      { id: "qwen-long", name: "qwen-long", inputPrice: 0.0005, outputPrice: 0.002 },
      { id: "qwen-vl-max", name: "qwen-vl-max", inputPrice: 0.0016, outputPrice: 0.004 },
      { id: "qwen-vl-max-2025-08-13", name: "qwen-vl-max-2025-08-13", inputPrice: 0.0016, outputPrice: 0.004 },
      { id: "qwen-vl-max-2025-04-08", name: "qwen-vl-max-2025-04-08", inputPrice: 0.003, outputPrice: 0.009 },
      { id: "qwen-vl-max-2024-12-30", name: "qwen-vl-max-2024-12-30", inputPrice: 0.003, outputPrice: 0.009 },
      { id: "qwen-vl-max-latest", name: "qwen-vl-max-latest", inputPrice: 0.005871, outputPrice: 0.023486 },
      { id: "qwen-vl-plus", name: "qwen-vl-plus", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "qwen-vl-plus-2025-08-15", name: "qwen-vl-plus-2025-08-15", inputPrice: 0.0008, outputPrice: 0.002 },
      { id: "qwen-vl-plus-2025-07-10", name: "qwen-vl-plus-2025-07-10", inputPrice: 0.00015, outputPrice: 0.0015 },
      { id: "qwen-vl-plus-2025-05-07", name: "qwen-vl-plus-2025-05-07", inputPrice: 0.0015, outputPrice: 0.0045 },
      { id: "qwen-vl-plus-2025-01-02", name: "qwen-vl-plus-2025-01-02", inputPrice: 0.0015, outputPrice: 0.0045 },
      { id: "qwen-vl-plus-latest", name: "qwen-vl-plus-latest", inputPrice: 0.001541, outputPrice: 0.004624 },
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
