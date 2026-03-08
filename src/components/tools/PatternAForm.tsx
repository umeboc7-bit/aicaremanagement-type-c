import React from 'react';
import { useClient } from '../../context/ClientContext';

const Th = ({ children, rs = 1, cs = 1, className = "" }: any) => (
  <th rowSpan={rs} colSpan={cs} className={`border border-black p-1 bg-white font-normal text-center align-middle ${className}`}>{children}</th>
);
const Td = ({ children, rs = 1, cs = 1, className = "" }: any) => (
  <td rowSpan={rs} colSpan={cs} className={`border border-black p-1 align-top ${className}`}>{children}</td>
);

export default function PatternAForm({ formData, onChange, onDailyChange }: { formData: any, onChange: (f: string, v: string) => void, onDailyChange: (f: string, v: string) => void }) {
  const { clientData, saveClientData } = useClient();
  const checks = clientData?.checkboxes || {};

  const toggleCheck = (id: string) => {
    saveClientData({ checkboxes: { ...checks, [id]: !checks[id] } });
  };

  const renderInput = (field: string) => (
    <input type="text" value={formData?.[field] || ''} onChange={(e) => onChange(field, e.target.value)} className="w-full h-full outline-none bg-transparent" />
  );
  const renderTextarea = (field: string, isDaily = false, className = "") => (
    <textarea value={isDaily ? formData?.dailyRoutine?.[field] || '' : formData?.[field] || ''} onChange={(e) => isDaily ? onDailyChange(field, e.target.value) : onChange(field, e.target.value)} className={`w-full h-full outline-none bg-transparent resize-none min-h-[60px] ${className}`} />
  );
  const renderCheck = (id: string, label: string) => (
    <label className="flex items-center gap-1 text-[10px] cursor-pointer hover:bg-slate-100 p-0.5 rounded"><input type="checkbox" checked={!!checks[id]} onChange={() => toggleCheck(id)} /> {label}</label>
  );

  return (
    <div className="w-full overflow-x-auto print:overflow-visible print:shadow-none print:border-none print:p-0">
      <h1 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">利用開始時 基本情報</h1>
      <table className="w-full border-collapse border-2 border-black text-[11px] leading-tight" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          <tr>
            <Th className="font-bold text-sm">利用者様氏名</Th>
            <Td>{renderInput("name")}</Td>
            <Th className="font-bold text-sm">生年月日・年齢</Th>
            <Td>{renderInput("birthDateAndAge")}</Td>
            <Th rs={12} className="writing-vertical text-center font-bold">1日の過ごし方</Th>
            <Th rs={3} className="writing-vertical text-center">早朝</Th>
            <Td rs={3}>{renderTextarea("earlyMorning", true)}</Td>
          </tr>
          <tr>
            <Th className="font-bold">要介護度</Th>
            <Td>{renderInput("careLevel")}</Td>
            <Th className="font-bold">自立度<br/><span className="text-[9px]">(意見書＋実際)</span></Th>
            <Td>{renderInput("independenceLevel")}</Td>
          </tr>
          <tr>
            <Th className="font-bold">主治医</Th>
            <Td>{renderInput("doctor")}</Td>
            <Th className="font-bold">緊急連絡先<br/>希望搬送先</Th>
            <Td>{renderInput("emergencyContact")}</Td>
          </tr>
          <tr>
            <Th className="font-bold">診断名</Th>
            <Td>
              {renderCheck("diag1", "生活機能低下の原因")}
              {renderCheck("diag2", "主治医意見書診断名")}
              {renderCheck("diag3", "その他の疾病")}
              {renderTextarea("diagnosis", false, "mt-1")}
            </Td>
            <Th className="font-bold">利用までの経過</Th>
            <Td>
              {renderCheck("hist1", "認定を受けた時期")}
              {renderCheck("hist2", "入院とその原因")}
              {renderCheck("hist3", "介護サービスの利用")}
              {renderTextarea("historyToUse", false, "mt-1")}
            </Td>
            <Th rs={3} className="writing-vertical text-center">午前</Th>
            <Td rs={3}>{renderTextarea("morning", true)}</Td>
          </tr>
          <tr>
            <Th className="font-bold">本人・家族の意向</Th>
            <Td>
              {renderCheck("int1", "どのように暮らしたいか")}
              {renderCheck("int2", "サービスへの要望")}
              {renderTextarea("intentions", false, "mt-1")}
            </Td>
            <Th className="font-bold">本人の人となり</Th>
            <Td>
              {renderCheck("per1", "性格")}
              {renderCheck("per2", "生まれ")}
              {renderCheck("per3", "家族歴")}
              {renderCheck("per4", "職業歴など")}
              {renderTextarea("personality", false, "mt-1")}
            </Td>
          </tr>
          <tr>
            <Th className="font-bold">食事・口腔</Th>
            <Td>
              {renderCheck("meal1", "食事形態")}
              {renderCheck("meal2", "アレルギー、嗜好")}
              {renderCheck("meal3", "使用用具")}
              {renderCheck("meal4", "義歯、口腔ケア")}
              {renderCheck("meal5", "嚥下、トロミ")}
              {renderTextarea("meals", false, "mt-1")}
            </Td>
            <Th className="font-bold">認知症</Th>
            <Td>
              {renderCheck("cog1", "記憶")}
              {renderCheck("cog2", "時・場所・人の見当識")}
              {renderCheck("cog3", "判断力")}
              {renderCheck("cog4", "長谷川式")}
              {renderCheck("cog5", "日常生活上の困りごと")}
              {renderTextarea("cognition", false, "mt-1")}
            </Td>
          </tr>
          <tr>
            <Th className="font-bold">排泄</Th>
            <Td>
              {renderCheck("exc1", "尿便意")}
              {renderCheck("exc2", "用具")}
              {renderCheck("exc3", "必要な介助")}
              {renderCheck("exc4", "便秘、下剤")}
              {renderCheck("exc5", "日中・夜間の違い")}
              {renderTextarea("excretion", false, "mt-1")}
            </Td>
            <Th className="font-bold">コミュニケーション</Th>
            <Td>
              {renderCheck("com1", "視力・聴力")}
              {renderCheck("com2", "言語")}
              {renderCheck("com3", "意思の伝達と理解")}
              {renderCheck("com4", "会話の程度")}
              {renderTextarea("communication", false, "mt-1")}
            </Td>
            <Th rs={3} className="writing-vertical text-center">午後</Th>
            <Td rs={3}>{renderTextarea("afternoon", true)}</Td>
          </tr>
          <tr>
            <Th className="font-bold">入浴</Th>
            <Td>
              {renderCheck("bat1", "入浴形態")}
              {renderCheck("bat2", "希望時間")}
              {renderCheck("bat3", "異性介助の可否")}
              {renderCheck("bat4", "必要な介助")}
              {renderCheck("bat5", "生活習慣など")}
              {renderTextarea("bathing", false, "mt-1")}
            </Td>
            <Th className="font-bold">楽しみ・役割</Th>
            <Td>
              {renderCheck("rol1", "趣味、特技")}
              {renderCheck("rol2", "自宅・デイでの役割")}
              {renderCheck("rol3", "日課")}
              {renderTextarea("roles", false, "mt-1")}
            </Td>
          </tr>
          <tr>
            <Th className="font-bold">移動</Th>
            <Td>
              {renderCheck("mob1", "寝返り、起き上がり")}
              {renderCheck("mob2", "座位保持、立ち上がり")}
              {renderCheck("mob3", "立位、移乗、歩行、移動")}
              {renderTextarea("mobility", false, "mt-1")}
            </Td>
            <Th className="font-bold">リハビリ</Th>
            <Td>
              {renderCheck("reh1", "機能的な訓練")}
              {renderCheck("reh2", "楽しみや役割の中で機能訓練として考えるもの")}
              {renderTextarea("rehabilitation", false, "mt-1")}
            </Td>
          </tr>
          <tr>
            <Th className="font-bold">睡眠</Th>
            <Td>
              {renderCheck("slp1", "寝具")}
              {renderCheck("slp2", "夜間の排泄")}
              {renderCheck("slp3", "睡眠状況")}
              {renderCheck("slp4", "眠剤")}
              {renderCheck("slp5", "通いのみの方も確認")}
              {renderTextarea("sleep", false, "mt-1")}
            </Td>
            <Th className="font-bold">リスク</Th>
            <Td>
              {renderCheck("rsk1", "日常生活上の危険")}
              {renderCheck("rsk2", "ご利用時まず気をつけるポイント")}
              {renderTextarea("risks", false, "mt-1")}
            </Td>
            <Th rs={3} className="writing-vertical text-center">夜間</Th>
            <Td rs={3}>{renderTextarea("night", true)}</Td>
          </tr>
          <tr>
            <Th className="font-bold">看護・内服等</Th>
            <Td>
              {renderCheck("med1", "薬は別紙をもらう")}
              {renderCheck("med2", "目薬、塗り薬")}
              {renderCheck("med3", "必要な処置など")}
              {renderTextarea("medicalCare", false, "mt-1")}
            </Td>
            <Th className="font-bold">送迎</Th>
            <Td>
              {renderCheck("trn1", "送迎時間")}
              {renderCheck("trn2", "送迎時の介助")}
              {renderCheck("trn3", "車の停め方")}
              {renderCheck("trn4", "家族がいるいない")}
              {renderCheck("trn5", "施錠など")}
              {renderTextarea("transportation", false, "mt-1")}
            </Td>
          </tr>
          <tr>
            <Th className="font-bold">家族図</Th>
            <Td>{renderTextarea("familyStructure")}</Td>
            <Th className="font-bold">住所</Th>
            <Td>{renderTextarea("address")}</Td>
          </tr>
          <tr>
            <Td cs={7} className="bg-slate-50">
              <div className="flex gap-6">
                {renderCheck("bot1", "オムツ")}
                {renderCheck("bot2", "クリーニング")}
                {renderCheck("bot3", "個人情報")}
                {renderCheck("bot4", "センサー")}
              </div>
            </Td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
