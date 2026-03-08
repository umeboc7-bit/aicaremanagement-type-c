import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, CalendarDays, Calculator, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { generateStructuredData, carePlan6Schema } from '../../services/ai';

const SYSTEM_PROMPT = `
あなたは日本における熟練した介護支援専門員（ケアマネジャー）です。
入力された「第3表（週間計画）」のデータをもとに、
月間サービス計画表（第6表）を自動作成してください。
週間計画のサービスを1ヶ月（31日）のスケジュールに展開し、
各サービスの単位数（概算）も設定してください。
出力はJSON形式で返してください。
`;

export default function CarePlan6() {
  const { clientData, saveClientData } = useClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    services: [
      { name: '通所介護（デイサービス）', provider: '〇〇事業所', type: '通所', unit: 650, schedule: Array(31).fill('') },
      { name: '訪問介護（身体介護）', provider: '〇〇事業所', type: '訪問', unit: 250, schedule: Array(31).fill('') },
      { name: '福祉用具貸与（ベッド）', provider: '〇〇事業所', type: '福祉用具', unit: 1500, schedule: Array(31).fill('') },
      ...Array(5).fill({ name: '', provider: '', type: '', unit: 0, schedule: Array(31).fill('') })
    ]
  });

  useEffect(() => {
    if (clientData?.carePlan6) {
      setFormData(clientData.carePlan6);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    if (!clientData?.carePlan3) {
      alert('第3表（週間計画）のデータがありません。先に第3表を作成・保存してください。');
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    
    const prompt = `
【第3表（週間計画）】
${JSON.stringify(clientData?.carePlan3 || {})}
    `;

    try {
      const data = await generateStructuredData(prompt, SYSTEM_PROMPT, carePlan6Schema);
      
      const newServices = [...data.services];
      while (newServices.length < 8) {
        newServices.push({ name: '', provider: '', type: '', unit: 0, schedule: Array(31).fill('') });
      }
      
      setFormData({
        year: data.year || '',
        month: data.month || '',
        services: newServices.slice(0, 8)
      });
      setSuccessMsg('第3表から第6表を自動展開しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('AIの生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveClientData({ carePlan6: formData });
    setSuccessMsg('第6表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData({
      year: '',
      month: '',
      services: [
        { name: '通所介護（デイサービス）', provider: '〇〇事業所', type: '通所', unit: 650, schedule: Array(31).fill('') },
        { name: '訪問介護（身体介護）', provider: '〇〇事業所', type: '訪問', unit: 250, schedule: Array(31).fill('') },
        { name: '福祉用具貸与（ベッド）', provider: '〇〇事業所', type: '福祉用具', unit: 1500, schedule: Array(31).fill('') },
        ...Array(5).fill({ name: '', provider: '', type: '', unit: 0, schedule: Array(31).fill('') })
      ]
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handleScheduleChange = (serviceIndex: number, dayIndex: number, value: string) => {
    const newServices = [...formData.services];
    const newSchedule = [...newServices[serviceIndex].schedule];
    newSchedule[dayIndex] = value;
    newServices[serviceIndex] = { ...newServices[serviceIndex], schedule: newSchedule };
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const calculateTotalUnits = () => {
    return formData.services.reduce((acc, curr) => {
      const times = curr.schedule.filter((s: string) => s !== '').length;
      return acc + (Number(curr.unit) || 0) * times;
    }, 0);
  };

  const totalUnits = calculateTotalUnits();
  const limitUnits = 16765; // 要介護2の目安

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">月間サービス計画表（６）＆単位数計算</h2>
        <p className="text-sm text-slate-600 mb-4">
          第3表（週間計画）の内容を月間カレンダーに自動展開し、介護報酬の単位数をリアルタイムで計算します。
        </p>
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> クリア
            </button>
            <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              第3表から自動展開
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
          <div className="flex justify-between items-end mb-4">
            <div className="border border-black px-2 py-1">第６表</div>
            <h1 className="text-xl font-bold tracking-widest">居宅サービス計画書（６）</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>様
            </div>
            <div className="flex items-center gap-2">
              提供年月<span className="inline-block w-20 border-b border-black text-center"><input type="text" value={formData.year} onChange={(e) => handleChange('year', e.target.value)} className="w-6 outline-none bg-transparent text-center" />年<input type="text" value={formData.month} onChange={(e) => handleChange('month', e.target.value)} className="w-6 outline-none bg-transparent text-center" />月</span>分
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-6" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="border border-black p-1 bg-slate-50 font-normal w-32">サービス内容</th>
                <th className="border border-black p-1 bg-slate-50 font-normal w-20">事業所名</th>
                {daysInMonth.map(day => (
                  <th key={day} className="border border-black p-1 bg-slate-50 font-normal w-6 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formData.services.map((service, i) => (
                <tr key={i} className="h-8 border-b border-black">
                  <td className="border-r border-black p-1"><input type="text" value={service.name} onChange={(e) => handleServiceChange(i, 'name', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  <td className="border-r border-black p-1"><input type="text" value={service.provider} onChange={(e) => handleServiceChange(i, 'provider', e.target.value)} className="w-full outline-none bg-transparent" /></td>
                  {daysInMonth.map((day, dayIndex) => (
                    <td key={day} className="border-r border-black p-0 text-center">
                      <input 
                        type="text" 
                        value={service.schedule[dayIndex] || ''} 
                        onChange={(e) => handleScheduleChange(i, dayIndex, e.target.value)} 
                        className="w-full h-full outline-none bg-transparent text-center" 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-slate-50 border-2 border-black p-4 rounded flex items-center justify-between no-print">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Calculator className="w-5 h-5" />
              <span>利用単位数計算（概算）</span>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-slate-500 mr-2">合計単位数:</span>
                <span className="font-bold text-lg">{totalUnits.toLocaleString()} 単位</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">区分支給限度基準額:</span>
                <span className="font-bold text-lg">{limitUnits.toLocaleString()} 単位</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">残余単位数:</span>
                <span className={`font-bold text-lg ${limitUnits - totalUnits < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(limitUnits - totalUnits).toLocaleString()} 単位
                </span>
              </div>
            </div>
          </div>
          {limitUnits - totalUnits < 0 && (
            <p className="text-red-600 text-xs mt-2 font-bold no-print">※限度額を超過しています。プランの見直しが必要です。</p>
          )}

        </div>
      </div>
    </div>
  );
}
