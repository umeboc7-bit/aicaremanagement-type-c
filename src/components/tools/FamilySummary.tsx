import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Printer, Heart, Sun, Coffee, Home, Activity, CalendarDays, Wand2, Trash2, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '../../config';

export default function FamilySummary() {
  const { clientData, saveClientData } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [summaryData, setSummaryData] = useState({
    target: '「住み慣れたご自宅で、ご家族と一緒に安心して笑顔で過ごせること」を目標にサポートさせていただきます。特に、足腰の筋力を維持し、ご自宅内での転倒を防ぐことを第一に考えます。',
    points: [
      { title: 'ご自宅での安全確保', description: 'お風呂場やトイレに手すりを設置し、安全に移動できるようにします。', iconType: 'home' },
      { title: '日中の活動とリフレッシュ', description: '週に2回デイサービスに通い、お友達とのおしゃべりや体操を楽しみます。ご家族の休息時間も確保します。', iconType: 'coffee' }
    ],
    schedule: ['-', 'デイサービス', '訪問ヘルパー', '-', 'デイサービス', '-', '-']
  });

  useEffect(() => {
    if (clientData?.familySummary) {
      setSummaryData(clientData.familySummary);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const plan1 = JSON.stringify(clientData?.carePlan1 || {});
      const plan2 = JSON.stringify(clientData?.carePlan2 || []);
      const plan3 = JSON.stringify(clientData?.carePlan3 || {});
      
      const prompt = `以下の居宅サービス計画書（第1表〜第3表）のデータを元に、ご家族向けに専門用語を避けた温かみのある分かりやすい言葉でサマリーを作成し、JSON形式で返してください。

各要素は以下のキーを持つオブジェクトとしてください:
- target: 目指す暮らしの姿（目標）。2〜3文程度。
- points: サポートのポイントの配列（最大3つ）。各要素は { "title": "...", "description": "...", "iconType": "home" | "coffee" | "activity" }
- schedule: 1週間のスケジュールイメージ。月曜日から日曜日までの7つの要素を持つ配列。サービスがない日は "-"、ある日は "デイサービス" のように短いサービス名を入れてください。

第1表データ: ${plan1}
第2表データ: ${plan2}
第3表データ: ${plan3}

期待されるJSONフォーマット:
{
  "target": "...",
  "points": [
    { "title": "...", "description": "...", "iconType": "home" }
  ],
  "schedule": ["-", "デイサービス", "訪問ヘルパー", "-", "デイサービス", "-", "-"]
}`;
      
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const genAi = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await genAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        }
      });
      
      const text = response.text || '{}';
      const result = JSON.parse(text);
      
      if (result && result.target) {
        setSummaryData({
          target: result.target,
          points: Array.isArray(result.points) ? result.points : [],
          schedule: Array.isArray(result.schedule) && result.schedule.length === 7 ? result.schedule : ['-', '-', '-', '-', '-', '-', '-']
        });
        setSuccessMsg('AIが家族向けサマリーを自動作成しました。内容を確認・修正してください。');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error(error);
      alert('AI生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    saveClientData({ familySummary: summaryData });
    setSuccessMsg('家族向けサマリーを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setSummaryData({
      target: '',
      points: [],
      schedule: ['-', '-', '-', '-', '-', '-', '-']
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-blue-600" />;
      case 'coffee': return <Coffee className="w-5 h-5 text-green-600" />;
      case 'activity': return <Activity className="w-5 h-5 text-orange-600" />;
      default: return <Heart className="w-5 h-5 text-pink-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'home': return 'bg-blue-100';
      case 'coffee': return 'bg-green-100';
      case 'activity': return 'bg-orange-100';
      default: return 'bg-pink-100';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">家族向けサマリー（要約）</h2>
        <p className="text-sm text-slate-600 mb-4">
          専門用語が並ぶケアプラン（第1表、第2表）を、ご家族向けに温かみのある分かりやすい言葉とイラストで1枚のレポートに自動生成します。
        </p>
        <div className="flex justify-end items-center bg-slate-100 p-3 rounded-lg gap-2">
          <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> 保存
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
            <Trash2 className="w-4 h-4" /> クリア
          </button>
          <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> {isGenerating ? 'AIが作成中...' : 'マスターデータからAI自動作成'}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Printer className="w-4 h-4" /> ご家族へお渡し用（印刷/PDF）
          </button>
        </div>
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 print:overflow-visible print:shadow-none print:border-none print:p-0">
        <div className="max-w-[800px] mx-auto text-slate-800 font-sans">
          
          <div className="text-center mb-10 border-b-4 border-orange-200 pb-6">
            <h1 className="text-3xl font-bold text-orange-800 mb-4 flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 text-orange-500 fill-orange-500" />
              これからの生活サポート計画
            </h1>
            <p className="text-lg text-slate-600">
              <span className="font-bold text-2xl border-b-2 border-slate-400 px-4">{clientData?.patternA?.name || '山田 太郎'}</span> さま と ご家族の皆さまへ
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <Sun className="w-6 h-6 text-orange-500" />
                目指す暮らしの姿（目標）
              </h2>
              <p className="text-lg leading-relaxed text-slate-700">
                {summaryData.target}
              </p>
            </section>

            <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500" />
                サポートのポイント
              </h2>
              <ul className="space-y-4">
                {summaryData.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                    <div className={`${getIconBg(point.iconType)} p-2 rounded-full mt-1`}>{getIcon(point.iconType)}</div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{point.title}</h3>
                      <p className="text-slate-600">{point.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-emerald-500" />
                1週間のスケジュールイメージ
              </h2>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['月', '火', '水', '木', '金', '土', '日'].map((day, i) => (
                  <div key={day} className="bg-white rounded-lg p-2 shadow-sm border border-slate-200">
                    <div className="font-bold text-slate-700 border-b pb-1 mb-2">{day}</div>
                    <div className="text-sm text-slate-600 min-h-[60px] flex items-center justify-center">
                      {summaryData.schedule[i] !== '-' ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium whitespace-pre-wrap">{summaryData.schedule[i]}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-12 text-right text-slate-600">
              <p>作成日：令和6年10月1日</p>
              <p>担当ケアマネジャー：{APP_CONFIG.facility.managerName}（連絡先：{APP_CONFIG.facility.phone}）</p>
              <p className="text-sm mt-2">※ご不明な点やご不安なことがあれば、いつでもお気軽にご連絡ください。</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
