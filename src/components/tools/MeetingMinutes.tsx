import React from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Wand2, Printer } from 'lucide-react';
import { APP_CONFIG } from '../../config';

export default function MeetingMinutes() {
  const { clientData } = useClient();

  const handleGenerate = () => {
    alert('マスターデータからAI自動作成を実行します（実装予定）');
  };

  const handleSave = () => {
    alert('この書類のデータを保存します（実装予定）');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-2">サービス担当者会議の要点（４）</h2>
        <p className="text-sm text-slate-600 mb-4">
          マスターデータに入力された情報を元に、AIが自動で会議の要点（第4表）を作成します。
        </p>
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={handleGenerate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Wand2 className="w-4 h-4" /> マスターデータからAI自動作成
            </button>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Printer className="w-4 h-4" /> 印刷 / PDF出力
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:overflow-visible print:shadow-none print:border-none print:p-0">
        <div className="max-w-[1000px] mx-auto text-[11px] leading-tight">
          <div className="flex justify-between items-end mb-2">
            <div className="border border-black px-2 py-1">第４表</div>
            <h1 className="text-xl font-bold tracking-widest">サービス担当者会議の要点</h1>
            <div className="flex items-center gap-2">
              <div className="border border-black px-2 py-1">作成年月日</div>
              <div>令和<span className="inline-block w-6 border-b border-black"></span>年<span className="inline-block w-6 border-b border-black"></span>月<span className="inline-block w-6 border-b border-black"></span>日</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              利用者名<span className="inline-block w-40 border-b border-black text-center">{clientData?.patternA?.name || ''}</span>殿
            </div>
            <div className="flex items-center gap-2">
              居宅サービス計画作成者(担当者)氏名<span className="inline-block w-40 border-b border-black text-center">{APP_CONFIG.facility.managerName}</span>
            </div>
          </div>

          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-2">
              開催日<span className="inline-block w-32 border-b border-black text-center">令和　　年　　月　　日</span>
            </div>
            <div className="flex items-center gap-2">
              開催場所<span className="inline-block w-32 border-b border-black text-center">自宅</span>
            </div>
            <div className="flex items-center gap-2">
              開催時間<span className="inline-block w-32 border-b border-black text-center">10:30</span>
            </div>
            <div className="flex items-center gap-2">
              開催回数<span className="inline-block w-32 border-b border-black text-center"></span>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-4">
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td rowSpan={4} className="border border-black p-2 text-center bg-slate-50 font-bold">会議出席者</td>
                <td className="border border-black p-1 text-center bg-slate-50">所　属(職種)</td>
                <td className="border border-black p-1 text-center bg-slate-50">氏　名</td>
                <td className="border border-black p-1 text-center bg-slate-50">所　属(職種)</td>
                <td className="border border-black p-1 text-center bg-slate-50">氏　名</td>
                <td className="border border-black p-1 text-center bg-slate-50">所　属(職種)</td>
                <td className="border border-black p-1 text-center bg-slate-50">氏　名</td>
              </tr>
              <tr>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" defaultValue="本人様" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
              </tr>
              <tr>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
              </tr>
              <tr>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
                <td className="border border-black p-1"><input type="text" className="w-full outline-none bg-transparent" /></td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50 font-bold">検討した項目</td>
                <td colSpan={6} className="border border-black p-2 h-24 align-top">
                  <textarea className="w-full h-full resize-none outline-none bg-transparent" placeholder="AIが自動生成します..."></textarea>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50 font-bold">検討内容</td>
                <td colSpan={6} className="border border-black p-2 h-48 align-top">
                  <textarea className="w-full h-full resize-none outline-none bg-transparent" placeholder="AIが自動生成します..."></textarea>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50 font-bold">結論</td>
                <td colSpan={6} className="border border-black p-2 h-48 align-top">
                  <textarea className="w-full h-full resize-none outline-none bg-transparent" placeholder="AIが自動生成します..."></textarea>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center bg-slate-50 font-bold">残された課題<br/><br/>(次回の開催時期)</td>
                <td colSpan={6} className="border border-black p-2 h-24 align-top">
                  <textarea className="w-full h-full resize-none outline-none bg-transparent" placeholder="AIが自動生成します..."></textarea>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
