import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { generateStructuredData, meetingMinutesSchema } from '../../services/ai';
import AutoResizeTextarea from '../AutoResizeTextarea';
import { APP_CONFIG } from '../../config';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「利用者の基本情報やアセスメント情報、ケアプラン（第1表〜第3表）など」をもとに、
サービス担当者会議の要点（第4表）を自動作成してください。
会議で検討すべき項目、検討内容、結論、残された課題を具体的に記載してください。
出力はJSON形式で返してください。
`;

export default function CarePlan4() {
  const { clientData, saveClientData } = useClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    count: '',
    attendees: Array(8).fill({ name: '', role: '' }),
    topics: '',
    details: '',
    conclusion: '',
    remainingIssues: ''
  });

  useEffect(() => {
    if (clientData?.carePlan4) {
      setFormData(clientData.carePlan4);
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

【居宅サービス計画書（第1表）】
${JSON.stringify(clientData?.carePlan1 || {})}

【居宅サービス計画書（第2表）】
${JSON.stringify(clientData?.carePlan2 || {})}
    `;

    try {
      const data = await generateStructuredData(prompt, SYSTEM_PROMPT, meetingMinutesSchema);
      
      // Map meetingMinutesSchema to CarePlan4 format
      const details = `
【現状共有】
${data.currentStatus || ''}

【本人・家族意向】
${data.intentions || ''}

【支援方針（合意事項）】
${data.policy || ''}

【サービス再調整（決定事項）】
${data.serviceAdjustments || ''}

【緊急時対応（取り決め）】
${data.emergencyResponse || ''}

【各参加者の発言要旨と結論】
${(data.discussionSummary || []).map((item: any) => `・${item.role}: ${item.opinion}\n  → ${item.conclusion}`).join('\n')}
      `.trim();

      setFormData(prev => ({
        ...prev,
        topics: '新規プランの目標設定とサービス内容の確認について',
        details: details,
        conclusion: data.policy || '',
        remainingIssues: data.nextActions || ''
      }));
      setSuccessMsg('AIが第4表を自動作成しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveClientData({ carePlan4: formData });
    setSuccessMsg('第4表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData({
      date: '',
      location: '',
      count: '',
      attendees: Array(8).fill({ name: '', role: '' }),
      topics: '',
      details: '',
      conclusion: '',
      remainingIssues: ''
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setFormData(prev => ({ ...prev, attendees: newAttendees }));
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">サービス担当者会議の要点（４）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で担当者会議の要点（第4表）を作成します。
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
        <div className="max-w-[800px] mx-auto text-[11px] leading-tight">
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第４表</div>
            <h1 className="text-xl font-bold tracking-widest">サービス担当者会議の要点</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>様
            </div>
            <div className="flex items-center gap-2">
              居宅サービス計画作成者氏名<span className="inline-block w-40 border-b border-black text-center">{APP_CONFIG.facility.managerName}</span>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold w-32">開催日</td>
                <td className="border border-black p-2">令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</td>
                <td className="border border-black p-2 bg-slate-50 font-bold w-32">開催場所</td>
                <td className="border border-black p-2"><input type="text" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full outline-none bg-transparent" /></td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold">開催回数</td>
                <td className="border border-black p-2" colSpan={3}>第<span className="inline-block w-6 border-b border-black text-center"><input type="text" value={formData.count} onChange={(e) => handleChange('count', e.target.value)} className="w-full outline-none bg-transparent text-center" /></span>回</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <thead>
              <tr>
                <th className="border border-black p-2 bg-slate-50 font-bold" colSpan={4}>出席者</th>
              </tr>
              <tr>
                <th className="border border-black p-1 bg-slate-50 w-1/4">氏名</th>
                <th className="border border-black p-1 bg-slate-50 w-1/4">所属・職種</th>
                <th className="border border-black p-1 bg-slate-50 w-1/4">氏名</th>
                <th className="border border-black p-1 bg-slate-50 w-1/4">所属・職種</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="h-8">
                  <td className="border border-black p-1"><input type="text" value={formData.attendees[i * 2]?.name || ''} onChange={(e) => handleAttendeeChange(i * 2, 'name', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border border-black p-1"><input type="text" value={formData.attendees[i * 2]?.role || ''} onChange={(e) => handleAttendeeChange(i * 2, 'role', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border border-black p-1"><input type="text" value={formData.attendees[i * 2 + 1]?.name || ''} onChange={(e) => handleAttendeeChange(i * 2 + 1, 'name', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border border-black p-1"><input type="text" value={formData.attendees[i * 2 + 1]?.role || ''} onChange={(e) => handleAttendeeChange(i * 2 + 1, 'role', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse border-2 border-black">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold w-32 align-top">検討した項目</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea value={formData.topics} onChange={(e) => handleChange('topics', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="（例）新規プランの目標設定とサービス内容の確認について" />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold align-top">検討内容<br/>（会議の要点）</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea value={formData.details} onChange={(e) => handleChange('details', e.target.value)} className="w-full min-h-[250px] outline-none bg-transparent" placeholder="（例）本人・家族の意向確認、各専門職からの意見、目標達成に向けた具体策の協議内容など" />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold align-top">結論</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea value={formData.conclusion} onChange={(e) => handleChange('conclusion', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="（例）原案通りサービスを導入し、1ヶ月後に状況を再評価する。" />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-slate-50 font-bold align-top">残された課題<br/>（次回の検討事項）</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea value={formData.remainingIssues} onChange={(e) => handleChange('remainingIssues', e.target.value)} className="w-full min-h-[120px] outline-none bg-transparent" placeholder="（例）デイサービスでの入浴拒否が続いた場合の対応策について" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
