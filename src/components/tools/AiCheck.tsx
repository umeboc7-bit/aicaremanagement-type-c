import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useClient } from '../../context/ClientContext';
import { checkCarePlanConsistency } from '../../services/geminiService';

export default function AiCheck() {
  const { clientData } = useClient();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const planData = {
        carePlan1: clientData?.carePlan1 || {},
        carePlan2: clientData?.carePlan2 || [],
      };
      
      const checkResults = await checkCarePlanConsistency(planData);
      setResults(checkResults);
    } catch (error) {
      console.error(error);
      alert('チェック中にエラーが発生しました。');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">AI整合性チェック（1〜3表）</h2>
        <p className="text-sm text-slate-600 mb-6">
          アセスメント（第1表）、ケアプラン（第2表）、週間計画（第3表）の内容に矛盾や抜け漏れがないか、AIが自動でチェックし、実地指導での指摘リスクを減らします。
        </p>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isChecking ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
            {isChecking ? 'AIが整合性を確認中...' : '書類全体の整合性をチェックする'}
          </button>
        </div>

        {results && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">チェック結果</h3>
            
            <div className="grid gap-4">
              {results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-start gap-3 border ${
                    result.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {result.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm leading-relaxed">{result.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
              <p className="font-bold mb-2">💡 AIからのアドバイス</p>
              <p>
                警告（黄色）の項目について、第2表の目標設定を見直すか、第1表の課題記述を修正することをお勧めします。
                修正後、再度チェックを実行してください。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
