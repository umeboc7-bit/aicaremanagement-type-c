import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { generateStructuredData, carePlan5Schema } from '../../services/ai';
import { APP_CONFIG } from '../../config';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「利用者の基本情報やアセスメント情報、サービス担当者会議の要点など」をもとに、
居宅介護支援経過記録（第5表）を自動作成してください。
支援の経過や連絡事項などを時系列で記録する内容としてください。
出力はJSON形式で返してください。
`;

export default function CarePlan5() {
  const { clientData, saveClientData } = useClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    records: Array(40).fill({ date: '', content: '' }) // 2 columns * 20 rows
  });

  useEffect(() => {
    if (clientData?.carePlan5) {
      setFormData(clientData.carePlan5);
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

【サービス担当者会議の要点（第4表）】
${JSON.stringify(clientData?.carePlan4 || {})}
    `;

    try {
      const data = await generateStructuredData(prompt, SYSTEM_PROMPT, carePlan5Schema);
      
      const newRecords = Array(40).fill({ date: '', content: '' });
      if (data.records && Array.isArray(data.records)) {
        data.records.forEach((record: any, index: number) => {
          if (index < 40) {
            newRecords[index] = { date: record.date || '', content: record.content || '' };
          }
        });
      }
      
      setFormData({ records: newRecords });
      setSuccessMsg('AIが第5表を自動作成しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveClientData({ carePlan5: formData });
    setSuccessMsg('第5表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData({
      records: Array(40).fill({ date: '', content: '' })
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordChange = (index: number, field: string, value: string) => {
    const newRecords = [...formData.records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setFormData({ records: newRecords });
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">居宅介護支援経過記録（５）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で経過記録（第5表）を作成します。
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
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第５表</div>
            <h1 className="text-xl font-bold tracking-widest">居宅介護支援経過記録</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>殿
            </div>
            <div className="flex items-center gap-2">
              居宅サービス計画作成者氏名<span className="inline-block w-40 border-b border-black text-center">{APP_CONFIG.facility.managerName}</span>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border border-black p-1 bg-slate-50 font-normal">年月日</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">内　　容</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">年月日</th>
                <th className="border border-black p-1 bg-slate-50 font-normal">内　　容</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="h-8 border-b border-dotted border-slate-400">
                  <td className="border-r border-black p-1"><input type="text" value={formData.records[i * 2]?.date || ''} onChange={(e) => handleRecordChange(i * 2, 'date', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border-r-2 border-black p-1"><input type="text" value={formData.records[i * 2]?.content || ''} onChange={(e) => handleRecordChange(i * 2, 'content', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border-r border-black p-1"><input type="text" value={formData.records[i * 2 + 1]?.date || ''} onChange={(e) => handleRecordChange(i * 2 + 1, 'date', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="p-1"><input type="text" value={formData.records[i * 2 + 1]?.content || ''} onChange={(e) => handleRecordChange(i * 2 + 1, 'content', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
