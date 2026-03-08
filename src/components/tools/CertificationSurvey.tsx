import React, { useState } from 'react';
import { generateStructuredData, certificationSurveySchema } from '../../services/ai';
import { Loader2, Copy, Check, AlertCircle, Printer, Edit, Eye } from 'lucide-react';

const SYSTEM_PROMPT = `
あなたは日本における熟練した認定調査員（ケアマネジャー）です。
入力された「利用者の状態に関するメモや聞き取り内容」から、
「要介護認定調査票（特記事項）」の各項目に該当する内容を整理して出力してください。

以下の点に注意してください：
1. 第1群（身体機能・起居動作）〜 第5群（社会生活への適応）の各項目について、入力情報から該当する特記事項を抽出・整理してください。
2. 選択肢の根拠となる具体的なエピソードや頻度、介助の方法などを客観的かつ簡潔に記載してください。
3. 入力情報に該当する内容がない項目は「記載なし」としてください。

出力はJSON形式で返してください。
`;

export default function CertificationSurvey() {
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
      const data = await generateStructuredData(input, SYSTEM_PROMPT, certificationSurveySchema);
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

  const handleItemChange = (groupIndex: number, itemIndex: number, value: string) => {
    const newGroups = [...result.groups];
    newGroups[groupIndex].items[itemIndex].note = value;
    setResult({ ...result, groups: newGroups });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full no-print">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-2">調査メモ入力</h2>
          <p className="text-sm text-slate-500 mb-4">
            認定調査時の聞き取りメモや、利用者の状態に関する情報を自由に入力してください。AIが特記事項として各群・項目に整理します。
          </p>
          <textarea
            className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：右半身麻痺あり。歩行は杖を使用しているが、室内でも時々転倒する。トイレは日中は自分で行けるが、ズボンの上げ下ろしに一部介助が必要。夜間はポータブルトイレを使用しているが、たまに失敗して家族が片付けている。最近、直前のことを忘れることが多くなり、同じことを何度も聞いてくる。食事は自分で食べられるが、むせることが増えた。"
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
                AIで特記事項を生成中...
              </>
            ) : (
              'AIで特記事項を生成する'
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
                <p>左側のフォームにメモを入力し、「生成する」ボタンを押すと、<br/>ここに認定調査票の特記事項が自動配置されます。</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>調査メモを解析し、各群・項目に特記事項を整理しています...</p>
              </div>
            )}
            
            {result && viewMode === 'edit' && (
              <div className="space-y-6 pb-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  AIが生成した特記事項です。情報がない項目は「記載なし」となっています。必要に応じて直接テキストを修正（目視チェック）してください。
                </div>

                {result.groups?.map((group: any, gIdx: number) => {
                  // 記載なし以外の項目があるかチェック
                  const hasContent = group.items.some((item: any) => item.note !== '記載なし');
                  
                  return (
                    <div key={gIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-800 flex justify-between items-center">
                        <span>{group.groupName}</span>
                        {!hasContent && <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">特記事項なし</span>}
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {group.items.map((item: any, iIdx: number) => (
                          <div key={iIdx} className={`p-4 ${item.note !== '記載なし' ? 'bg-white' : 'bg-slate-50 opacity-70'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-slate-700 text-sm">{item.id} {item.name}</span>
                              <button 
                                onClick={() => copyToClipboard(item.note, `${gIdx}-${iIdx}`)}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="コピー"
                              >
                                {copiedField === `${gIdx}-${iIdx}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            <textarea 
                              value={item.note}
                              onChange={(e) => handleItemChange(gIdx, iIdx, e.target.value)}
                              className={`w-full p-3 text-sm border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                item.note !== '記載なし' 
                                  ? 'border-slate-300 bg-white min-h-[80px]' 
                                  : 'border-slate-200 bg-slate-50 min-h-[40px] text-slate-500'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Print Preview Mode inside the container */}
            {result && viewMode === 'preview' && (
              <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[800px] text-black font-serif">
                <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">要介護認定調査票（特記事項）</h1>
                
                {result.groups?.map((group: any, gIdx: number) => {
                  // 記載なし以外の項目のみ抽出
                  const activeItems = group.items.filter((item: any) => item.note !== '記載なし');
                  
                  if (activeItems.length === 0) return null; // 特記事項がない群は非表示

                  return (
                    <div key={gIdx} className="mb-6">
                      <h2 className="text-lg font-bold bg-gray-100 p-2 border border-black border-b-0">{group.groupName}</h2>
                      <table className="w-full border-collapse text-sm">
                        <tbody>
                          {activeItems.map((item: any, iIdx: number) => (
                            <tr key={iIdx} className="border border-black">
                              <td className="w-1/3 p-2 border-r border-black font-bold align-top bg-gray-50">
                                {item.id} {item.name}
                              </td>
                              <td className="w-2/3 p-2 align-top whitespace-pre-wrap">
                                {item.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
                
                {/* すべての群で特記事項がない場合のメッセージ */}
                {result.groups?.every((group: any) => group.items.every((item: any) => item.note === '記載なし')) && (
                  <div className="text-center p-8 border border-black">
                    特記事項に該当する情報はありません。
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area (Only visible when printing) */}
      {result && (
        <div className="hidden print-only print:overflow-visible print:shadow-none print:border-none bg-white text-black font-serif p-8">
          <h1 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-2">要介護認定調査票（特記事項）</h1>
          
          {result.groups?.map((group: any, gIdx: number) => {
            const activeItems = group.items.filter((item: any) => item.note !== '記載なし');
            if (activeItems.length === 0) return null;

            return (
              <div key={gIdx} className="mb-8 break-inside-avoid">
                <h2 className="text-lg font-bold bg-gray-100 p-2 border border-black border-b-0">{group.groupName}</h2>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {activeItems.map((item: any, iIdx: number) => (
                      <tr key={iIdx} className="border border-black">
                        <td className="w-1/3 p-3 border-r border-black font-bold align-top bg-gray-50">
                          {item.id} {item.name}
                        </td>
                        <td className="w-2/3 p-3 align-top whitespace-pre-wrap leading-relaxed">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
