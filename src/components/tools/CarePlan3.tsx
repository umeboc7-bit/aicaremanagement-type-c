import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, CheckCircle2 } from 'lucide-react';

export default function CarePlan3() {
  const { clientData, saveClientData } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const hours = Array.from({ length: 24 }, (_, i) => i + 4); // 4:00 to 27:00 (3:00 next day)
  const days = ['月', '火', '水', '木', '金', '土', '日'];

  // State for matrix data: { "月-10": "訪問介護", ... }
  const [matrixData, setMatrixData] = useState<Record<string, string>>({});
  // State for daily activities: { "10": "起床", ... }
  const [dailyActivities, setDailyActivities] = useState<Record<string, string>>({});
  const [nonWeeklyServices, setNonWeeklyServices] = useState('');

  useEffect(() => {
    if (clientData?.carePlan3) {
      setMatrixData(clientData.carePlan3.matrixData || {});
      setDailyActivities(clientData.carePlan3.dailyActivities || {});
      setNonWeeklyServices(clientData.carePlan3.nonWeeklyServices || '');
    }
  }, [clientData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const baseInfo = JSON.stringify(clientData?.patternA || {});
      const carePlan2 = JSON.stringify(clientData?.carePlan2 || []);
      
      const prompt = `以下の利用者情報と居宅サービス計画書（第2表）を元に、週間サービス計画表（第3表）のデータをJSON形式で作成してください。
各要素は以下のキーを持つオブジェクトとしてください:
- dailyActivities: 主な日常生活上の活動の配列。各要素は { "time": "07", "activity": "起床・洗面" } のように、時間は2桁の数字（04〜27）としてください。
- weeklyServices: 週間サービスの配列。各要素は { "day": "月", "time": "10", "service": "訪問介護" } のように、曜日は漢字1文字、時間は2桁の数字としてください。
- nonWeeklyServices: 週単位以外のサービス（テキスト）

基本情報: ${baseInfo}
第2表データ: ${carePlan2}

期待されるJSONフォーマット:
{
  "dailyActivities": [
    { "time": "07", "activity": "起床・洗面" },
    { "time": "08", "activity": "朝食" }
  ],
  "weeklyServices": [
    { "day": "月", "time": "10", "service": "訪問介護" },
    { "day": "水", "time": "14", "service": "通所介護" }
  ],
  "nonWeeklyServices": "月に1回、訪問看護を利用"
}`;
      
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const genAi = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await genAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });
      
      const text = response.text || '{}';
      const result = JSON.parse(text);
      
      if (result) {
        const newMatrix: Record<string, string> = {};
        const newActivities: Record<string, string> = {};
        
        if (Array.isArray(result.weeklyServices)) {
          result.weeklyServices.forEach((ws: any) => {
            const hour = parseInt(ws.time, 10);
            if (!isNaN(hour)) {
              newMatrix[`${ws.day}-${hour}`] = ws.service;
            }
          });
        }
        
        if (Array.isArray(result.dailyActivities)) {
          result.dailyActivities.forEach((da: any) => {
            const hour = parseInt(da.time, 10);
            if (!isNaN(hour)) {
              newActivities[`${hour}`] = da.activity;
            }
          });
        }
        
        setMatrixData(newMatrix);
        setDailyActivities(newActivities);
        setNonWeeklyServices(result.nonWeeklyServices || '');
        setSuccessMsg('AIが第3表を自動作成しました。内容を確認・修正してください。');
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
    saveClientData({ 
      carePlan3: {
        matrixData,
        dailyActivities,
        nonWeeklyServices
      }
    });
    setSuccessMsg('第3表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setMatrixData({});
    setDailyActivities({});
    setNonWeeklyServices('');
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMatrixChange = (day: string, hour: number, value: string) => {
    setMatrixData(prev => ({ ...prev, [`${day}-${hour}`]: value }));
  };

  const handleActivityChange = (hour: number, value: string) => {
    setDailyActivities(prev => ({ ...prev, [`${hour}`]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">週間サービス計画表（３）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で計画書（第3表）を作成します。
        </p>
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> クリア
            </button>
            <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> {isGenerating ? 'AIが作成中...' : 'マスターデータからAI自動作成'}
            </button>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Printer className="w-4 h-4" /> 印刷 / PDF出力
          </button>
        </div>
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:overflow-visible print:shadow-none print:border-none print:p-0">
        <div className="max-w-[1000px] mx-auto text-[11px] leading-tight">
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第３表</div>
            <h1 className="text-xl font-bold tracking-widest">週間サービス計画表</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>殿
            </div>
            <div>
              令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月分より
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black text-center" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th colSpan={2} className="border border-black p-1 w-16">時間</th>
                {days.map(day => (
                  <th key={day} className="border border-black p-1">{day}</th>
                ))}
                <th className="border border-black p-1 w-32">主な日常生活上の活動</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, idx) => {
                const displayHour = hour % 24;
                const isEven = hour % 2 === 0;
                let period = '';
                if (hour >= 4 && hour < 8) period = '早朝';
                else if (hour >= 8 && hour < 12) period = '午前';
                else if (hour >= 12 && hour < 18) period = '午後';
                else if (hour >= 18 && hour < 24) period = '夜間';
                else period = '深夜';

                return (
                  <tr key={hour} className="h-6">
                    {isEven && <td rowSpan={2} className="border border-black p-0 w-8 text-[10px] writing-vertical">{period}</td>}
                    <td className="border border-black p-0 w-8 text-right pr-1 text-[10px] border-r-2">{displayHour}:00</td>
                    {days.map(day => (
                      <td key={`${day}-${hour}`} className="border border-black p-0 border-dotted border-b-slate-400">
                        <input 
                          type="text" 
                          value={matrixData[`${day}-${hour}`] || ''}
                          onChange={(e) => handleMatrixChange(day, hour, e.target.value)}
                          className="w-full h-full outline-none bg-transparent text-center text-[10px]" 
                        />
                      </td>
                    ))}
                    <td className="border border-black p-0 border-dotted border-b-slate-400">
                      <input 
                        type="text" 
                        value={dailyActivities[`${hour}`] || ''}
                        onChange={(e) => handleActivityChange(hour, e.target.value)}
                        className="w-full h-full outline-none bg-transparent text-center text-[10px]" 
                      />
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={2} className="border border-black p-1 text-left">週単位以外のサービス</td>
                <td colSpan={8} className="border border-black p-1 text-left">
                  <input 
                    type="text" 
                    value={nonWeeklyServices}
                    onChange={(e) => setNonWeeklyServices(e.target.value)}
                    className="w-full outline-none bg-transparent" 
                    placeholder="AIが自動生成します..." 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
