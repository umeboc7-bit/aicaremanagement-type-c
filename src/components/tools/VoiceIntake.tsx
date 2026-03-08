import React, { useState } from 'react';
import { Mic, Square, Play, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { analyzeVoiceIntake } from '../../services/geminiService';
import { useClient } from '../../context/ClientContext';

export default function VoiceIntake() {
  const { saveClientData } = useClient();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any>(null);

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setTranscript('最近、右膝の痛みがひどくて、トイレに行くのも一苦労なんです。夜中に起きるのが怖くて、水分を控えてしまって…。娘も仕事が忙しいので、あまり迷惑をかけたくないんです。');
    } else {
      setIsRecording(true);
      setTranscript('');
      setAnalyzedData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeVoiceIntake(transcript);
      setAnalyzedData(result);
    } catch (error) {
      console.error(error);
      alert('分析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToContext = () => {
    if (analyzedData) {
      saveClientData({ voiceIntake: analyzedData });
      alert('分析結果を保存しました。他の書類作成時に活用できます。');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">音声記録・AI分析</h2>
        <p className="text-sm text-slate-600 mb-6">
          面談時の音声を録音し、AIが自動で文字起こしと課題分析を行います。抽出されたデータはマスターデータや第2表に反映できます。
        </p>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 mb-6">
          <button
            onClick={handleToggleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="mt-4 font-medium text-slate-700">
            {isRecording ? '録音中...' : 'マイクボタンを押して録音開始'}
          </p>
          {isRecording && (
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>

        {transcript && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 文字起こし結果
              </h3>
              <p className="text-slate-600 leading-relaxed">{transcript}</p>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <span className="animate-pulse">AIが分析中...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> AIで課題とニーズを抽出
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {analyzedData && (
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> AI分析結果
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-slate-700 mb-2">要約（第5表 経過記録用）</h4>
              <p className="text-slate-600">{analyzedData.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-slate-700 mb-2">生活全般の解決すべき課題（ニーズ）</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {analyzedData.needs.map((need: string, i: number) => (
                    <li key={i}>{need}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-slate-700 mb-2">現状の課題</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {analyzedData.issues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button onClick={handleSaveToContext} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
              マスターデータ及び第2表に反映する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
