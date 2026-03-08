import React, { useState } from 'react';
import { generateStructuredData } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';
import { Type } from '@google/genai';

const progressRecordSchema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      description: "支援経過記録のリスト",
      items: {
        type: Type.OBJECT,
        properties: {
          datetime: { type: Type.STRING, description: "日時（例：2026/02/01 10:00）" },
          method: { type: Type.STRING, description: "連絡方法・場所（例：電話、自宅訪問など）" },
          content: { type: Type.STRING, description: "記録内容（専門的で簡潔な文章）" }
        },
        required: ["datetime", "method", "content"]
      }
    }
  },
  required: ["records"]
};

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「日々のメモや出来事」から、「支援経過記録（第5表）」のフォーマットに沿った記録を生成してください。

以下の点に注意して記述してください。
- 事実と評価を区別し、客観的かつ専門的な表現を用いること。
- 「誰から」「どのような手段で」「どのような内容の」連絡や訪問があったかを明確にすること。
- アセスメント、モニタリング、サービス調整などの意図が伝わる内容にすること。
- 【重要】各種加算（退院退所加算、入院時情報連携加算、特定事業所加算など）の算定要件や実地指導（運営指導）の根拠となるよう、医療機関や他職種との具体的な連携内容、情報提供の有無、相談対応のプロセスを詳細かつ専門的な表現で記載すること。

出力はJSON形式で返してください。
`;

export default function ProgressRecord() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('情報を入力してください。');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    setViewMode('edit');
    
    try {
      const data = await generateStructuredData(input, SYSTEM_PROMPT, progressRecordSchema);
      setResult(data);
    } catch (err) {
      setError('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      alert("印刷ダイアログを開けませんでした。ブラウザの印刷機能（Ctrl+P または Cmd+P）をご利用ください。");
    }
  };

  const handleRecordChange = (index: number, field: string, value: string) => {
    const newRecords = [...result.records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setResult({ ...result, records: newRecords });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">記録メモ入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            日々の出来事、電話連絡、訪問時の様子などを自由に入力してください。AIが支援経過記録の形式に整理します。
            （※個人を特定できる情報は入力しないでください）
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：今日10時に長女から電話。本人が最近よく転ぶのでお風呂と買い物が大変とのこと。介護保険使いたいらしい。とりあえず訪問日を調整して、保険証とか準備してもらうよう伝えた。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIで経過記録を生成中...
              </>
            ) : (
              'AIで経過記録を生成する'
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">生成結果・目視チェック</h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {viewMode === 'edit' ? 'プレビュー' : '編集に戻る'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  PDF出力 / 印刷
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <p>左側のフォームにメモを入力し、「生成する」ボタンを押すと、<br/>ここに支援経過記録が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>専門的な表現で記録を構築しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-4 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した文章です。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-3 w-1/5">月日・時間</th>
                        <th className="px-2 py-3 w-1/5">方法・場所</th>
                        <th className="px-2 py-3">内容</th>
                        <th className="px-2 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records?.map((record: any, idx: number) => (
                        <tr key={idx} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-2 py-2 align-top">
                            <input 
                              type="text"
                              value={record.datetime}
                              onChange={(e) => handleRecordChange(idx, 'datetime', e.target.value)}
                              className="w-full p-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <input 
                              type="text"
                              value={record.method}
                              onChange={(e) => handleRecordChange(idx, 'method', e.target.value)}
                              className="w-full p-1.5 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <textarea 
                              value={record.content}
                              onChange={(e) => handleRecordChange(idx, 'content', e.target.value)}
                              className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-2 py-2 align-top text-center">
                            <button 
                              onClick={() => copyToClipboard(`${record.datetime}（${record.method}）\n${record.content}`, idx)}
                              className="text-slate-400 hover:text-blue-600 transition-colors mt-2"
                              title="この記録をコピー"
                            >
                              {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">支援経過記録（第5表）</h1>
                
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border border-black bg-gray-100">
                      <th className="p-2 border-r border-black w-1/5 text-center">月日・時間</th>
                      <th className="p-2 border-r border-black w-1/5 text-center">方法・場所</th>
                      <th className="p-2 text-center">内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.records?.map((record: any, idx: number) => (
                      <tr key={idx} className="border border-black">
                        <td className="p-2 border-r border-black align-top text-center">{record.datetime}</td>
                        <td className="p-2 border-r border-black align-top text-center">{record.method}</td>
                        <td className="p-2 align-top whitespace-pre-wrap">{record.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area (Only visible when printing) */}
      {result && (
        <div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">支援経過記録（第5表）</h1>
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border border-black bg-gray-100">
                <th className="p-3 border-r border-black w-1/5 text-center">月日・時間</th>
                <th className="p-3 border-r border-black w-1/5 text-center">方法・場所</th>
                <th className="p-3 text-center">内容</th>
              </tr>
            </thead>
            <tbody>
              {result.records?.map((record: any, idx: number) => (
                <tr key={idx} className="border border-black break-inside-avoid">
                  <td className="p-3 border-r border-black align-top text-center">{record.datetime}</td>
                  <td className="p-3 border-r border-black align-top text-center">{record.method}</td>
                  <td className="p-3 align-top whitespace-pre-wrap leading-relaxed">{record.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
