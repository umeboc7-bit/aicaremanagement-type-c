import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ClipboardList, 
  PenTool, 
  FolderTree, 
  BarChart2, 
  HeartPulse, 
  Activity, 
  Brain, 
  Info, 
  Mail, 
  User, 
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Home,
  FileSignature,
  Edit3,
  Menu,
  X,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Clock,
  FileClock,
  Users2,
  Mic,
  Copy,
  ShieldCheck,
  CalendarDays,
  HeartHandshake,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Tool, ToolId } from './types';
import { APP_CONFIG } from './config';
import HomeModification from './components/tools/HomeModification';
import MeetingMinutes from './components/tools/MeetingMinutes';
import ProgressRecord from './components/tools/ProgressRecord';
import Assessment23 from './components/tools/Assessment23';
import PreventionPlan from './components/tools/PreventionPlan';
import CertificationSurvey from './components/tools/CertificationSurvey';
import MinorChange from './components/tools/MinorChange';
import CertificationInfo from './components/tools/CertificationInfo';
import AiCareBasic from './components/tools/AiCareBasic';
import MasterData from './components/tools/MasterData';
import CarePlan1 from './components/tools/CarePlan1';
import CarePlan2 from './components/tools/CarePlan2';
import CarePlan3 from './components/tools/CarePlan3';
import CarePlan4 from './components/tools/CarePlan4';
import CarePlan5 from './components/tools/CarePlan5';
import CarePlan6 from './components/tools/CarePlan6';
import SmallScalePlan from './components/tools/SmallScalePlan';
import VoiceIntake from './components/tools/VoiceIntake';
import Templates from './components/tools/Templates';
import AiCheck from './components/tools/AiCheck';
import FamilySummary from './components/tools/FamilySummary';
import Guide from './components/tools/Guide';
import Login from './components/Login';
import { ClientProvider } from './context/ClientContext';

const tools: Tool[] = [
  { id: 'guide', title: "このアプリについて", icon: <Sparkles className="w-4 h-4" />, category: "第一ステップ" },
  { id: 'master-data', title: "基本情報（マスター）", icon: <Database className="w-4 h-4" />, category: "第一ステップ" },
  { id: 'voice-intake', title: "音声記録・AI分析", icon: <Mic className="w-4 h-4" />, category: "第一ステップ" },
  { id: 'templates', title: "プラン履歴・テンプレート", icon: <Copy className="w-4 h-4" />, category: "第一ステップ" },
  { id: 'ai-check', title: "AI整合性チェック", icon: <ShieldCheck className="w-4 h-4" />, category: "分析・整理" },
  { id: 'care-plan-1', title: "居宅サービス計画書(1)", icon: <FileText className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'care-plan-2', title: "居宅サービス計画書(2)", icon: <FileSpreadsheet className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'care-plan-3', title: "週間サービス計画表(3)", icon: <Clock className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'care-plan-4', title: "担当者会議の要点(4)", icon: <Users2 className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'care-plan-5', title: "居宅介護支援経過(5)", icon: <FileClock className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'care-plan-6', title: "月間サービス計画表(6)", icon: <CalendarDays className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'family-summary', title: "家族向けサマリー", icon: <HeartHandshake className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'small-scale-plan', title: "小規模多機能計画書", icon: <Home className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'progress-record', title: "支援経過記録", icon: <PenTool className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'home-modification', title: "住宅改修の理由書", icon: <Home className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'prevention-plan', title: "予防計画書", icon: <FileSignature className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'certification-survey', title: "認定調査票作成", icon: <FileText className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'minor-change', title: "軽微な変更", icon: <Edit3 className="w-4 h-4" />, category: "記録・書類作成" },
  { id: 'assessment-23', title: "課題分析標準 23 項目", icon: <FolderTree className="w-4 h-4" />, category: "分析・整理" },
  { id: 'certification-info', title: "認定情報の整理", icon: <ClipboardList className="w-4 h-4" />, category: "分析・整理" },
  { id: 'ai-care-basic', title: "AI適ケア (基本ケア)", icon: <HeartPulse className="w-4 h-4" />, category: "AI適ケア" },
];

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTool) {
      case 'guide':
        return <Guide />;
      case 'master-data':
        return <MasterData />;
      case 'voice-intake':
        return <VoiceIntake />;
      case 'templates':
        return <Templates />;
      case 'ai-check':
        return <AiCheck />;
      case 'care-plan-1':
        return <CarePlan1 />;
      case 'care-plan-2':
        return <CarePlan2 />;
      case 'care-plan-3':
        return <CarePlan3 />;
      case 'care-plan-4':
        return <CarePlan4 />;
      case 'care-plan-5':
        return <CarePlan5 />;
      case 'care-plan-6':
        return <CarePlan6 />;
      case 'family-summary':
        return <FamilySummary />;
      case 'small-scale-plan':
        return <SmallScalePlan />;
      case 'home-modification':
        return <HomeModification />;
      case 'meeting-minutes':
        return <MeetingMinutes />;
      case 'progress-record':
        return <ProgressRecord />;
      case 'assessment-23':
        return <Assessment23 />;
      case 'prevention-plan':
        return <PreventionPlan />;
      case 'certification-survey':
        return <CertificationSurvey />;
      case 'minor-change':
        return <MinorChange />;
      case 'certification-info':
        return <CertificationInfo />;
      case 'ai-care-basic':
        return <AiCareBasic />;
      case 'dashboard':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{APP_CONFIG.appName}へようこそ</h2>
              <p className="text-slate-600">
                左側のメニューからツールを選択してください。AIがあなたの入力情報を解析し、
                各種申請書類のフォーマットに合わせて自動で文章を生成・配置します。
                まずは「基本情報（マスター）」から利用者の情報を入力・保存すると、他の書類作成がスムーズになります。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-800">期限管理・アラート</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-slate-700">山田 太郎 様（モニタリング訪問）</span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">あと3日</span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-slate-700">鈴木 花子 様（要介護認定更新）</span>
                    <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">来月</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">佐藤 次郎 様（担当者会議）</span>
                    <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">調整中</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">重要なお知らせ</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      注意：個人を特定できる情報（氏名、住所、電話番号など）は入力しないでください。
                      イニシャルや仮名（A様など）を使用してください。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['第一ステップ', '記録・書類作成', '分析・整理', 'AI適ケア'].map(category => (
                <div key={category} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">{category}</h3>
                  <ul className="space-y-2">
                    {tools.filter(t => t.category === category).map(tool => (
                      <li key={tool.id}>
                        <button
                          onClick={() => {
                            setActiveTool(tool.id);
                            setIsSidebarOpen(false);
                          }}
                          className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                              {tool.icon}
                            </div>
                            <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                              {tool.title}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <PenTool className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">現在開発中です</h2>
            <p>このツールは順次実装予定です。他のツールをお試しください。</p>
            <button 
              onClick={() => setActiveTool('dashboard')}
              className="mt-6 text-blue-600 hover:underline"
            >
              ダッシュボードに戻る
            </button>
          </div>
        );
    }
  };

  const currentToolTitle = activeTool === 'dashboard' 
    ? 'ダッシュボード' 
    : tools.find(t => t.id === activeTool)?.title || '';

  return (
    <ClientProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20 no-print">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600" />
          <h1 className="font-bold text-slate-800">{APP_CONFIG.appName}</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-10 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out no-print
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-lg">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">{APP_CONFIG.appName}</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <button
              onClick={() => {
                setActiveTool('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTool === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>ダッシュボード</span>
            </button>
          </div>

          {['第一ステップ', '記録・書類作成', '分析・整理', 'AI適ケア'].map(category => (
            <div key={category} className="mt-6">
              <h3 className="px-8 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <ul className="space-y-1 px-4">
                {tools.filter(t => t.category === category).map(tool => (
                  <li key={tool.id}>
                    <button
                      onClick={() => {
                        setActiveTool(tool.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                        activeTool === tool.id 
                          ? 'bg-blue-50 text-blue-700 font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className={activeTool === tool.id ? 'text-blue-600' : 'text-slate-400'}>
                        {tool.icon}
                      </div>
                      <span className="text-sm">{tool.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:overflow-visible print:h-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 hidden md:block no-print">
          <h2 className="text-xl font-bold text-slate-800">{currentToolTitle}</h2>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 print:overflow-visible print:p-0 print:bg-white">
          {renderContent()}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
    </ClientProvider>
  );
}
