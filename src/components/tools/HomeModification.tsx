import React, { useState } from 'react';
import { generateStructuredData, homeModSchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「利用者情報」「現在の住環境と生活動線」「生活上の支障・危険性」などのメモから、
「住宅改修が必要な理由書」の各項目を生成してください。

以下のフォーマットに従って、各改修箇所ごとに3つのポイントを明確に記述してください。
1. 住宅改修により利用者等は日常生活をどう変えたいか（…の生活を…にしたい）※120文字以上
2. 具体的な困難な状況（…なので…で困っている）※50〜80文字
3. 改修目的と改修効果（…することで…が改善できる）※50〜80文字

出力はJSON形式で返してください。
`;

export default function HomeModification() {
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, homeModSchema);
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
    // In an iframe environment, we need to ensure we're calling print on the correct window
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      alert("印刷ダイアログを開けませんでした。ブラウザの印刷機能（Ctrl+P または Cmd+P）をご利用ください。");
    }
  };

  const handleResultChange = (index: number, field: string, value: string) => {
    const newResult = { ...result };
    newResult.modifications[index][field] = value;
    setResult(newResult);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">情報入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            利用者の状態、現在の住環境、生活上の支障、希望する改修内容などを自由に入力してください。
            （※個人を特定できる情報は入力しないでください）
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：A様（80代・女性）、要介護2、右片麻痺。玄関の上がり框（約20cm）で転びそう。トイレで立ち上がれない。浴室の出入り口に段差があり、浴槽またぎが不安定。手すりをつけたい。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIで理由書を生成中...
              </>
            ) : (
              'AIで理由書を生成する'
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
                <p>左側のフォームに情報を入力し、「生成する」ボタンを押すと、<br/>ここに理由書の各項目が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>専門的な視点で文章を構築しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-6 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した文章です。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>
                {result.modifications?.map((mod: any, index: number) => (
                  <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                      <input 
                        type="text"
                        value={mod.locationAndItem}
                        onChange={(e) => handleResultChange(index, 'locationAndItem', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 w-full font-bold text-slate-700"
                      />
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Item 1 */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-semibold text-slate-600">
                            1. 住宅改修により利用者等は日常生活をどう変えたいか
                          </label>
                          <button 
                            onClick={() => copyToClipboard(mod.desiredLifeChange, index * 10 + 1)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="コピー"
                          >
                            {copiedIndex === index * 10 + 1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <textarea 
                          value={mod.desiredLifeChange} 
                          onChange={(e) => handleResultChange(index, 'desiredLifeChange', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Item 2 */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-semibold text-slate-600">
                            2. 具体的な困難な状況
                          </label>
                          <button 
                            onClick={() => copyToClipboard(mod.currentDifficulties, index * 10 + 2)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="コピー"
                          >
                            {copiedIndex === index * 10 + 2 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <textarea 
                          value={mod.currentDifficulties} 
                          onChange={(e) => handleResultChange(index, 'currentDifficulties', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Item 3 */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-semibold text-slate-600">
                            3. 改修目的と改修効果
                          </label>
                          <button 
                            onClick={() => copyToClipboard(mod.purposeAndEffect, index * 10 + 3)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="コピー"
                          >
                            {copiedIndex === index * 10 + 3 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <textarea 
                          value={mod.purposeAndEffect} 
                          onChange={(e) => handleResultChange(index, 'purposeAndEffect', e.target.value)}
                          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">住宅改修が必要な理由書</h1>
                
                <div className="space-y-8">
                  {result.modifications?.map((mod: any, index: number) => (
                    <div key={index} className="border border-black">
                      <div className="bg-gray-100 border-b border-black p-2 font-bold">
                        改修箇所・品目：{mod.locationAndItem}
                      </div>
                      <div className="p-0">
                        <table className="w-full border-collapse text-sm">
                          <tbody>
                            <tr className="border-b border-black">
                              <td className="w-1/3 p-2 border-r border-black bg-gray-50 align-top">
                                1. 住宅改修により利用者等は日常生活をどう変えたいか
                              </td>
                              <td className="w-2/3 p-2 align-top whitespace-pre-wrap">
                                {mod.desiredLifeChange}
                              </td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="w-1/3 p-2 border-r border-black bg-gray-50 align-top">
                                2. 具体的な困難な状況
                              </td>
                              <td className="w-2/3 p-2 align-top whitespace-pre-wrap">
                                {mod.currentDifficulties}
                              </td>
                            </tr>
                            <tr>
                              <td className="w-1/3 p-2 border-r border-black bg-gray-50 align-top">
                                3. 改修目的と改修効果
                              </td>
                              <td className="w-2/3 p-2 align-top whitespace-pre-wrap">
                                {mod.purposeAndEffect}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area (Only visible when printing) */}
      {result && (
        <div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">住宅改修が必要な理由書</h1>
          
          <div className="space-y-8">
            {result.modifications?.map((mod: any, index: number) => (
              <div key={index} className="border border-black break-inside-avoid">
                <div className="bg-gray-100 border-b border-black p-2 font-bold">
                  改修箇所・品目：{mod.locationAndItem}
                </div>
                <div className="p-0">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="w-1/3 p-3 border-r border-black bg-gray-50 align-top">
                          1. 住宅改修により利用者等は日常生活をどう変えたいか
                        </td>
                        <td className="w-2/3 p-3 align-top whitespace-pre-wrap leading-relaxed">
                          {mod.desiredLifeChange}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="w-1/3 p-3 border-r border-black bg-gray-50 align-top">
                          2. 具体的な困難な状況
                        </td>
                        <td className="w-2/3 p-3 align-top whitespace-pre-wrap leading-relaxed">
                          {mod.currentDifficulties}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-1/3 p-3 border-r border-black bg-gray-50 align-top">
                          3. 改修目的と改修効果
                        </td>
                        <td className="w-2/3 p-3 align-top whitespace-pre-wrap leading-relaxed">
                          {mod.purposeAndEffect}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
