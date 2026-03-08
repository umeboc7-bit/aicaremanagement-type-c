import { GoogleGenAI } from "@google/genai";

const getAiInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateCarePlanText = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "あなたは日本の優秀なケアマネジャーです。提供された情報を元に、介護保険制度の基準に則った適切なケアプランの文章を作成してください。出力はプレーンテキストで、マークダウンなどの装飾は含めないでください。",
        temperature: 0.7,
      }
    });
    return response.text || '';
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "AIの生成中にエラーが発生しました。";
  }
};

export const analyzeVoiceIntake = async (transcript: string): Promise<any> => {
  try {
    const ai = getAiInstance();
    const prompt = `以下の面談の文字起こしから、利用者の「現状の課題」「生活全般の解決すべき課題（ニーズ）」「要約」を抽出してJSON形式で返してください。

文字起こし:
${transcript}

期待されるJSONフォーマット:
{
  "issues": ["課題1", "課題2"],
  "needs": ["ニーズ1", "ニーズ2"],
  "summary": "面談の要約（200文字程度）"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });
    
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing voice intake:", error);
    return {
      issues: ["AI分析エラー"],
      needs: ["AI分析エラー"],
      summary: "AIの分析中にエラーが発生しました。"
    };
  }
};

export const checkCarePlanConsistency = async (planData: any): Promise<any[]> => {
  try {
    const ai = getAiInstance();
    const prompt = `以下のケアプラン情報（第1表〜第3表の抜粋）を分析し、内容に矛盾や抜け漏れがないかチェックしてください。
結果はJSON配列で返してください。

ケアプラン情報:
${JSON.stringify(planData, null, 2)}

期待されるJSONフォーマット（配列）:
[
  { "type": "warning", "message": "警告メッセージの内容" },
  { "type": "success", "message": "問題ない点の確認メッセージ" }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });
    
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("Error checking consistency:", error);
    return [{ type: 'warning', message: 'AIチェック中にエラーが発生しました。' }];
  }
};
