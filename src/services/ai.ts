import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
      aiClient = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });
    } else {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

export async function generateStructuredData(prompt: string, systemInstruction: string, responseSchema: any) {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.2,
      }
    });
    
    if (!response.text) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

// Schemas
export const homeModSchema = {
  type: Type.OBJECT,
  properties: {
    modifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          locationAndItem: { type: Type.STRING, description: "場所と品目（例：①玄関：上がり框 縦手すり）" },
          desiredLifeChange: { type: Type.STRING, description: "1. 住宅改修により利用者等は日常生活をどう変えたいか（…の生活を…にしたい）※120文字程度" },
          currentDifficulties: { type: Type.STRING, description: "2. 具体的な困難な状況（…なので…で困っている）※50〜80文字" },
          purposeAndEffect: { type: Type.STRING, description: "3. 改修目的と改修効果（…することで…が改善できる）※50〜80文字" },
        },
        required: ["locationAndItem", "desiredLifeChange", "currentDifficulties", "purposeAndEffect"]
      }
    }
  },
  required: ["modifications"]
};

export const meetingMinutesSchema = {
  type: Type.OBJECT,
  properties: {
    currentStatus: { type: Type.STRING, description: "1. 現状共有（病院側・サービス側などからの報告）" },
    intentions: { type: Type.STRING, description: "2. 本人・家族意向" },
    policy: { type: Type.STRING, description: "3. 支援方針（合意事項）" },
    serviceAdjustments: { type: Type.STRING, description: "4. サービス再調整（決定事項）" },
    emergencyResponse: { type: Type.STRING, description: "5. 緊急時対応（取り決め）" },
    nextActions: { type: Type.STRING, description: "6. 次のアクション（スケジュール等）" },
    discussionSummary: {
      type: Type.ARRAY,
      description: "各参加者の発言要旨と結論",
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING, description: "参加者（例：長女、ケアマネ、主治医、訪問看護など）" },
          opinion: { type: Type.STRING, description: "検討項目・意見" },
          conclusion: { type: Type.STRING, description: "結論・方針" }
        },
        required: ["role", "opinion", "conclusion"]
      }
    }
  },
  required: ["currentStatus", "intentions", "policy", "serviceAdjustments", "emergencyResponse", "nextActions", "discussionSummary"]
};

export const assessment23Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "課題分析標準23項目の更新結果",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "項目番号（例：1, 2, ... 23）" },
          title: { type: Type.STRING, description: "項目名（例：基本情報、健康状態など）" },
          content: { type: Type.STRING, description: "更新後のアセスメント内容" },
          isChanged: { type: Type.BOOLEAN, description: "今回変更があったかどうか（変更があればtrue）" }
        },
        required: ["id", "title", "content", "isChanged"]
      }
    }
  },
  required: ["items"]
};

export const preventionPlanSchema = {
  type: Type.OBJECT,
  properties: {
    assessment: {
      type: Type.OBJECT,
      description: "アセスメント領域と現在の状況",
      properties: {
        movement: { type: Type.STRING, description: "運動・移動について（どのように移動しているか）" },
        dailyLife: { type: Type.STRING, description: "日常生活（家庭生活）について（毎日の過ごし方）" },
        socialParticipation: { type: Type.STRING, description: "社会参加、対人関係・コミュニケーションについて（社交性など本人の状況）" },
        healthManagement: { type: Type.STRING, description: "健康管理について（健康や疾病の状況）" }
      },
      required: ["movement", "dailyLife", "socialParticipation", "healthManagement"]
    },
    intentions: {
      type: Type.OBJECT,
      description: "本人・家族の意欲・意向",
      properties: {
        movement: { type: Type.STRING, description: "運動・移動について" },
        dailyLife: { type: Type.STRING, description: "日常生活（家庭生活）について" },
        socialParticipation: { type: Type.STRING, description: "社会参加、対人関係・コミュニケーションについて" },
        healthManagement: { type: Type.STRING, description: "健康管理について" }
      },
      required: ["movement", "dailyLife", "socialParticipation", "healthManagement"]
    },
    issues: {
      type: Type.OBJECT,
      description: "領域における課題",
      properties: {
        movement: { type: Type.STRING, description: "運動・移動について" },
        dailyLife: { type: Type.STRING, description: "日常生活（家庭生活）について" },
        socialParticipation: { type: Type.STRING, description: "社会参加、対人関係・コミュニケーションについて" },
        healthManagement: { type: Type.STRING, description: "健康管理について" }
      },
      required: ["movement", "dailyLife", "socialParticipation", "healthManagement"]
    },
    comprehensiveIssues: {
      type: Type.ARRAY,
      description: "総合的課題（優先度順）",
      items: { type: Type.STRING }
    },
    goalsAndMeasures: {
      type: Type.OBJECT,
      description: "課題に対する目標と具体策の提案",
      properties: {
        movement: { type: Type.STRING, description: "運動・移動について（目標と具体策）" },
        dailyLife: { type: Type.STRING, description: "日常生活（家庭生活）について（目標と具体策）" },
        socialParticipation: { type: Type.STRING, description: "社会参加、対人関係・コミュニケーションについて（目標と具体策）" },
        healthManagement: { type: Type.STRING, description: "健康管理について（目標と具体策）" }
      },
      required: ["movement", "dailyLife", "socialParticipation", "healthManagement"]
    },
    agreedGoals: {
      type: Type.ARRAY,
      description: "目標（合意した目標）",
      items: { type: Type.STRING }
    },
    supportPoints: {
      type: Type.ARRAY,
      description: "目標についての支援のポイント",
      items: { type: Type.STRING }
    },
    selfCareAndInformal: {
      type: Type.ARRAY,
      description: "本人等のセルフケアや家族の支援、インフォーマルサービス",
      items: { type: Type.STRING }
    },
    formalServices: {
      type: Type.ARRAY,
      description: "介護保険サービスまたは地域支援事業（具体的なサービス内容）",
      items: { type: Type.STRING }
    },
    comprehensivePolicy: {
      type: Type.ARRAY,
      description: "総合的な方針：生活不活発病の改善・予防のポイント",
      items: { type: Type.STRING }
    }
  },
  required: [
    "assessment", "intentions", "issues", "comprehensiveIssues", 
    "goalsAndMeasures", "agreedGoals", "supportPoints", 
    "selfCareAndInformal", "formalServices", "comprehensivePolicy"
  ]
};

export const certificationSurveySchema = {
  type: Type.OBJECT,
  properties: {
    groups: {
      type: Type.ARRAY,
      description: "認定調査票の各群（第1群〜第5群）",
      items: {
        type: Type.OBJECT,
        properties: {
          groupName: { type: Type.STRING, description: "群の名前（例：第1群：身体機能・起居動作）" },
          items: {
            type: Type.ARRAY,
            description: "群内の各項目",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "項目番号（例：1-1）" },
                name: { type: Type.STRING, description: "項目名（例：麻痺等の有無）" },
                note: { type: Type.STRING, description: "特記事項（情報がない場合は「記載なし」）" }
              },
              required: ["id", "name", "note"]
            }
          }
        },
        required: ["groupName", "items"]
      }
    }
  },
  required: ["groups"]
};

export const minorChangeSchema = {
  type: Type.OBJECT,
  properties: {
    changes: {
      type: Type.ARRAY,
      description: "軽微な変更の詳細情報リスト",
      items: {
        type: Type.OBJECT,
        properties: {
          changeType: { type: Type.STRING, description: "変更の種類（例：1【サービス提供曜日・提供時間帯の変更】）" },
          explainedTo: { type: Type.STRING, description: "[誰に説明？：本人・家族の誰]" },
          userName: { type: Type.STRING, description: "[利用者名イニシャルを推奨]" },
          serviceName: { type: Type.STRING, description: "[当該サービス事業所名とサービス種別]" },
          reasonType: { type: Type.STRING, description: "[利用者の希望、家族の都合、事業所の都合のどれか]" },
          beforeChange: { type: Type.STRING, description: "[提供時間変更前内容] など" },
          afterChange: { type: Type.STRING, description: "[提供時間変更後内容] など" },
          notifyTo: { type: Type.STRING, description: "[周知する事業所]" },
          reasonDetail: { type: Type.STRING, description: "[理由があれば]" }
        },
        required: ["changeType", "explainedTo", "userName", "serviceName", "beforeChange", "afterChange", "notifyTo"]
      }
    }
  },
  required: ["changes"]
};

export const certificationInfoSchema = {
  type: Type.OBJECT,
  properties: {
    careLevel: { type: Type.STRING, description: "要介護度（例：要介護2）" },
    validityPeriod: { type: Type.STRING, description: "認定有効期間" },
    primaryIllness: { type: Type.STRING, description: "主治医意見書上の主病名・特定疾病" },
    adlStatus: { type: Type.STRING, description: "基本的日常生活動作（ADL）の状況" },
    cognitiveStatus: { type: Type.STRING, description: "認知機能・周辺症状（BPSD）の状況" },
    medicalNeeds: { type: Type.STRING, description: "医療的ケアの必要性" },
    specialNotesSummary: { type: Type.STRING, description: "認定調査特記事項の要約" }
  },
  required: ["careLevel", "validityPeriod", "primaryIllness", "adlStatus", "cognitiveStatus", "medicalNeeds", "specialNotesSummary"]
};

export const aiCareBasicSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "利用者の状態サマリー" },
    proposals: {
      type: Type.ARRAY,
      description: "適切なケアマネジメント手法に基づく提案",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "ケアの分類（例：水分・食事、排泄、活動など）" },
          assessmentPoint: { type: Type.STRING, description: "確認すべきアセスメント項目" },
          carePlanProposal: { type: Type.STRING, description: "ケアプランに位置づける支援内容の提案" }
        },
        required: ["category", "assessmentPoint", "carePlanProposal"]
      }
    }
  },
  required: ["summary", "proposals"]
};

export const patternASchema = {
  type: Type.OBJECT,
  properties: {
    basicInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "利用者様氏名" },
        birthDateAndAge: { type: Type.STRING, description: "生年月日・年齢" },
        careLevel: { type: Type.STRING, description: "要介護度" },
        independenceLevel: { type: Type.STRING, description: "自立度（意見書＋実際）" },
        doctor: { type: Type.STRING, description: "主治医" },
        emergencyContact: { type: Type.STRING, description: "緊急連絡先・希望搬送先" },
        diagnosis: { type: Type.STRING, description: "診断名（生活機能低下の原因、主治医意見書診断名など）" },
        historyToUse: { type: Type.STRING, description: "利用までの経過（認定を受けた時期、入院とその原因、介護サービスの利用など）" },
        intentions: { type: Type.STRING, description: "本人・家族の意向（どのように暮らしたいか、サービスへの要望）" },
        personality: { type: Type.STRING, description: "本人の人となり（性格、生まれ、家族歴、職業歴など）" },
        meals: { type: Type.STRING, description: "食事・口腔（食事形態、アレルギー・嗜好、使用用具、義歯・口腔ケア、嚥下・トロミ）" },
        cognition: { type: Type.STRING, description: "認知症（記憶、時・場所・人の見当識、判断力、長谷川式、日常生活上の困りごと→自立度に対応）" },
        excretion: { type: Type.STRING, description: "排泄（尿便意、用具、必要な介助、便秘・下剤、日中・夜間の違い）" },
        communication: { type: Type.STRING, description: "コミュニケーション（視力・聴力、言語、意思の伝達と理解、会話の程度）" },
        bathing: { type: Type.STRING, description: "入浴（入浴形態、希望時間、異性介助の可否、必要な介助、生活習慣など）" },
        roles: { type: Type.STRING, description: "楽しみ・役割（趣味・特技、自宅・デイでの役割、日課）" },
        mobility: { type: Type.STRING, description: "移動（寝返り・起き上がり、座位保持・立ち上がり、立位・移乗・歩行・移動→自立度に対応）" },
        rehabilitation: { type: Type.STRING, description: "リハビリ（機能的な訓練、楽しみや役割の中で機能訓練として考えるもの）" },
        sleep: { type: Type.STRING, description: "睡眠（寝具、夜間の排泄、睡眠状況、眠剤、通いのみの方も確認）" },
        risks: { type: Type.STRING, description: "リスク（日常生活上の危険、ご利用時まず気をつけるポイント）" },
        medicalCare: { type: Type.STRING, description: "看護・内服等（薬は別紙をもらう、目薬・塗り薬、必要な処置など）" },
        transportation: { type: Type.STRING, description: "送迎（送迎時間、送迎時の介助、車の停め方、家族がいるいない、施錠など）" },
        familyStructure: { type: Type.STRING, description: "家族図・家族構成（テキストで表現）" },
        address: { type: Type.STRING, description: "住所" },
        dailyRoutine: {
          type: Type.OBJECT,
          properties: {
            earlyMorning: { type: Type.STRING, description: "早朝の過ごし方" },
            morning: { type: Type.STRING, description: "午前の過ごし方" },
            afternoon: { type: Type.STRING, description: "午後の過ごし方" },
            night: { type: Type.STRING, description: "夜間の過ごし方" }
          }
        }
      }
    }
  }
};

export const smallScalePlanSchema = {
  type: Type.OBJECT,
  properties: {
    intentions: { type: Type.STRING, description: "利用者及び家族の生活に対する意向" },
    policy: { type: Type.STRING, description: "総合的な援助の方針" },
    needs: {
      type: Type.ARRAY,
      description: "生活全般の解決すべき課題（ニーズ）と目標・サービス内容",
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING, description: "生活全般の解決すべき課題（ニーズ）" },
          longTermGoal: { type: Type.STRING, description: "長期目標（期間）" },
          shortTermGoal: { type: Type.STRING, description: "短期目標（期間）" },
          serviceContent: { type: Type.STRING, description: "具体的なサービス内容（通い・訪問・宿泊）" }
        },
        required: ["issue", "longTermGoal", "shortTermGoal", "serviceContent"]
      }
    }
  },
  required: ["intentions", "policy", "needs"]
};

export const carePlan5Schema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      description: "居宅介護支援経過記録（第5表）の記録リスト。最大40件。",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "年月日（例：R6.10.1）" },
          content: { type: Type.STRING, description: "内容（支援の経過や連絡事項など）" }
        },
        required: ["date", "content"]
      }
    }
  },
  required: ["records"]
};

export const carePlan6Schema = {
  type: Type.OBJECT,
  properties: {
    year: { type: Type.STRING, description: "提供年（例：6）" },
    month: { type: Type.STRING, description: "提供月（例：10）" },
    services: {
      type: Type.ARRAY,
      description: "月間サービス計画表（第6表）のサービスリスト。最大8件。",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "サービス内容（例：通所介護（デイサービス））" },
          provider: { type: Type.STRING, description: "事業所名" },
          type: { type: Type.STRING, description: "サービス種別（通所、訪問、福祉用具など）" },
          unit: { type: Type.NUMBER, description: "1回あたりの単位数" },
          schedule: {
            type: Type.ARRAY,
            description: "1日〜31日までのスケジュール（利用日は '1' などを入れる、利用しない日は空文字 ''）。必ず31要素の配列にすること。",
            items: { type: Type.STRING }
          }
        },
        required: ["name", "provider", "type", "unit", "schedule"]
      }
    }
  },
  required: ["year", "month", "services"]
};

export const patternBSchema = {
  type: Type.OBJECT,
  properties: {
    assessment: {
      type: Type.OBJECT,
      properties: {
        healthAndMedical: {
          type: Type.OBJECT,
          properties: {
            pastIllness: { type: Type.STRING, description: "既往症" },
            infection: { type: Type.STRING, description: "感染症（なし・C型肝炎・B型肝炎・梅毒・その他）" },
            allergy: { type: Type.STRING, description: "アレルギー" },
            currentIllness: { type: Type.STRING, description: "現病名" },
            medication: { type: Type.STRING, description: "服薬状況" },
            doctorName: { type: Type.STRING, description: "主治医 医療機関名" },
            doctorPhone: { type: Type.STRING, description: "電話番号" },
            medicalTreatment: { type: Type.STRING, description: "医療的処置（なし・経管栄養・導尿カテーテル・褥瘡・疼痛・インシュリン・酸素療法・人工肛門・他）" },
            vitals: { type: Type.STRING, description: "平常時バイタル（体温、血圧、脈拍など）" },
            bodyMeasurement: { type: Type.STRING, description: "身体測定（身長など）" }
          }
        },
        historyToService: { type: Type.STRING, description: "サービスに至る経緯" },
        needsAndIntentions: {
          type: Type.OBJECT,
          properties: {
            user: { type: Type.STRING, description: "本人のニーズ・意向" },
            family: { type: Type.STRING, description: "家族のニーズ・意向" }
          }
        },
        lifeHistory: {
          type: Type.OBJECT,
          properties: {
            occupation: { type: Type.STRING, description: "職業" },
            birthplace: { type: Type.STRING, description: "出身地" },
            personality: { type: Type.STRING, description: "性格" },
            socialParticipation: { type: Type.STRING, description: "社会参加" },
            hobbies: { type: Type.STRING, description: "趣味" },
            importantThings: { type: Type.STRING, description: "大切にしたいこと・もの" },
            frequentPlaces: { type: Type.STRING, description: "よく行った場所" },
            lifestyle: { type: Type.STRING, description: "ライフスタイル" },
            episodes: { type: Type.STRING, description: "良く話されるエピソード" },
            alcohol: { type: Type.STRING, description: "飲酒" },
            smoking: { type: Type.STRING, description: "喫煙" },
            religion: { type: Type.STRING, description: "宗教" },
            specialNotes: { type: Type.STRING, description: "特記" }
          }
        },
        adlIadl: {
          type: Type.OBJECT,
          properties: {
            basicMovement: { type: Type.STRING, description: "基本動作（麻痺、拘縮、寝返り、座位、立位、屋内移動、屋外移動の状況）" },
            meals: { type: Type.STRING, description: "食事（摂取、咀嚼・嚥下、義歯、食種、主食形態、副食形態、経管栄養、制限食、禁食、禁忌事項の状況）" },
            excretion: { type: Type.STRING, description: "排泄（日中、夜間、尿意、便意、失禁、下剤の状況）" },
            bathing: { type: Type.STRING, description: "入浴（入浴方法、皮膚の状態）" },
            dailyActivities1: { type: Type.STRING, description: "日常生活動作I（洗面、口腔清潔、整容、更衣、睡眠の状況）" },
            dailyActivities2: { type: Type.STRING, description: "日常生活動作II（炊事、買い物、洗濯、通院、掃除、電話、その他の状況）" },
            communication: { type: Type.STRING, description: "コミュニケーション等（視力、聴力、意思伝達、理解力の状況）" },
            mentalBehavior: { type: Type.STRING, description: "精神行動（記憶・認知、周辺症状・行動障害の状況）" }
          }
        }
      }
    }
  }
};
