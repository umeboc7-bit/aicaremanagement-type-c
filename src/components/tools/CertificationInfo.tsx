import React, { useState } from 'react';
import { generateStructuredData, certificationInfoSchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「認定調査結果や主治医意見書のメモ」から、
ケアプラン作成やアセスメントに必要な「認定情報の整理」を行ってください。

以下の項目について、専門的かつ客観的に整理・要約してください。
情報が不足している項目は「記載なし」または「不明」としてください。

出力はJSON形式で返してください。
`;

export default function CertificationInfo() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, certificationInfoSchema);
      setResult(data);
    } catch (err) {
      setError('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      alert("印刷ダイアログを開けませんでした。ブラウザの印刷機能（Ctrl+P または Cmd+P）をご利用ください。");
    }
  };

  const handleResultChange = (field: string, value: string) => {
    setResult({ ...result, [field]: value });
  };

  const renderEditField = (label: string, value: string, fieldKey: string) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <button 
          onClick={() => copyToClipboard(value, fieldKey)}
          className="text-slate-400 hover:text-blue-600 transition-colors"
          title="コピー"
        >
          {copiedField === fieldKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <textarea 
        value={value} 
        onChange={(e) => handleResultChange(fieldKey, e.target.value)}
        className="w-full p-3 text-sm border border-slate-200 rounded-lg bg-white min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">認定情報メモ入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            要介護認定の結果、主治医意見書の内容、認定調査時の特記事項などのメモを入力してください。AIがアセスメントに使いやすい形に整理します。
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：要介護3に変更になった。期間は2年。主治医意見書にはアルツハイマー型認知症と高血圧の記載あり。最近物忘れがひどく、服薬管理ができない。歩行は自立しているが、入浴時に見守りが必要。特記事項には「短期記憶の低下著明、火の不始末のリスクあり」と書かれていた。"
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
                AIで認定情報を整理中...
              </>
            ) : (
              'AIで認定情報を整理する'
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
                <p>左側のフォームにメモを入力し、「生成する」ボタンを押すと、<br/>ここに整理された認定情報が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>認定情報を解析し、アセスメント用に整理しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-2 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが整理した認定情報です。アセスメントシートや基本情報に転記しやすい形になっています。
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {renderEditField("要介護度", result.careLevel, "careLevel")}
                  {renderEditField("認定有効期間", result.validityPeriod, "validityPeriod")}
                </div>
                {renderEditField("主病名・特定疾病", result.primaryIllness, "primaryIllness")}
                {renderEditField("基本的日常生活動作（ADL）", result.adlStatus, "adlStatus")}
                {renderEditField("認知機能・周辺症状（BPSD）", result.cognitiveStatus, "cognitiveStatus")}
                {renderEditField("医療的ケアの必要性", result.medicalNeeds, "medicalNeeds")}
                {renderEditField("認定調査特記事項の要約", result.specialNotesSummary, "specialNotesSummary")}
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">認定情報 整理シート</h1>
                
                <table className="w-full border-collapse text-sm mb-8">
                  <tbody>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">要介護度</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.careLevel}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">認定有効期間</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.validityPeriod}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">主病名・特定疾病</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.primaryIllness}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">基本的日常生活動作（ADL）</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.adlStatus}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">認知機能・周辺症状（BPSD）</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.cognitiveStatus}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">医療的ケアの必要性</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.medicalNeeds}</td>
                    </tr>
                    <tr className="border border-black">
                      <td className="w-1/4 p-2 border-r border-black bg-gray-100 font-bold align-top">認定調査特記事項の要約</td>
                      <td className="w-3/4 p-2 align-top whitespace-pre-wrap">{result.specialNotesSummary}</td>
                    </tr>
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
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">認定情報 整理シート</h1>
          
          <table className="w-full border-collapse text-sm mb-8">
            <tbody>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">要介護度</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.careLevel}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">認定有効期間</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.validityPeriod}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">主病名・特定疾病</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.primaryIllness}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">基本的日常生活動作（ADL）</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.adlStatus}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">認知機能・周辺症状（BPSD）</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.cognitiveStatus}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">医療的ケアの必要性</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.medicalNeeds}</td>
              </tr>
              <tr className="border border-black">
                <td className="w-1/4 p-3 border-r border-black bg-gray-100 font-bold align-top">認定調査特記事項の要約</td>
                <td className="w-3/4 p-3 align-top whitespace-pre-wrap leading-relaxed">{result.specialNotesSummary}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
