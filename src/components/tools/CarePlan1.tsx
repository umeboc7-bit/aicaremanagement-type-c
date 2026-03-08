import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer, Trash2, CheckCircle2 } from 'lucide-react';
import { generateCarePlanText } from '../../services/geminiService';
import AutoResizeTextarea from '../AutoResizeTextarea';
import { APP_CONFIG } from '../../config';

export default function CarePlan1() {
  const { clientData, saveClientData } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    intention: '',
    committeeOpinion: '',
    comprehensivePolicy: ''
  });

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (clientData?.carePlan1) {
      setFormData(clientData.carePlan1);
    }
  }, [clientData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const baseInfo = JSON.stringify(clientData?.patternA || {});
      const voiceInfo = JSON.stringify(clientData?.voiceIntake || {});
      
      const promptIntention = `以下の利用者情報と面談記録を元に、居宅サービス計画書（第1表）の「利用者及び家族の生活に対する意向」を100文字程度で作成してください。\n\n基本情報: ${baseInfo}\n面談記録: ${voiceInfo}`;
      const intention = await generateCarePlanText(promptIntention);

      const promptPolicy = `以下の利用者情報と面談記録を元に、居宅サービス計画書（第1表）の「総合的な援助の方針」を200文字程度で作成してください。\n\n基本情報: ${baseInfo}\n面談記録: ${voiceInfo}`;
      const comprehensivePolicy = await generateCarePlanText(promptPolicy);

      setFormData(prev => ({
        ...prev,
        intention,
        comprehensivePolicy
      }));
      setSuccessMsg('AIが第1表を自動作成しました。内容を確認・修正してください。');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('AI生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    saveClientData({ carePlan1: formData });
    setSuccessMsg('第1表のデータを保存しました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    setFormData({
      intention: '',
      committeeOpinion: '',
      comprehensivePolicy: ''
    });
    setSuccessMsg('データをクリアしました。');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">居宅サービス計画書（１）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で計画書（第1表）を作成します。
        </p>
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
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'AIが作成中...' : 'マスターデータからAI自動作成'}
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

      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:overflow-visible print:shadow-none print:border-none print:p-0">
        <div className="max-w-[1000px] mx-auto text-[11px] leading-tight">
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第１表</div>
            <h1 className="text-xl font-bold tracking-widest">居宅サービス計画書（１）</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 flex gap-4">
              <div className="flex items-center gap-2">
                利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>殿
              </div>
              <div className="flex items-center gap-2">
                生年月日<span className="inline-block w-32 border-b border-black text-center">{clientData?.patternA?.birthDateAndAge || ''}</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                住所<span className="inline-block w-full border-b border-black">{clientData?.patternA?.address || ''}</span>
              </div>
            </div>
            <div className="border border-black px-4 py-1 ml-4">
              初回 ・ 紹介 ・ 継続
            </div>
            <div className="border border-black px-4 py-1 ml-2">
              認定済 ・ 申請中
            </div>
          </div>

          <div className="flex mb-2">
            <div className="w-48">居宅サービス計画作成者氏名</div>
            <div className="flex-1 border-b border-black">{APP_CONFIG.facility.managerName}</div>
          </div>
          <div className="flex mb-2">
            <div className="w-48">居宅介護支援事業者・事業所名及び所在地</div>
            <div className="flex-1 border-b border-black">{APP_CONFIG.facility.name} {APP_CONFIG.facility.address}</div>
          </div>

          <div className="flex gap-8 mb-2">
            <div className="flex items-center gap-2">
              居宅サービス計画作成(変更)日
              <span className="inline-block w-32 border-b border-black text-center">令和　　年　　月　　日</span>
            </div>
            <div className="flex items-center gap-2">
              初回居宅サービス計画作成日
              <span className="inline-block w-32 border-b border-black text-center">令和　　年　　月　　日</span>
            </div>
          </div>

          <div className="flex gap-8 mb-2">
            <div className="flex items-center gap-2">
              認定日
              <span className="inline-block w-32 border-b border-black text-center"></span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              認定の有効期間
              <span className="inline-block flex-1 border-b border-black text-center">～</span>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-1 w-32 text-center bg-slate-50">要介護状態区分</td>
                <td className="border border-black p-1 text-center">要支援 ・ 要支援1 ・ 要支援2 ・ 要介護1 ・ 要介護2 ・ 要介護3 ・ 要介護4 ・ 要介護5</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50">利用者及び家族<br/>の生活に対する意向</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea 
                    name="intention"
                    value={formData.intention}
                    onChange={handleChange}
                    className="w-full min-h-[120px] outline-none bg-transparent" 
                    placeholder="AIが自動生成します..."
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50">介護認定審査会の<br/>意見及びサービスの<br/>種類の指定</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea 
                    name="committeeOpinion"
                    value={formData.committeeOpinion}
                    onChange={handleChange}
                    className="w-full min-h-[80px] outline-none bg-transparent" 
                    placeholder="AIが自動生成します..."
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50">総合的な援助の<br/>方　　　　　針</td>
                <td className="border border-black p-2 align-top">
                  <AutoResizeTextarea 
                    name="comprehensivePolicy"
                    value={formData.comprehensivePolicy}
                    onChange={handleChange}
                    className="w-full min-h-[160px] outline-none bg-transparent" 
                    placeholder="AIが自動生成します..."
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center bg-slate-50">生活援助中心型の<br/>算 定 理 由</td>
                <td className="border border-black p-1">
                  <div className="flex gap-4">
                    <span>1. 一人暮らし</span>
                    <span>2. 家族等が障害、疾病等</span>
                    <span>3. その他 ( <input type="text" className="w-64 border-b border-black outline-none bg-transparent" /> )</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex border-2 border-black">
            <div className="flex-1 p-2 flex items-center">
              居宅サービス計画について説明をうけ、内容に同意し、交付を受けました。
            </div>
            <div className="border-l border-black p-2 flex items-center gap-2">
              説明・同意・交付日
              <span className="inline-block w-8 text-center"></span>年
              <span className="inline-block w-8 text-center"></span>月
              <span className="inline-block w-8 text-center"></span>日
            </div>
            <div className="border-l border-black p-2 flex items-center gap-4">
              利用者同意欄
              <span className="inline-block w-24 h-8 border border-slate-300"></span>印
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
