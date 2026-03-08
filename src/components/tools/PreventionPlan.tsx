import React, { useState } from 'react';
import { generateStructuredData, preventionPlanSchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護予防支援専門員（地域包括支援センター職員・ケアマネジャー）です。
入力された「利用者の基本情報、アセスメント内容、本人の希望など」から、
「介護予防サービス・支援計画書（ケアマネジメント結果等記録表）」の各項目を生成してください。

以下の4つの領域（運動・移動、日常生活、社会参加、健康管理）を中心に、
自立支援・重度化防止に向けた具体的な目標と支援内容を整理してください。

出力はJSON形式で返してください。
`;

export default function PreventionPlan() {
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, preventionPlanSchema);
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

  const handleNestedChange = (category: string, field: string, value: string) => {
    setResult({
      ...result,
      [category]: {
        ...result[category],
        [field]: value
      }
    });
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const newArray = [...result[field]];
    newArray[index] = value;
    setResult({ ...result, [field]: newArray });
  };

  const renderDomainRow = (label: string, field: string) => (
    <tr className="border-b border-slate-200">
      <td className="p-3 font-semibold bg-slate-50 w-1/5 align-top">{label}</td>
      <td className="p-2 border-l border-slate-200 w-1/5 align-top">
        <textarea 
          value={result.assessment[field]} 
          onChange={(e) => handleNestedChange('assessment', field, e.target.value)}
          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="p-2 border-l border-slate-200 w-1/5 align-top">
        <textarea 
          value={result.intentions[field]} 
          onChange={(e) => handleNestedChange('intentions', field, e.target.value)}
          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="p-2 border-l border-slate-200 w-1/5 align-top">
        <textarea 
          value={result.issues[field]} 
          onChange={(e) => handleNestedChange('issues', field, e.target.value)}
          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="p-2 border-l border-slate-200 w-1/5 align-top">
        <textarea 
          value={result.goalsAndMeasures[field]} 
          onChange={(e) => handleNestedChange('goalsAndMeasures', field, e.target.value)}
          className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
    </tr>
  );

  const renderArraySection = (title: string, field: string) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button 
          onClick={() => copyToClipboard(result[field].join('\n'), field)}
          className="text-slate-400 hover:text-blue-600 transition-colors"
          title="コピー"
        >
          {copiedField === field ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="space-y-2">
        {result[field].map((item: string, idx: number) => (
          <div key={idx} className="flex gap-2">
            <span className="text-slate-400 mt-2">•</span>
            <textarea
              value={item}
              onChange={(e) => handleArrayChange(field, idx, e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded bg-white min-h-[40px] resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">アセスメント情報入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            利用者の基本情報、現在の生活状況、困りごと、本人の希望などを自由に入力してください。AIが予防計画書の形式に整理します。
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：要支援1。最近膝が痛くて買い物に行くのが億劫。家の中は伝い歩きでなんとか。本人は「また友達とカラオケに行きたい」と言っている。血圧の薬を飲み忘れることがある。ヘルパーさんに掃除と買い物をお願いしたい。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIで予防計画書を生成中...
              </>
            ) : (
              'AIで予防計画書を生成する'
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
                <p>左側のフォームに情報を入力し、「生成する」ボタンを押すと、<br/>ここに予防計画書が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p>自立支援に向けた目標と具体策を構築しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-6 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した文章です。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-3 font-bold text-slate-700 w-1/5">領域</th>
                        <th className="p-3 font-bold text-slate-700 border-l border-slate-300 w-1/5">アセスメント領域と<br/>現在の状況</th>
                        <th className="p-3 font-bold text-slate-700 border-l border-slate-300 w-1/5">本人・家族の<br/>意欲・意向</th>
                        <th className="p-3 font-bold text-slate-700 border-l border-slate-300 w-1/5">領域における課題</th>
                        <th className="p-3 font-bold text-slate-700 border-l border-slate-300 w-1/5">課題に対する目標と<br/>具体策の提案</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderDomainRow("運動・移動について", "movement")}
                      {renderDomainRow("日常生活（家庭生活）について", "dailyLife")}
                      {renderDomainRow("社会参加、対人関係・コミュニケーションについて", "socialParticipation")}
                      {renderDomainRow("健康管理について", "healthManagement")}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {renderArraySection("総合的課題（優先度順）", "comprehensiveIssues")}
                    {renderArraySection("目標（合意した目標）", "agreedGoals")}
                    {renderArraySection("目標についての支援のポイント", "supportPoints")}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {renderArraySection("本人等のセルフケアや家族の支援、インフォーマルサービス", "selfCareAndInformal")}
                    {renderArraySection("介護保険サービスまたは地域支援事業", "formalServices")}
                    {renderArraySection("総合的な方針：生活不活発病の改善・予防のポイント", "comprehensivePolicy")}
                  </div>
                </div>
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">介護予防サービス・支援計画書</h1>
                
                <table className="w-full border-collapse text-xs mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 w-[15%]">領域</th>
                      <th className="border border-black p-2 w-[21%]">アセスメント領域と<br/>現在の状況</th>
                      <th className="border border-black p-2 w-[21%]">本人・家族の<br/>意欲・意向</th>
                      <th className="border border-black p-2 w-[21%]">領域における課題</th>
                      <th className="border border-black p-2 w-[22%]">課題に対する目標と<br/>具体策の提案</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 font-bold bg-gray-50">運動・移動について</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.movement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.movement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.movement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.movement}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 font-bold bg-gray-50">日常生活（家庭生活）について</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.dailyLife}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.dailyLife}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.dailyLife}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.dailyLife}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 font-bold bg-gray-50">社会参加、対人関係・コミュニケーションについて</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.socialParticipation}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.socialParticipation}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.socialParticipation}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.socialParticipation}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 font-bold bg-gray-50">健康管理について</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.healthManagement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.healthManagement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.healthManagement}</td>
                      <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.healthManagement}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="border border-black mb-4">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">総合的課題（優先度順）</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.comprehensiveIssues.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                    <div className="border border-black mb-4">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">目標（合意した目標）</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.agreedGoals.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                    <div className="border border-black">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">目標についての支援のポイント</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.supportPoints.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="border border-black mb-4">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">本人等のセルフケアや家族の支援、インフォーマルサービス</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.selfCareAndInformal.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                    <div className="border border-black mb-4">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">介護保険サービスまたは地域支援事業</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.formalServices.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                    <div className="border border-black">
                      <div className="bg-gray-100 p-1 border-b border-black font-bold">総合的な方針：生活不活発病の改善・予防のポイント</div>
                      <div className="p-2 min-h-[80px] whitespace-pre-wrap">
                        {result.comprehensivePolicy.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area (Only visible when printing) */}
      {result && (
        <div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">
          <h1 className="text-2xl font-bold text-center mb-6 border-b-2 border-black pb-2">介護予防サービス・支援計画書</h1>
          
          <table className="w-full border-collapse text-[11px] mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 w-[15%]">領域</th>
                <th className="border border-black p-2 w-[21%]">アセスメント領域と<br/>現在の状況</th>
                <th className="border border-black p-2 w-[21%]">本人・家族の<br/>意欲・意向</th>
                <th className="border border-black p-2 w-[21%]">領域における課題</th>
                <th className="border border-black p-2 w-[22%]">課題に対する目標と<br/>具体策の提案</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-50">運動・移動について</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.movement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.movement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.movement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.movement}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-50">日常生活（家庭生活）について</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.dailyLife}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.dailyLife}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.dailyLife}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.dailyLife}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-50">社会参加、対人関係・コミュニケーションについて</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.socialParticipation}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.socialParticipation}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.socialParticipation}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.socialParticipation}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-50">健康管理について</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.assessment.healthManagement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.intentions.healthManagement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.issues.healthManagement}</td>
                <td className="border border-black p-2 align-top whitespace-pre-wrap">{result.goalsAndMeasures.healthManagement}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="border border-black mb-4 break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">総合的課題（優先度順）</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.comprehensiveIssues.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
              <div className="border border-black mb-4 break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">目標（合意した目標）</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.agreedGoals.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
              <div className="border border-black break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">目標についての支援のポイント</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.supportPoints.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-black mb-4 break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">本人等のセルフケアや家族の支援、インフォーマルサービス</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.selfCareAndInformal.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
              <div className="border border-black mb-4 break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">介護保険サービスまたは地域支援事業</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.formalServices.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
              <div className="border border-black break-inside-avoid">
                <div className="bg-gray-100 p-1.5 border-b border-black font-bold">総合的な方針：生活不活発病の改善・予防のポイント</div>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {result.comprehensivePolicy.map((item: string, i: number) => <div key={i}>• {item}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
