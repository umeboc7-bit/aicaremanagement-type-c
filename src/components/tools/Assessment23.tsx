import React, { useState, useEffect } from 'react';
import { generateStructuredData, assessment23Schema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { useClient } from '../../context/ClientContext';
import AutoResizeTextarea from '../AutoResizeTextarea';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
「過去のアセスメント情報」と「現在のアセスメント情報（変化・追加情報）」が入力されます。
これらを統合し、課題分析標準23項目の形式で「更新後のアセスメント情報」を出力してください。

以下の点に注意してください：
1. 過去の情報に対して現在の情報を追記または上書きし、変更のない箇所はそのまま残してください。
2. 課題分析標準23項目（1.基本情報 〜 23.特別な状況）の全項目を出力してください。
3. 変更があった項目は isChanged を true にしてください。
4. 専門的かつ客観的な文章で記述してください。
5. 【重要】各種加算の算定根拠となる状態像（例：認知症の周辺症状(BPSD)の具体的な頻度、独居によるリスク、医療的ケアの必要性、家族の介護負担度など）について、実地指導で根拠として認められるよう、客観的かつ具体的なエピソードや頻度を交えて記述してください。

出力はJSON形式で返してください。
`;

export default function Assessment23() {
  const { clientData, saveClientData } = useClient();
  const [pastInfo, setPastInfo] = useState('');
  const [currentInfo, setCurrentInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (clientData?.assessment23) {
      setResult(clientData.assessment23);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    if (!currentInfo.trim()) {
      setError('現在のアセスメント情報（変化・追加情報）を入力してください。');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setResult(null);
    setViewMode('edit');
    
    const prompt = `
【過去のアセスメント情報】
${pastInfo || '（なし）'}

【現在のアセスメント情報（変化・追加情報）】
${currentInfo}
    `;

    try {
      const data = await generateStructuredData(prompt, SYSTEM_PROMPT, assessment23Schema);
      setResult(data);
      setSuccessMsg('AIが23項目を更新しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveClientData({ assessment23: result });
    setSuccessMsg('データを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setResult(null);
    setPastInfo('');
    setCurrentInfo('');
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
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

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...result.items];
    newItems[index] = { ...newItems[index], content: value };
    setResult({ ...result, items: newItems });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">アセスメント情報入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            過去のアセスメント情報と、今回変化があった情報を入力してください。AIが23項目を自動で更新・整理します。
          </p>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col h-1/2">
              <label className="text-sm font-semibold text-slate-700 mb-1">【過去のアセスメント情報】（任意）</label>
              <textarea
                className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                placeholder="前回の23項目の内容や、ベースとなる情報を入力してください。"
                value={pastInfo}
                onChange={(e) => setPastInfo(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col h-1/2">
              <label className="text-sm font-semibold text-slate-700 mb-1">【現在のアセスメント情報】（必須）</label>
              <textarea
                className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                placeholder="最近の変化、新しく分かったこと、追加したい情報を入力してください。&#13;&#10;例：最近、夜間にトイレに起きる回数が増え、転倒のリスクが高まっている。家族も睡眠不足で疲労が見られる。"
                value={currentInfo}
                onChange={(e) => setCurrentInfo(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIで23項目を更新中...
              </>
            ) : (
              'AIで23項目を更新する'
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              {successMsg}
            </div>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">生成結果・目視チェック</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!result}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                クリア
              </button>
            </div>
          </div>
          
          {result && (
            <div className="flex justify-end gap-2 mb-4">
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
          
          <div className="flex-1 overflow-y-auto pr-2">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <p>左側のフォームに情報を入力し、「更新する」ボタンを押すと、<br/>ここに課題分析標準23項目が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>過去の情報と現在の情報を統合し、23項目を整理しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-4 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した文章です。ハイライトされている項目は今回更新された箇所です。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>
                
                <div className="space-y-4">
                  {result.items?.map((item: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg border ${item.isChanged ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{item.id}. {item.title}</span>
                          {item.isChanged && (
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded">更新あり</span>
                          )}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(item.content, idx)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="コピー"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <AutoResizeTextarea 
                        value={item.content}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                        className="w-full p-3 text-sm border border-slate-200 rounded bg-white min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">課題分析標準23項目</h1>
                
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {result.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border border-black">
                        <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">
                          {item.id}. {item.title}
                        </td>
                        <td className="w-3/4 p-2 align-top whitespace-pre-wrap">
                          {item.content || '（特記事項なし）'}
                        </td>
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
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">課題分析標準23項目</h1>
          
          <table className="w-full border-collapse text-sm">
            <tbody>
              {result.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border border-black break-inside-avoid">
                  <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">
                    {item.id}. {item.title}
                  </td>
                  <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">
                    {item.content || '（特記事項なし）'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
