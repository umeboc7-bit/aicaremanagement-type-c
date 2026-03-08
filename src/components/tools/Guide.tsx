import React from 'react';
import { Sparkles, Mic, FileText, Users, Copy, CheckCircle, Clock, Heart, ArrowRight, Zap } from 'lucide-react';

export default function Guide() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 text-white p-12 rounded-b-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> 次世代ケアマネジメントツール
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            ケアマネ業務の「めんどくさい」を、<br />
            AIが<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">極限までゼロ</span>にする。
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
            書類作成や整合性チェックに追われる日々はもう終わりです。<br />
            あなたが本当に時間を使うべき「利用者との対話」と「より良い支援の構築」に集中できるよう、AIがあなたの優秀なアシスタントとして事務作業を巻き取ります。
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-16 w-full">
        
        {/* Core Value */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">なぜ、このツールが必要なのか？</h2>
          <p className="text-slate-600 text-lg">従来の介護ソフトとは違う、3つの圧倒的な違い</p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">圧倒的な時短</h3>
              <p className="text-slate-600">ゼロから文章を考える必要はありません。キーワードや音声から、AIがプロレベルの文章を数秒で生成します。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">返戻・ミス防止</h3>
              <p className="text-slate-600">第1表〜第3表の整合性をAIが自動チェック。人間が見落としがちな矛盾や抜け漏れを瞬時に指摘します。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">対人援助への集中</h3>
              <p className="text-slate-600">事務作業が減ることで、利用者や家族と向き合う時間、事業所との調整に本来の力を発揮できます。</p>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">魔法のような機能たち</h2>

          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">
                <Mic className="w-4 h-4" /> 音声入力＆AIアセスメント
              </div>
              <h3 className="text-2xl font-bold text-slate-800">面談の録音から、<br/>「課題」と「ニーズ」を自動抽出</h3>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Before:</span> 帰社後にメモを見返し、思い出しながらPCに打ち込む（残業の温床）<br/>
                <span className="font-bold text-blue-600">After:</span> 面談の音声を読み込ませるだけで、AIが自動でテキスト化し、さらにケアプランに必要な「生活課題」と「ニーズ」を箇条書きで抽出します。
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm text-slate-600">「最近、お風呂で滑りそうになって怖いのよ...」</div>
                <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-slate-400" /></div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-xs font-bold text-purple-800 mb-1">AI抽出結果</div>
                  <div className="text-sm text-slate-700 font-medium">【課題】浴室での転倒リスク<br/>【ニーズ】安全に入浴したい</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                <FileText className="w-4 h-4" /> ケアプラン自動生成＆整合性チェック
              </div>
              <h3 className="text-2xl font-bold text-slate-800">第1表〜第3表が連動。<br/>矛盾のないプランを数秒で。</h3>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Before:</span> 第1表から第3表まで、何度も同じような内容を手打ちし、矛盾がないか目視確認。<br/>
                <span className="font-bold text-blue-600">After:</span> 基本情報とニーズから、AIが第1表〜第3表の文案を自動生成。さらに「第1表の意向と第2表の目標がズレていないか」「第2表のサービスが第3表に反映されているか」をAIが自動チェックします。
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-xs text-center font-medium">第1表</div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-xs text-center font-medium">第2表</div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-xs text-center font-medium">第3表</div>
                </div>
                <div className="flex justify-center"><Zap className="w-5 h-5 text-yellow-500" /></div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-blue-500 shrink-0" />
                  <div className="text-sm text-slate-700 font-medium">整合性チェック完了。<br/>矛盾や抜け漏れはありません。</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                <Users className="w-4 h-4" /> 家族向けサマリー自動生成
              </div>
              <h3 className="text-2xl font-bold text-slate-800">専門用語を「翻訳」。<br/>ご家族の安心と信頼を獲得。</h3>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Before:</span> 専門用語だらけの第1表・第2表を渡しても、家族には伝わりづらい。<br/>
                <span className="font-bold text-blue-600">After:</span> ケアプランのデータを元に、AIが「温かみのある分かりやすい言葉」で1枚のレポートを自動作成。イラスト付きで、ご家族に「どんな生活を目指し、どんなサポートをするのか」が直感的に伝わります。
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="text-center border-b border-orange-100 pb-2 mb-3">
                  <Heart className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-orange-800">これからの生活サポート計画</div>
                </div>
                <div className="text-xs text-slate-600 space-y-2">
                  <p>「住み慣れたご自宅で、安心して笑顔で過ごせること」を目標にサポートします。</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px]">デイサービスで運動</span>
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px]">手すりで安全確保</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                <Copy className="w-4 h-4" /> テンプレート機能
              </div>
              <h3 className="text-2xl font-bold text-slate-800">過去の「名作プラン」を<br/>1秒で再利用。</h3>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Before:</span> 似たようなケースでも、毎回過去のファイルを探してコピペする手間。<br/>
                <span className="font-bold text-blue-600">After:</span> 質の高いプランを「テンプレート」として保存。タグ検索で瞬時に呼び出し、新しい利用者のベースデータとして一発適用できます。
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-300 border-2">
                  <div className="text-sm font-bold text-slate-800 mb-1">独居・要介護2・転倒リスク高</div>
                  <div className="flex gap-1">
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">独居</span>
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">転倒予防</span>
                  </div>
                </div>
                <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-blue-500" /></div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center text-sm font-bold text-emerald-700">
                  新規利用者に一括適用完了！
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">さあ、新しいケアマネジメントを始めましょう。</h2>
          <p className="text-slate-600 mb-8">左側のメニューから、各機能をお試しいただけます。</p>
        </div>

      </div>
    </div>
  );
}
