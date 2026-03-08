import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, CheckCircle2 } from 'lucide-react';
import { generateCarePlanText } from '../../services/geminiService';
import AutoResizeTextarea from '../AutoResizeTextarea';

export default function CarePlan2() {
  const { clientData, saveClientData } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState<any[]>([
    { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' },
    { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' },
    { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' }
  ]);

  useEffect(() => {
    if (clientData?.carePlan2 && Array.isArray(clientData.carePlan2)) {
      setFormData(clientData.carePlan2);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const baseInfo = JSON.stringify(clientData?.patternA || {});
      const voiceInfo = JSON.stringify(clientData?.voiceIntake || {});
      
      const prompt = `以下の利用者情報と面談記録を元に、居宅サービス計画書（第2表）の課題・目標・サービス内容を3つ作成し、JSON配列で返してください。
各要素は以下のキーを持つオブジェクトとしてください:
- needs: 生活全般の解決すべき課題（ニーズ）
- longTermGoal: 長期目標
- shortTermGoal: 短期目標
- serviceContent: サービス内容
- serviceType: サービス種別
- frequency: 頻度

基本情報: ${baseInfo}
面談記録: ${voiceInfo}

期待されるJSONフォーマット:
[
  { "needs": "...", "longTermGoal": "...", "shortTermGoal": "...", "serviceContent": "...", "serviceType": "...", "frequency": "..." },
  ...
]`;
      
      const ai = (await import('../../services/geminiService')).generateCarePlanText;
      // Use a direct call to the model for JSON response to ensure format
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const genAi = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await genAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });
      
      const text = response.text || '[]';
      const result = JSON.parse(text);
      
      if (Array.isArray(result) && result.length > 0) {
        // Ensure we have exactly 3 rows
        const newFormData = [...result];
        while (newFormData.length < 3) {
          newFormData.push({ needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' });
        }
        setFormData(newFormData.slice(0, 3));
        setSuccessMsg('AIが第2表を自動作成しました。内容を確認・修正してください。');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error(error);
      alert('AI生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    saveClientData({ carePlan2: formData });
    setSuccessMsg('第2表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData([
      { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' },
      { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' },
      { needs: '', longTermGoal: '', shortTermGoal: '', serviceContent: '', serviceType: '', frequency: '' }
    ]);
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">居宅サービス計画書（２）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で計画書（第2表）を作成します。
        </p>
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> クリア
            </button>
            <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> {isGenerating ? 'AIが作成中...' : 'マスターデータからAI自動作成'}
            </button>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Printer className="w-4 h-4" /> 印刷 / PDF出力
          </button>
        </div>
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:overflow-visible print:shadow-none print:border-none print:p-0">
        <div className="max-w-[1000px] mx-auto text-[11px] leading-tight">
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第２表</div>
            <h1 className="text-xl font-bold tracking-widest">居宅サービス計画書（２）</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>殿
          </div>

          <table className="w-full border-collapse border-2 border-black">
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '3%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black p-1 bg-slate-50 font-normal">生活全般の解決すべき<br/>課題（ニーズ）</th>
                <th colSpan={2} className="border border-black p-1 bg-slate-50 font-normal">目標</th>
                <th colSpan={5} className="border border-black p-1 bg-slate-50 font-normal">援助内容</th>
              </tr>
              <tr>
                <th className="border border-black p-1 bg-slate-50 font-normal">長期目標（期間）</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">短期目標（期間）</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">サービス内容</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">※1</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">サービス種別</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">※2</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">頻度</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((row, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.needs} onChange={(e) => handleChange(index, 'needs', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.longTermGoal} onChange={(e) => handleChange(index, 'longTermGoal', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.shortTermGoal} onChange={(e) => handleChange(index, 'shortTermGoal', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.serviceContent} onChange={(e) => handleChange(index, 'serviceContent', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-1 text-center align-top"><input type="text" className="w-full text-center outline-none bg-transparent" /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.serviceType} onChange={(e) => handleChange(index, 'serviceType', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value="" onChange={() => {}} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                  <td className="border border-black p-2 align-top"><AutoResizeTextarea value={row.frequency} onChange={(e) => handleChange(index, 'frequency', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="AIが自動生成します..." /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
