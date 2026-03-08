export const APP_CONFIG = {
  // アプリケーション名（ヘッダーやサイドバーに表示）
  appName: 'AIケアマネジメント [施設B用]',
  
  // 施設・事業所情報（帳票のデフォルト値として使用）
  facility: {
    name: '施設B',
    address: '東京都〇〇区〇〇 1-2-3',
    phone: '03-0000-0000',
    managerName: '介護 太郎',
  },
  // ログイン情報（施設ごとに変更してください）
  auth: {
    email: 'facility-b@example.com',
    password: '1289ab',
  },

  // 印刷設定のデフォルト値
  print: {
    defaultMargin: '10mm',
  },

  // AIモデルの設定（必要に応じて変更可能に）
  ai: {
    defaultModel: 'gemini-3-flash-preview',
    temperature: 0.2,
  }
};
