
import { GoogleGenAI, Type } from "@google/genai";

const sanitizeString = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\s/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = sanitizeObject(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export const generatePurposeDevotional = async (purposeTitle: string, day: number) => {
  try {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um devocional rico e profundo para o DIA ${day} do propósito "${purposeTitle}".`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: `É um mentor espiritual cristão com profundo conhecimento bíblico. Gere um devocional impactante em português.
A resposta DEVE ser um objeto JSON com:
- title: Um título inspirador para o dia.
- summary: Um resumo curto (2 frases).
- historical_context: Pano de fundo bíblico e contexto do tema.
- deep_reflection: Uma análise teológica e espiritual profunda (mínimo 3 parágrafos).
- practical_application: Como aplicar isso hoje (lista de pontos).
- prayer: Uma oração fervorosa escrita na primeira pessoa.

Use quebras de linha Reais (\\n) para separar parágrafos dentro das strings.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            historical_context: { type: Type.STRING },
            deep_reflection: { type: Type.STRING },
            practical_application: { type: Type.STRING },
            prayer: { type: Type.STRING }
          },
          required: ["title", "summary", "historical_context", "deep_reflection", "practical_application", "prayer"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text.trim());
    return sanitizeObject(data);
  } catch (error) {
    console.error("Erro no Gemini (generatePurposeDevotional):", error);
    return null;
  }
};
