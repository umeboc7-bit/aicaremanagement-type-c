import React, { useState, useEffect } from 'react';
import { Copy, Plus, Search, Tag, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { useClient } from '../../context/ClientContext';

interface Template {
  id: string;
  title: string;
  tags: string[];
  date: string;
  description: string;
  data: any;
}

export default function Templates() {
  const { clientData, saveClientData } = useClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load templates from local storage
    const savedTemplates = localStorage.getItem('carePlanTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse templates', e);
      }
    } else {
      // Default templates
      const defaultTemplates: Template[] = [
        { id: '1', title: '独居・要介護2・転倒リスク高', tags: ['独居', '要介護2', '転倒予防'], date: '2023-10-01', description: '自宅内での転倒歴があり、手すり設置とデイサービスでの下肢筋力強化を中心としたプラン。', data: {} },
        { id: '2', title: '老老介護・認知症初期・要介護1', tags: ['老老介護', '認知症', '要介護1'], date: '2023-11-15', description: '配偶者の介護負担軽減と、本人の認知機能低下予防のためのデイサービス週2回利用プラン。', data: {} },
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('carePlanTemplates', JSON.stringify(defaultTemplates));
    }
  }, []);

  const handleSaveCurrent = () => {
    if (!newTemplateTitle.trim()) {
      alert('テンプレート名を入力してください。');
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      title: newTemplateTitle,
      tags: ['カスタム'],
      date: new Date().toISOString().split('T')[0],
      description: '現在の利用者のデータを元に作成されたテンプレートです。',
      data: clientData // Save current client data
    };

    const updatedTemplates = [newTemplate, ...templates];
    setTemplates(updatedTemplates);
    localStorage.setItem('carePlanTemplates', JSON.stringify(updatedTemplates));
    setNewTemplateTitle('');
    setIsSaving(false);
    alert('現在のプランをテンプレートとして保存しました。');
  };

  const handleApply = () => {
    const templateToApply = templates.find(t => t.id === selectedTemplate);
    if (templateToApply && templateToApply.data) {
      if (window.confirm(`テンプレート「${templateToApply.title}」を適用しますか？現在のデータの一部が上書きされます。`)) {
        // Apply template data to current client data
        // Be careful not to overwrite basic personal info like name if possible, 
        // but for this demo we'll just merge it.
        const { patternA, ...restData } = templateToApply.data;
        saveClientData(restData); // Apply everything except basic info
        alert('テンプレートを適用しました。');
        setSelectedTemplate(null);
      }
    } else {
      alert('適用できるデータがありません。');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('このテンプレートを削除しますか？')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('carePlanTemplates', JSON.stringify(updatedTemplates));
      if (selectedTemplate === id) setSelectedTemplate(null);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.title.includes(searchTerm) || 
    t.tags.some(tag => tag.includes(searchTerm)) ||
    t.description.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">プラン履歴・テンプレート</h2>
        <p className="text-sm text-slate-600 mb-6">
          過去に作成した質の高いケアプランをテンプレートとして保存・検索し、新しい利用者のプラン作成時に再利用（コピペ）できます。
        </p>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="キーワードやタグで検索（例：独居、認知症）"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsSaving(!isSaving)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> 現在のプランを保存
          </button>
        </div>

        {isSaving && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">テンプレート名</label>
              <input
                type="text"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
                placeholder="例：〇〇様向けプラン"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handleSaveCurrent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              保存する
            </button>
            <button 
              onClick={() => setIsSaving(false)}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              キャンセル
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <button 
                onClick={(e) => handleDelete(template.id, e)}
                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-start mb-2 pr-6">
                <h3 className="font-bold text-slate-800 leading-tight">{template.title}</h3>
                {selectedTemplate === template.id && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mb-3">最終更新: {template.date}</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> テンプレートの適用
            </h3>
            <p className="text-slate-600 mb-4">
              選択したテンプレート「{templates.find(t => t.id === selectedTemplate)?.title}」の内容を、現在の利用者のマスターデータにコピーします。
              ※既存のデータは上書きされる項目があります。
            </p>
            <div className="flex gap-4">
              <button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                <Copy className="w-5 h-5" /> 現在の利用者に適用する
              </button>
              <button onClick={() => setSelectedTemplate(null)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
