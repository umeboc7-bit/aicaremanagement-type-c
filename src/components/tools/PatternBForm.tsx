import React from 'react';
import { useClient } from '../../context/ClientContext';

const Th = ({ children, rs = 1, cs = 1, className = "" }: any) => (
  <th rowSpan={rs} colSpan={cs} className={`border border-black p-1 bg-white font-normal text-center align-middle ${className}`}>{children}</th>
);
const Td = ({ children, rs = 1, cs = 1, className = "" }: any) => (
  <td rowSpan={rs} colSpan={cs} className={`border border-black p-1 align-top ${className}`}>{children}</td>
);

export default function PatternBForm({ formData, onChange }: { formData: any, onChange: (c: string, f: string, v: string) => void }) {
  const { clientData, saveClientData } = useClient();
  const checks = clientData?.checkboxes || {};
  const selects = clientData?.selects || {};

  const toggleCheck = (id: string) => saveClientData({ checkboxes: { ...checks, [id]: !checks[id] } });
  const setSelect = (id: string, val: string) => saveClientData({ selects: { ...selects, [id]: val } });

  const renderInput = (cat: string, field: string, className = "") => (
    <input type="text" value={formData?.[cat]?.[field] || ''} onChange={(e) => onChange(cat, field, e.target.value)} className={`w-full h-full outline-none bg-transparent ${className}`} />
  );
  const renderTextarea = (cat: string, field: string, className = "") => (
    <textarea value={cat === 'historyToService' ? formData?.[cat] || '' : formData?.[cat]?.[field] || ''} onChange={(e) => cat === 'historyToService' ? onChange(cat, '', e.target.value) : onChange(cat, field, e.target.value)} className={`w-full h-full outline-none bg-transparent resize-none min-h-[40px] ${className}`} />
  );
  const renderCheck = (id: string, label: string) => (
    <label className="flex items-center gap-1 text-[10px] cursor-pointer hover:bg-slate-100 p-0.5 rounded whitespace-nowrap"><input type="checkbox" checked={!!checks[id]} onChange={() => toggleCheck(id)} /> {label}</label>
  );
  const renderSelect = (id: string, options: string[]) => (
    <select value={selects[id] || ''} onChange={(e) => setSelect(id, e.target.value)} className="w-full outline-none bg-transparent text-[10px]">
      <option value=""></option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const adlData = [
    { cat: '基本動作', items: [
      { label: '麻痺', opts: ['左上肢', '右上肢', '左下肢', '右下肢', '四肢の欠損'] },
      { label: '拘縮', opts: ['肩関節', '股関節', '膝関節', '四肢の欠損'] },
      { label: '寝返り', opts: ['起き上がり'] },
      { label: '座位', opts: ['立ち上がり'] },
      { label: '立位', opts: ['移乗'] },
      { label: '屋内移動', opts: ['独歩', '杖', '歩行器', 'シルバーカー', '車椅子'] },
      { label: '屋外移動', opts: ['独歩', '杖', '歩行器', 'シルバーカー', '車椅子'] }
    ]},
    { cat: '食事', items: [
      { label: '摂取', opts: ['用具', 'はし', 'スプーン', 'フォーク', '自助具'] },
      { label: '咀嚼・嚥下', opts: [] },
      { label: '義歯', opts: ['なし', '総義歯', '部分義歯'] },
      { label: '食種', opts: ['一般食', '糖尿病食', '心臓病食', '高血圧食', '腎臓病食'] },
      { label: '主食形態', opts: ['普通', '軟飯', '粥', 'ミキサー', 'ムース'] },
      { label: '副食形態', opts: ['主菜: 普通・一口大・刻み・極刻み・ミキサー・ムース', '副菜: 普通・一口大・刻み・極刻み・ミキサー・ムース'] },
      { label: '経管栄養', opts: ['鼻腔', '胃瘻'] },
      { label: '制限食', opts: ['なし', 'あり'] },
      { label: '禁食', opts: [] },
      { label: '禁忌事項', opts: ['嚥下リスク', '疾病リスク'] }
    ]},
    { cat: '排泄', items: [
      { label: '日中', opts: ['トイレ', 'Pトイレ', 'オムツ', 'リハビリパンツ', 'パット', '布オムツ'] },
      { label: '夜間', opts: ['トイレ', 'Pトイレ', 'オムツ', 'リハビリパンツ', 'パット', '布オムツ'] },
      { label: '尿意', opts: ['あり', '不明', 'なし'] },
      { label: '便意', opts: ['あり', '不明', 'なし'] },
      { label: '失禁', opts: ['あり', 'なし'] },
      { label: '下剤', opts: ['あり', 'なし'] }
    ]},
    { cat: '入浴', items: [
      { label: '入浴', opts: ['一般浴', '個浴', 'リフト浴', 'シャワー浴', '特殊浴', '清拭'] },
      { label: '皮膚の状態', opts: ['刺激弱い', '疾患あり'] }
    ]},
    { cat: '日常生活動作I', items: [
      { label: '洗面', opts: [] },
      { label: '口腔清潔', opts: [] },
      { label: '整容', opts: [] },
      { label: '更衣', opts: [] },
      { label: '睡眠', opts: [] }
    ]},
    { cat: '日常生活動作II', items: [
      { label: '炊事', opts: [] },
      { label: '買い物', opts: [] },
      { label: '洗濯', opts: [] },
      { label: '通院', opts: [] },
      { label: '掃除', opts: [] },
      { label: '電話', opts: [] },
      { label: 'その他', opts: [] }
    ]},
    { cat: 'コミュニケーション等', items: [
      { label: '視力', opts: ['普通', 'やや悪い', '人の動きがわかる程度', 'ほとんど見えない', '眼鏡(あり・なし)'] },
      { label: '聴力', opts: ['普通', 'やや悪い', '大声が聞き取れる', 'ほとんど聞こえない', '補聴器(あり・なし)'] },
      { label: '意思伝達', opts: ['できる', '時々できる', 'ほとんどできない', '言語障害'] },
      { label: '理解力', opts: ['普通', '不十分', '困難'] }
    ]},
    { cat: '精神行動', items: [
      { label: '記憶・認知', opts: ['できる', '時々できる', 'ほとんどできない'] },
      { label: '周辺症状', opts: ['物忘れ', '作話', '失見当識', '幻覚', '妄想', '興奮', '感情失禁', '徘徊', 'せん妄'] }
    ]}
  ];

  return (
    <div className="w-full overflow-x-auto print:overflow-visible print:shadow-none print:border-none print:p-0">
      <h1 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">アセスメント</h1>
      
      <div className="font-bold text-base mb-1">健康・医療</div>
      <table className="w-full border-collapse border-2 border-black text-[11px] mb-4" style={{ minWidth: '800px' }}>
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '35%' }} />
        </colgroup>
        <tbody>
          <tr>
            <Th rs={2} className="font-bold text-sm">既往症</Th>
            <Td rs={2}>{renderTextarea("healthAndMedical", "pastIllness")}</Td>
            <Th>感染症</Th>
            <Td>
              <div className="flex gap-2 mb-1">
                {renderCheck("inf1", "なし")}{renderCheck("inf2", "C型肝炎")}{renderCheck("inf3", "B型肝炎")}{renderCheck("inf4", "梅毒")}
              </div>
              <div className="flex items-center gap-1">その他({renderInput("healthAndMedical", "infection")})</div>
            </Td>
          </tr>
          <tr>
            <Th>アレルギー</Th>
            <Td>{renderInput("healthAndMedical", "allergy")}</Td>
          </tr>
          <tr>
            <Th rs={2} className="font-bold text-sm">現病名</Th>
            <Td rs={2}>{renderTextarea("healthAndMedical", "currentIllness")}</Td>
            <Th rs={2}>服薬状況</Th>
            <Td rs={2}>{renderTextarea("healthAndMedical", "medication")}</Td>
          </tr>
          <tr></tr>
          <tr>
            <Th>主治医</Th>
            <Td cs={2}><div className="flex items-center gap-2">医療機関名 {renderInput("healthAndMedical", "doctorName")}</div></Td>
            <Td><div className="flex items-center gap-2">電話番号 {renderInput("healthAndMedical", "doctorPhone")}</div></Td>
          </tr>
          <tr>
            <Th>医療的処置</Th>
            <Td cs={3}>
              <div className="flex flex-wrap gap-2 mb-1">
                {['なし', '経管栄養(鼻腔・胃瘻)', '導尿カテーテル', '褥瘡', '疼痛', 'インシュリン', '酸素療法', '人工肛門'].map((l, i) => <React.Fragment key={i}>{renderCheck(`medt${i}`, l)}</React.Fragment>)}
              </div>
              <div className="flex items-center gap-1">他({renderInput("healthAndMedical", "medicalTreatment")})</div>
            </Td>
          </tr>
          <tr>
            <Th>平常時バイタル</Th>
            <Td cs={3}><div className="flex items-center gap-4">体温 {renderInput("healthAndMedical", "vitalsTemp", "w-12 border-b border-black")} ℃ 有熱 {renderInput("healthAndMedical", "vitalsFever", "w-12 border-b border-black")} ℃ 血圧 上 {renderInput("healthAndMedical", "vitalsBpHigh", "w-12 border-b border-black")} / 下 {renderInput("healthAndMedical", "vitalsBpLow", "w-12 border-b border-black")} mmHg 脈拍 {renderInput("healthAndMedical", "vitalsPulse", "w-12 border-b border-black")} 回/分</div></Td>
          </tr>
          <tr>
            <Th>身体測定</Th>
            <Td cs={3}><div className="flex items-center gap-2">身長 {renderInput("healthAndMedical", "bodyMeasurement", "w-16 border-b border-black")} cm</div></Td>
          </tr>
        </tbody>
      </table>

      <div className="font-bold text-base mb-1">サービスに至る経緯</div>
      <div className="border-2 border-black p-1 mb-4 min-h-[80px]">
        {renderTextarea("historyToService", "historyToService")}
      </div>

      <div className="font-bold text-base mb-1">ニーズ・意向</div>
      <table className="w-full border-collapse border-2 border-black text-[11px] mb-4" style={{ minWidth: '800px' }}>
        <colgroup><col style={{ width: '10%' }} /><col style={{ width: '90%' }} /></colgroup>
        <tbody>
          <tr><Th>本人</Th><Td>{renderTextarea("needsAndIntentions", "user")}</Td></tr>
          <tr><Th>家族</Th><Td>{renderTextarea("needsAndIntentions", "family")}</Td></tr>
        </tbody>
      </table>

      <div className="font-bold text-base mb-1">生活歴</div>
      <table className="w-full border-collapse border-2 border-black text-[11px] mb-4" style={{ minWidth: '800px' }}>
        <colgroup>
          <col style={{ width: '15%' }} /><col style={{ width: '18%' }} />
          <col style={{ width: '15%' }} /><col style={{ width: '18%' }} />
          <col style={{ width: '15%' }} /><col style={{ width: '19%' }} />
        </colgroup>
        <tbody>
          <tr>
            <Th>職業</Th><Td>{renderInput("lifeHistory", "occupation")}</Td>
            <Th>出身地</Th><Td>{renderInput("lifeHistory", "birthplace")}</Td>
            <Th>性格</Th><Td>{renderInput("lifeHistory", "personality")}</Td>
          </tr>
          <tr>
            <Th>社会参加</Th><Td>{renderInput("lifeHistory", "socialParticipation")}</Td>
            <Th>趣味</Th><Td>{renderInput("lifeHistory", "hobbies")}</Td>
            <Th>大切にしたい<br/>こと・もの</Th><Td>{renderInput("lifeHistory", "importantThings")}</Td>
          </tr>
          <tr>
            <Th>よく行った場所</Th><Td>{renderInput("lifeHistory", "frequentPlaces")}</Td>
            <Th>ライフ<br/>スタイル</Th><Td>{renderInput("lifeHistory", "lifestyle")}</Td>
            <Th></Th><Td></Td>
          </tr>
          <tr>
            <Th>良く話される<br/>エピソード</Th><Td cs={5}>{renderTextarea("lifeHistory", "episodes")}</Td>
          </tr>
          <tr>
            <Th>飲酒</Th><Td>{renderInput("lifeHistory", "alcohol")}</Td>
            <Th>喫煙</Th><Td>{renderInput("lifeHistory", "smoking")}</Td>
            <Th>宗教</Th><Td>{renderInput("lifeHistory", "religion")}</Td>
          </tr>
          <tr>
            <Th>特記</Th><Td cs={5}>{renderTextarea("lifeHistory", "specialNotes")}</Td>
          </tr>
        </tbody>
      </table>

      <div className="font-bold text-base mb-1">ADL / IADL</div>
      <table className="w-full border-collapse border-2 border-black text-[11px] mb-4" style={{ minWidth: '800px' }}>
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '65%' }} />
        </colgroup>
        <thead>
          <tr>
            <Th cs={2}>領域 / 項目</Th>
            <Th>介助レベル</Th>
            <Th>状 態</Th>
          </tr>
        </thead>
        <tbody>
          {adlData.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {group.items.map((item, iIdx) => (
                <tr key={iIdx}>
                  {iIdx === 0 && <Th rs={group.items.length + 1} className="writing-vertical text-center">{group.cat}</Th>}
                  <Th>{item.label}</Th>
                  <Td>{renderSelect(`lvl_${gIdx}_${iIdx}`, ['自立', '一部介助', '全介助'])}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {item.opts.map((opt, oIdx) => (
                        <React.Fragment key={oIdx}>{renderCheck(`opt_${gIdx}_${iIdx}_${oIdx}`, opt)}</React.Fragment>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
              <tr>
                <Th>詳しい<br/>状況</Th>
                <Td cs={2}>{renderTextarea("adlIadl", `${group.cat}詳細`)}</Td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
