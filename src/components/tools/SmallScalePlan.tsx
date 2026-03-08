import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { generateStructuredData, smallScalePlanSchema } from '../../services/ai';
import AutoResizeTextarea from '../AutoResizeTextarea';
import { APP_CONFIG } from '../../config';

const SYSTEM_PROMPT = `
あなたは日本における熟練した小規模多機能型居宅介護の計画作成担当者です。
入力された「利用者の基本情報やアセスメント情報」をもとに、
小規模多機能型居宅介護計画書の各項目を自動作成してください。
特に「通い・訪問・宿泊」を柔軟に組み合わせた具体的なサービス内容を提案してください。
出力はJSON形式で返してください。
`;

export default function SmallScalePlan() {
  const { clientData, saveClientData } = useClient();
  const [formData, setFormData] = useState<any>({
    intentions: '',
    policy: '',
    needs: [
      { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' },
      { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' },
      { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (clientData?.smallScalePlan) {
      setFormData(clientData.smallScalePlan);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    if (!clientData?.patternA && !clientData?.patternB) {
      alert('マスターデータが入力されていません。「第一ステップ」で基本情報を入力・保存してください。');
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    
    const prompt = `
【基本情報（パターンA）】
${JSON.stringify(clientData?.patternA || {})}

【アセスメント詳細（パターンB）】
${JSON.stringify(clientData?.patternB || {})}
    `;

    try {
      const data = await generateStructuredData(prompt, SYSTEM_PROMPT, smallScalePlanSchema);
      
      // Ensure we have at least 3 rows for the UI
      const needs = data.needs || [];
      while (needs.length < 3) {
        needs.push({ issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' });
      }
      
      setFormData({
        intentions: data.intentions || '',
        policy: data.policy || '',
        needs: needs.slice(0, 3) // Limit to 3 rows for this UI
      });
      setSuccessMsg('AIが計画書を自動作成しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveClientData({ smallScalePlan: formData });
    setSuccessMsg('データを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData({
      intentions: '',
      policy: '',
      needs: [
        { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' },
        { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' },
        { issue: '', longTermGoal: '', shortTermGoal: '', serviceContent: '' }
      ]
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNeedChange = (index: number, field: string, value: string) => {
    const newNeeds = [...formData.needs];
    newNeeds[index] = { ...newNeeds[index], [field]: value };
    setFormData({ ...formData, needs: newNeeds });
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">小規模多機能型居宅介護計画書</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で小規模計画書を作成します。
        </p>
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> クリア
            </button>
            <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              マスターデータからAI自動作成
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
          <h1 className="text-2xl font-bold text-center mb-4 tracking-widest">小規模多機能型居宅介護計画書</h1>
          
          <div className="flex justify-between items-end mb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                作成年月日<span className="inline-block w-32 border-b border-black text-center">令和　　年　　月　　日</span>
              </div>
              <div className="flex items-center gap-2">
                計画作成者<span className="inline-block w-40 border-b border-black text-center">{APP_CONFIG.facility.managerName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              事業所名<span className="inline-block w-64 border-b border-black text-center">{APP_CONFIG.facility.name}</span>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-32 bg-slate-50 text-center">利用者氏名</td>
                <td className="border border-black p-2">{clientData?.patternA?.name || ''}</td>
                <td className="border border-black p-2 w-32 bg-slate-50 text-center">生年月日</td>
                <td className="border border-black p-2">{clientData?.patternA?.birthDateAndAge || ''}</td>
                <td className="border border-black p-2 w-32 bg-slate-50 text-center">要介護度</td>
                <td className="border border-black p-2">{clientData?.patternA?.careLevel || ''}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 text-center">住所</td>
                <td colSpan={5} className="border border-black p-2">{clientData?.patternA?.address || ''}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-32 bg-slate-50 text-center">利用者及び家族の<br/>生活に対する意向</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea 
                    className="w-full min-h-[120px] outline-none bg-transparent" 
                    placeholder="AIが自動生成します..."
                    value={formData.intentions}
                    onChange={(e) => handleChange('intentions', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 text-center">総合的な援助の方針</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea 
                    className="w-full min-h-[120px] outline-none bg-transparent" 
                    placeholder="AIが自動生成します..."
                    value={formData.policy}
                    onChange={(e) => handleChange('policy', e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '40%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border border-black p-2 bg-slate-50 font-normal">生活全般の解決すべき<br/>課題（ニーズ）</th>
                <th className="border border-black p-2 bg-slate-50 font-normal">長期目標（期間）</th>
                <th className="border border-black p-2 bg-slate-50 font-normal">短期目標（期間）</th>
                <th className="border border-black p-2 bg-slate-50 font-normal">具体的なサービス内容<br/>（通い・訪問・宿泊）</th>
              </tr>
            </thead>
            <tbody>
              {formData.needs.map((need: any, index: number) => (
                <tr key={index}>
                  <td className="border border-black p-2 align-top">
                    <AutoResizeTextarea 
                      className="w-full min-h-[120px] outline-none bg-transparent" 
                      placeholder="AIが自動生成します..."
                      value={need.issue}
                      onChange={(e) => handleNeedChange(index, 'issue', e.target.value)}
                    />
                  </td>
                  <td className="border border-black p-2 align-top">
                    <AutoResizeTextarea 
                      className="w-full min-h-[120px] outline-none bg-transparent" 
                      placeholder="AIが自動生成します..."
                      value={need.longTermGoal}
                      onChange={(e) => handleNeedChange(index, 'longTermGoal', e.target.value)}
                    />
                  </td>
                  <td className="border border-black p-2 align-top">
                    <AutoResizeTextarea 
                      className="w-full min-h-[120px] outline-none bg-transparent" 
                      placeholder="AIが自動生成します..."
                      value={need.shortTermGoal}
                      onChange={(e) => handleNeedChange(index, 'shortTermGoal', e.target.value)}
                    />
                  </td>
                  <td className="border border-black p-2 align-top">
                    <AutoResizeTextarea 
                      className="w-full min-h-[120px] outline-none bg-transparent" 
                      placeholder="AIが自動生成します..."
                      value={need.serviceContent}
                      onChange={(e) => handleNeedChange(index, 'serviceContent', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex border-2 border-black">
            <div className="flex-1 p-2 flex items-center">
              上記計画について説明を受け、同意しました。
            </div>
            <div className="border-l border-black p-2 flex items-center gap-2">
              同意日
              <span className="inline-block w-8 text-center"></span>年
              <span className="inline-block w-8 text-center"></span>月
              <span className="inline-block w-8 text-center"></span>日
            </div>
            <div className="border-l border-black p-2 flex items-center gap-4">
              利用者氏名
              <span className="inline-block w-32 h-8 border border-slate-300"></span>印
            </div>
            <div className="border-l border-black p-2 flex items-center gap-4">
              家族代表者氏名
              <span className="inline-block w-32 h-8 border border-slate-300"></span>印
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
