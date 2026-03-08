import React, { useState } from 'react';
import { generateStructuredData, minorChangeSchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「サービス変更のメモや連絡内容」から、
「軽微な変更の理由書（支援経過記録への記載用）」のフォーマットに沿った記録を生成してください。

以下の点に注意して記述してください。
- 変更の種類（曜日・時間帯の変更、回数の変更、事業所の変更など）を明確にすること。
- 誰に説明し、誰の希望・都合による変更かを明記すること。
- 変更前と変更後の内容を具体的に記載すること。
- どの事業所に周知したかを記載すること。
- 専門的かつ客観的な表現を用いること。

出力はJSON形式で返してください。
`;

export default function MinorChange() {
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, minorChangeSchema);
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

  const handleChangeItem = (index: number, field: string, value: string) => {
    const newChanges = [...result.changes];
    newChanges[index] = { ...newChanges[index], [field]: value };
    setResult({ ...result, changes: newChanges });
  };

  const formatChangeText = (change: any) => {
    return `【軽微な変更】${change.changeType || ''}
${change.explainedTo || ''}へ説明し、${change.userName || ''}の居宅サービス計画書について、${change.reasonType || ''}により、${change.serviceName || ''}の${change.changeType || ''}を行う。
（変更前）${change.beforeChange || ''}
（変更後）${change.afterChange || ''}
${change.reasonDetail ? `（理由）${change.reasonDetail}\n` : ''}上記内容について、${change.notifyTo || ''}へ周知する。`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">変更メモ入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            サービスの変更内容（曜日、時間、回数、事業所など）や、その理由、誰からの連絡だったかを自由に入力してください。AIが「軽微な変更」の記録フォーマットに整理します。
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：長女から電話。来週の火曜日のデイサービス（さくらデイ）を、本人が病院に行くから水曜日に変更してほしいとのこと。さくらデイと、水曜日に来てるヘルパー（訪問介護ひまわり）には連絡してOKもらった。"
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
                AIで記録を生成中...
              </>
            ) : (
              'AIで記録を生成する'
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
                <p>左側のフォームに変更内容を入力し、「生成する」ボタンを押すと、<br/>ここに軽微な変更の記録文面が自動作成されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>変更内容を解析し、専門的な記録文面を構築しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-6 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した記録文面です。支援経過記録にそのまま貼り付けられる形式になっています。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>

                {result.changes?.map((change: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700">変更記録 {idx + 1}</h3>
                      <button 
                        onClick={() => copyToClipboard(formatChangeText(change), idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedIndex === idx ? 'コピーしました' : 'テキストをコピー'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">変更の種類</label>
                        <input 
                          type="text" value={change.changeType || ''} onChange={(e) => handleChangeItem(idx, 'changeType', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">説明相手</label>
                        <input 
                          type="text" value={change.explainedTo || ''} onChange={(e) => handleChangeItem(idx, 'explainedTo', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">利用者名</label>
                        <input 
                          type="text" value={change.userName || ''} onChange={(e) => handleChangeItem(idx, 'userName', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">サービス事業所</label>
                        <input 
                          type="text" value={change.serviceName || ''} onChange={(e) => handleChangeItem(idx, 'serviceName', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">理由の種別</label>
                        <input 
                          type="text" value={change.reasonType || ''} onChange={(e) => handleChangeItem(idx, 'reasonType', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">周知先</label>
                        <input 
                          type="text" value={change.notifyTo || ''} onChange={(e) => handleChangeItem(idx, 'notifyTo', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">変更前</label>
                        <textarea 
                          value={change.beforeChange || ''} onChange={(e) => handleChangeItem(idx, 'beforeChange', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[40px] resize-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">変更後</label>
                        <textarea 
                          value={change.afterChange || ''} onChange={(e) => handleChangeItem(idx, 'afterChange', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[40px] resize-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">詳細な理由（任意）</label>
                        <textarea 
                          value={change.reasonDetail || ''} onChange={(e) => handleChangeItem(idx, 'reasonDetail', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[40px] resize-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-xs font-semibold text-slate-500 mb-2">完成プレビュー（コピーされるテキスト）</div>
                      <div className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                        {formatChangeText(change)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">軽微な変更 記録</h1>
                
                {result.changes?.map((change: any, idx: number) => (
                  <div key={idx} className="mb-8 border border-black p-6">
                    <div className="font-bold text-lg mb-4 border-b border-black pb-2">【軽微な変更】{change.changeType}</div>
                    
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {change.explainedTo}へ説明し、{change.userName}の居宅サービス計画書について、{change.reasonType}により、{change.serviceName}の{change.changeType}を行う。
                      
                      <br/><br/>
                      <div className="pl-4">
                        （変更前）{change.beforeChange}<br/>
                        （変更後）{change.afterChange}<br/>
                        {change.reasonDetail && <>（理由）{change.reasonDetail}<br/></>}
                      </div>
                      <br/>
                      
                      上記内容について、{change.notifyTo}へ周知する。
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area (Only visible when printing) */}
      {result && (
        <div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">軽微な変更 記録</h1>
          
          {result.changes?.map((change: any, idx: number) => (
            <div key={idx} className="mb-8 border border-black p-6 break-inside-avoid">
              <div className="font-bold text-lg mb-4 border-b border-black pb-2">【軽微な変更】{change.changeType}</div>
              
              <div className="whitespace-pre-wrap leading-relaxed">
                {change.explainedTo}へ説明し、{change.userName}の居宅サービス計画書について、{change.reasonType}により、{change.serviceName}の{change.changeType}を行う。
                
                <br/><br/>
                <div className="pl-4">
                  （変更前）{change.beforeChange}<br/>
                  （変更後）{change.afterChange}<br/>
                  {change.reasonDetail && <>（理由）{change.reasonDetail}<br/></>}
                </div>
                <br/>
                
                上記内容について、{change.notifyTo}へ周知する。
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
