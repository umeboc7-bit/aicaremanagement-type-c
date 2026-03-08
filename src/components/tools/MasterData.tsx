import React, { useState, useEffect } from 'react';
import { generateStructuredData, patternASchema, patternBSchema } from '../../services/ai';
import { Loader2, Save, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { useClient } from '../../context/ClientContext';
import PatternAForm from './PatternAForm';
import PatternBForm from './PatternBForm';

const SYSTEM_PROMPT_A = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「利用者の初回面談メモや基本情報」から、
「利用開始時 基本情報（パターンA）」のフォーマットに沿って情報を整理・抽出してください。
情報が不足している項目は空欄（または「記載なし」）としてください。
出力はJSON形式で返してください。
`;

const SYSTEM_PROMPT_B = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「利用者のアセスメントメモや詳細な状態」から、
「アセスメント（パターンB）」のフォーマットに沿って情報を整理・抽出してください。
情報が不足している項目は空欄（または「記載なし」）としてください。
出力はJSON形式で返してください。
`;

export default function MasterData() {
  const { clientData, saveClientData, clearClientData } = useClient();
  const [activeTab, setActiveTab] = useState<'patternA' | 'patternB'>('patternA');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formDataA, setFormDataA] = useState<any>(null);
  const [formDataB, setFormDataB] = useState<any>(null);

  useEffect(() => {
    if (clientData?.patternA) setFormDataA(clientData.patternA);
    if (clientData?.patternB) setFormDataB(clientData.patternB);
  }, [clientData]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('情報を入力してください。');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (activeTab === 'patternA') {
        const data = await generateStructuredData(input, SYSTEM_PROMPT_A, patternASchema);
        setFormDataA(data.basicInfo);
      } else {
        const data = await generateStructuredData(input, SYSTEM_PROMPT_B, patternBSchema);
        setFormDataB(data.assessment);
      }
    } catch (err) {
      setError('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveClientData({
      patternA: formDataA,
      patternB: formDataB
    });
    setSuccessMsg('基本情報を保存しました。他の書類作成時に自動的に読み込まれます。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    clearClientData();
    setFormDataA(null);
    setFormDataB(null);
    setInput('');
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChangeA = (field: string, value: string) => {
    setFormDataA({ ...formDataA, [field]: value });
  };

  const handleChangeADaily = (field: string, value: string) => {
    setFormDataA({ 
      ...formDataA, 
      dailyRoutine: { ...(formDataA?.dailyRoutine || {}), [field]: value } 
    });
  };

  const handleChangeB = (category: string, field: string, value: string) => {
    if (category === 'historyToService') {
      setFormDataB({ ...formDataB, [category]: value });
    } else {
      setFormDataB({
        ...formDataB,
        [category]: { ...(formDataB?.[category] || {}), [field]: value }
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">第一ステップ：利用者基本情報（マスターデータ）</h2>
        <p className="text-sm text-slate-600 mb-4">
          ここで入力・保存した利用者の情報はアプリ全体で記憶され、他の書類（居宅サービス計画書、支援経過記録など）を作成する際に自動的に転記・反映されます。
        </p>

        <div className="flex border-b border-slate-200 mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'patternA' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('patternA')}
          >
            パターンA（利用開始時基本情報）
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'patternB' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('patternB')}
          >
            パターンB（アセスメント詳細）
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            AIで自動入力（フリーテキストから抽出）
          </label>
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-24 text-sm"
              placeholder="面談のメモや既存のテキストを貼り付けてください。AIが自動で下の各項目に振り分けます。"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 min-w-[120px] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'AIで抽出'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              クリア
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            印刷 / PDF出力
          </button>
        </div>
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        {activeTab === 'patternA' ? (
          <PatternAForm formData={formDataA} onChange={handleChangeA} onDailyChange={handleChangeADaily} />
        ) : (
          <PatternBForm formData={formDataB} onChange={handleChangeB} />
        )}
      </div>
    </div>
  );
}
