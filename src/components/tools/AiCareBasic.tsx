import React, { useState } from 'react';
import { generateStructuredData, aiCareBasicSchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは「適切なケアマネジメント手法」および「介護報酬の各種加算要件」に精通した熟練ケアマネジャーです。
入力された利用者の状態や課題から、基本ケア（水分・食事・排泄・活動など）の観点で、
確認すべきアセスメント項目と、ケアプランに位置づけるべき支援内容の提案を行ってください。

以下の点に注意してください：
1. 利用者の状態サマリーを簡潔にまとめること。
2. 状態悪化の防止や自立支援に向けた具体的な提案を行うこと。
3. 【重要】利用者の状態から算定可能と推測される「加算（例：認知症加算、退院退所加算、独居高齢者加算、医療連携体制加算など）」があれば、それを取得するために「アセスメントで確認すべきポイント」や「ケアプランに位置づけるべき内容」を積極的に提案に含めること。

出力はJSON形式で返してください。
`;

export default function AiCareBasic() {
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, aiCareBasicSchema);
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

  const handleSummaryChange = (value: string) => {
    setResult({ ...result, summary: value });
  };

  const handleProposalChange = (index: number, field: string, value: string) => {
    const newProposals = [...result.proposals];
    newProposals[index] = { ...newProposals[index], [field]: value };
    setResult({ ...result, proposals: newProposals });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">利用者の状態入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            利用者の現在の状態、疾患、生活上の課題などを入力してください。AIが「適切なケアマネジメント手法（基本ケア）」に基づいたアセスメント項目とケアプランの提案を行います。
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
            placeholder="例：85歳女性。最近食欲が落ちており、体重が減少気味。日中はテレビを見て座っていることが多い。夜間にトイレに起きる回数が増え、日中の傾眠傾向が見られる。水分はあまり摂りたがらない。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI適ケア提案を生成中...
              </>
            ) : (
              'AI適ケア提案を生成する'
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
                <p>左側のフォームに情報を入力し、「生成する」ボタンを押すと、<br/>ここに適切なケアマネジメント手法に基づく提案が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                <p>利用者の状態を分析し、適切なケアを提案しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-6 pb-4">
                <div className="bg-rose-50 text-rose-800 p-3 rounded-lg text-sm mb-4">
                  AIが「適切なケアマネジメント手法」に基づいて提案した内容です。アセスメントの抜け漏れ防止や、ケアプランの目標・具体策の検討にご活用ください。
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700">利用者の状態サマリー</h3>
                    <button 
                      onClick={() => copyToClipboard(result.summary, 999)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="コピー"
                    >
                      {copiedIndex === 999 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <textarea 
                    value={result.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    className="w-full p-3 text-sm border border-slate-200 rounded-lg bg-white min-h-[60px] resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 border-b pb-2">アセスメント項目とケアプラン提案</h3>
                  {result.proposals?.map((proposal: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <input 
                          type="text"
                          value={proposal.category}
                          onChange={(e) => handleProposalChange(idx, 'category', e.target.value)}
                          className="font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded border-none focus:ring-0 w-1/2"
                        />
                        <button 
                          onClick={() => copyToClipboard(`【${proposal.category}】\n■確認すべきアセスメント項目\n${proposal.assessmentPoint}\n\n■ケアプラン提案\n${proposal.carePlanProposal}`, idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="この提案をコピー"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">確認すべきアセスメント項目</label>
                          <textarea 
                            value={proposal.assessmentPoint}
                            onChange={(e) => handleProposalChange(idx, 'assessmentPoint', e.target.value)}
                            className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">ケアプランに位置づける支援内容</label>
                          <textarea 
                            value={proposal.carePlanProposal}
                            onChange={(e) => handleProposalChange(idx, 'carePlanProposal', e.target.value)}
                            className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">AI適ケア提案（基本ケア）</h1>
                
                <div className="mb-6 border border-black p-4">
                  <h2 className="font-bold mb-2 border-b border-gray-300 pb-1">利用者の状態サマリー</h2>
                  <div className="whitespace-pre-wrap">{result.summary}</div>
                </div>

                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border border-black">
                      <th className="p-2 border-r border-black w-1/5">分類</th>
                      <th className="p-2 border-r border-black w-2/5">確認すべきアセスメント項目</th>
                      <th className="p-2 w-2/5">ケアプラン提案</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.proposals?.map((proposal: any, idx: number) => (
                      <tr key={idx} className="border border-black">
                        <td className="p-2 border-r border-black font-bold align-top bg-gray-50">{proposal.category}</td>
                        <td className="p-2 border-r border-black align-top whitespace-pre-wrap">{proposal.assessmentPoint}</td>
                        <td className="p-2 align-top whitespace-pre-wrap">{proposal.carePlanProposal}</td>
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
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">AI適ケア提案（基本ケア）</h1>
          
          <div className="mb-8 border border-black p-4 break-inside-avoid">
            <h2 className="font-bold mb-2 border-b border-gray-300 pb-1">利用者の状態サマリー</h2>
            <div className="whitespace-pre-wrap leading-relaxed">{result.summary}</div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border border-black">
                <th className="p-3 border-r border-black w-1/5">分類</th>
                <th className="p-3 border-r border-black w-2/5">確認すべきアセスメント項目</th>
                <th className="p-3 w-2/5">ケアプラン提案</th>
              </tr>
            </thead>
            <tbody>
              {result.proposals?.map((proposal: any, idx: number) => (
                <tr key={idx} className="border border-black break-inside-avoid">
                  <td className="p-3 border-r border-black font-bold align-top bg-gray-50">{proposal.category}</td>
                  <td className="p-3 border-r border-black align-top whitespace-pre-wrap leading-relaxed">{proposal.assessmentPoint}</td>
                  <td className="p-3 align-top whitespace-pre-wrap leading-relaxed">{proposal.carePlanProposal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
