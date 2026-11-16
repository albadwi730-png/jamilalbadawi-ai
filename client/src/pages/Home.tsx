import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  Cloud,
  Copy,
  Download,
  FileAudio,
  FileImage,
  FileText,
  Film,
  FolderOpen,
  Headphones,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  Library,
  LogIn,
  Menu,
  Mic2,
  Moon,
  MoreHorizontal,
  Music2,
  Palette,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Split,
  Sun,
  SwitchCamera,
  Swords,
  TextCursorInput,
  Upload,
  UserRound,
  Users,
  Video,
  WandSparkles,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type ToolId =
  | "tts"
  | "clone"
  | "library"
  | "design"
  | "changer"
  | "effects"
  | "stems"
  | "transcribe"
  | "clean"
  | "audiobook"
  | "text-video"
  | "image-video"
  | "images"
  | "dubbing"
  | "dialogue";

type Tool = {
  id: ToolId;
  title: string;
  description: string;
  category: "صوت" | "فيديو وصور";
  icon: typeof Mic2;
  tone: string;
  badge?: string;
};

const tools: Tool[] = [
  { id: "tts", title: "تحويل النص إلى كلام", description: "أصوات عربية واقعية بتعبير واضح", category: "صوت", icon: Mic2, tone: "violet", badge: "الأكثر استخداماً" },
  { id: "clone", title: "استنساخ الأصوات", description: "أنشئ نسخة صوتية بموافقة صاحبها", category: "صوت", icon: Waves, tone: "orange" },
  { id: "library", title: "مكتبة الأصوات", description: "اكتشف أصواتاً عربية وعالمية", category: "صوت", icon: Library, tone: "blue" },
  { id: "design", title: "تصميم صوت جديد", description: "صف الصوت الذي تتخيله", category: "صوت", icon: WandSparkles, tone: "pink" },
  { id: "changer", title: "تغيير الصوت", description: "حوّل أداءك إلى صوت آخر", category: "صوت", icon: SwitchCamera, tone: "indigo" },
  { id: "effects", title: "المؤثرات الصوتية", description: "مطر، رعد، سينما، وطبيعة", category: "صوت", icon: Music2, tone: "cyan" },
  { id: "stems", title: "فصل المسارات", description: "افصل الغناء والموسيقى والآلات", category: "صوت", icon: Split, tone: "green" },
  { id: "transcribe", title: "تحويل الصوت إلى نص", description: "تفريغ دقيق مع توقيت المقاطع", category: "صوت", icon: FileText, tone: "teal" },
  { id: "clean", title: "تنقية وعزل الصوت", description: "أزل الضوضاء والصدى والرياح", category: "صوت", icon: Headphones, tone: "sky" },
  { id: "audiobook", title: "الكتب الصوتية", description: "حوّل كتابك إلى تجربة مسموعة", category: "صوت", icon: BookOpen, tone: "amber" },
  { id: "text-video", title: "النص إلى فيديو", description: "حوّل وصفك إلى مشهد متحرك", category: "فيديو وصور", icon: Film, tone: "purple", badge: "جديد" },
  { id: "image-video", title: "الصورة إلى فيديو", description: "أضف حياة وحركة إلى صورك", category: "فيديو وصور", icon: Video, tone: "rose" },
  { id: "images", title: "إنشاء الصور", description: "صور أصلية من وصفك النصي", category: "فيديو وصور", icon: ImageIcon, tone: "fuchsia" },
  { id: "dubbing", title: "الدبلجة ومزامنة الشفاه", description: "ترجم صوت الفيديو وحافظ على الإيقاع", category: "فيديو وصور", icon: Clapperboard, tone: "red" },
  { id: "dialogue", title: "حوار متعدد المتحدثين", description: "أصوات وشخصيات في ملف واحد", category: "صوت", icon: Users, tone: "violet" },
];

const projects = [
  { title: "فيديو ترويجي للمنتج", type: "فيديو", time: "منذ ٢ ساعة", color: "project-purple", icon: Video },
  { title: "مقدمة بودكاست عربي", type: "صوت", time: "منذ أمس", color: "project-blue", icon: FileAudio },
  { title: "صور حملة الشتاء", type: "صور", time: "منذ ٣ أيام", color: "project-orange", icon: ImageIcon },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="جميل AI">
      <span className="brand-wave"><i /><i /><i /><i /></span>
      <span><b>جميل</b> <em>AI</em></span>
    </div>
  );
}

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (id: ToolId) => void }) {
  const Icon = tool.icon;
  return (
    <button className="tool-card" onClick={() => onOpen(tool.id)}>
      <span className={`tool-icon tone-${tool.tone}`}><Icon size={22} strokeWidth={2.1} /></span>
      <span className="tool-copy">
        <span className="tool-title-row"><strong>{tool.title}</strong>{tool.badge && <small>{tool.badge}</small>}</span>
        <span>{tool.description}</span>
      </span>
      <ArrowLeft size={17} className="tool-arrow" />
    </button>
  );
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: typeof Zap; tone: string }) {
  return (
    <div className="metric-card">
      <span className={`metric-icon tone-${tone}`}><Icon size={18} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [filter, setFilter] = useState<"الكل" | "صوت" | "فيديو وصور">("الكل");
  const [mobileNav, setMobileNav] = useState(false);
  const visibleTools = useMemo(() => filter === "الكل" ? tools : tools.filter(tool => tool.category === filter), [filter]);
  const currentTool = tools.find(tool => tool.id === activeTool);
  const CurrentToolIcon = currentTool?.icon ?? Sparkles;
  const generateImage = trpc.ai.generateImage.useMutation();
  const transcribeUpload = trpc.ai.transcribeUpload.useMutation();
  const cleanAudioUpload = trpc.ai.cleanAudioUpload.useMutation();
  const [imagePrompt, setImagePrompt] = useState("مشهد سينمائي عربي دافئ، استوديو إبداعي مضاء بضوء بنفسجي، تفاصيل واقعية، تكوين احترافي");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [cleanedAudio, setCleanedAudio] = useState<string | null>(null);

  const openTool = (id: ToolId) => setActiveTool(id);
  const runImageGeneration = () => {
    generateImage.mutate({ prompt: imagePrompt }, {
      onSuccess: result => setGeneratedImage(result.url ?? null),
    });
  };
  const runTranscription = async () => {
    if (!audioFile) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
      reader.readAsDataURL(audioFile);
    });
    transcribeUpload.mutate({ fileName: audioFile.name, mimeType: audioFile.type || "audio/mpeg", base64 }, {
      onSuccess: result => setTranscript(result.text),
    });
  };
  const runAudioCleanup = async () => {
    if (!audioFile) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
      reader.readAsDataURL(audioFile);
    });
    cleanAudioUpload.mutate({ fileName: audioFile.name, mimeType: audioFile.type || "audio/mpeg", base64 }, { onSuccess: result => setCleanedAudio(result.url) });
  };

  return (
    <div className="app-shell" dir="rtl">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="sidebar-top"><BrandMark /><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={20} /></button></div>
        <div className="workspace-switcher"><span className="workspace-avatar">ج</span><span><b>مساحة جميل</b><small>الحساب الشخصي</small></span><ChevronDown size={16} /></div>
        <nav className="main-nav">
          <span className="nav-label">مساحتك</span>
          <a className="nav-item active" href="#top"><LayoutDashboard size={18} /><span>الرئيسية</span><i /></a>
          <a className="nav-item" href="#tools"><Boxes size={18} /><span>كل الأدوات</span><small>١٥</small></a>
          <a className="nav-item" href="#projects"><FolderOpen size={18} /><span>المشاريع</span></a>
          <a className="nav-item" href="#library"><Library size={18} /><span>مكتبة الأصول</span></a>
          <a className="nav-item" href="#history"><Activity size={18} /><span>سجل العمليات</span></a>
          <span className="nav-label second">إدارة</span>
          <a className="nav-item" href="#favorites"><Sparkles size={18} /><span>المفضلة</span></a>
          <a className="nav-item" href="#team"><Users size={18} /><span>فريقي</span></a>
          <a className="nav-item" href="#settings"><Settings size={18} /><span>الإعدادات</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-box"><CircleHelp size={18} /><span><b>تحتاج مساعدة؟</b><small>فريقنا هنا لمساعدتك</small></span><ArrowLeft size={15} /></div>
          <Link href="/admin" className="admin-link"><BarChart3 size={18} /> لوحة المالك</Link>
          <div className="user-mini"><span className="avatar-photo">ج</span><span><b>جميل البدوي</b><small>مالك المنصة</small></span><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <div className="main-shell" id="top">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={22} /></button>
          <div className="breadcrumb"><span>مساحتك</span><ChevronDown size={15} /><strong>الرئيسية</strong></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="بحث"><Search size={19} /></button>
            <button className="icon-button notification-button" aria-label="الإشعارات"><Bell size={19} /><i>3</i></button>
            <button className="theme-button" onClick={toggleTheme} aria-label="تبديل الوضع">{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
            <button className="top-user"><span className="avatar-photo small">ج</span><ChevronDown size={14} /></button>
          </div>
        </header>

        <main className="content" id="tools">
          <section className="welcome-row">
            <div><p className="eyebrow"><span className="live-dot" /> مساحة إبداعية جاهزة</p><h1>مساء الإبداع، <span>جميل</span></h1><p className="subline">حوّل الأفكار إلى صوت وصورة وفيديو يترك أثراً.</p></div>
            <button className="primary-button" onClick={() => openTool("tts")}><Plus size={18} /> مشروع جديد</button>
          </section>

          <section className="balance-banner">
            <div className="balance-glow" />
            <div className="balance-copy"><span className="balance-label">رصيدك الحالي</span><strong>2,750 <small>رصيد</small></strong><span className="balance-meta"><span className="up-mark">↑ 12%</span> عن الشهر الماضي</span></div>
            <div className="balance-divider" />
            <div className="balance-usage"><div><span>الاستخدام الشهري</span><b>36%</b></div><div className="usage-track"><i style={{ width: "36%" }} /></div><small>تبقى ١,٧٦٠ رصيداً حتى نهاية الشهر</small></div>
            <button className="secondary-button"><Zap size={17} /> شراء رصيد</button>
          </section>

          <section className="quick-stats"><MetricCard label="مشاريع نشطة" value="١٢" hint="+٣ هذا الأسبوع" icon={FolderOpen} tone="violet" /><MetricCard label="وقت المعالجة" value="٤٢ د" hint="تم توفير ١٨٪" icon={Activity} tone="blue" /><MetricCard label="الأصول المحفوظة" value="٨٤" hint="آخرها منذ ساعتين" icon={Cloud} tone="green" /><MetricCard label="جودة الصوت" value="96%" hint="متوسط تقييمك" icon={Waves} tone="orange" /></section>

          <section className="hero-strip">
            <div className="hero-grid" /><div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
            <div className="hero-content"><span className="hero-kicker"><Sparkles size={14} /> مساحة واحدة لكل أفكارك</span><h2>من النص إلى<br /><span>المشهد الكامل.</span></h2><p>أنشئ صوتاً مؤثراً، صورة لافتة، أو فيديو متكاملاً<br className="desktop-only" /> من مكان واحد وبخطوات واضحة.</p><button className="hero-button" onClick={() => openTool("images")}>استكشف الأدوات <ArrowLeft size={17} /></button></div>
            <div className="hero-visual"><div className="hero-card audio-card"><div className="hero-card-icon"><Waves size={20} /></div><div><b>تجربة صوتية</b><small>صوت وثائقي · 00:32</small></div><button><Play size={15} fill="currentColor" /></button><div className="mini-wave">{Array.from({ length: 32 }).map((_, i) => <i key={i} style={{ height: `${12 + ((i * 17) % 24)}px` }} />)}</div></div><div className="hero-card image-card"><span className="image-swatch" /><div><b>مشهد مستقبلي</b><small>صورة مولدة · 2048px</small></div><Sparkles size={16} /></div></div>
          </section>

          <section className="section-heading"><div><p className="eyebrow">ابدأ من هنا</p><h2>الأدوات التي تحتاجها</h2></div><div className="filter-pills">{(["الكل", "صوت", "فيديو وصور"] as const).map(item => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></section>
          <section className="tools-grid">{visibleTools.map(tool => <ToolCard key={tool.id} tool={tool} onOpen={openTool} />)}</section>

          <section className="section-heading projects-heading" id="projects"><div><p className="eyebrow">العمل مستمر</p><h2>أحدث مشاريعك</h2></div><button className="text-button">عرض الكل <ArrowLeft size={15} /></button></section>
          <section className="projects-grid">{projects.map(project => { const Icon = project.icon; return <article className="project-card" key={project.title}><div className={`project-preview ${project.color}`}><Icon size={30} /><button><Play size={15} fill="currentColor" /></button></div><div className="project-info"><div><h3>{project.title}</h3><p>{project.type} <span>•</span> {project.time}</p></div><button className="more-button"><MoreHorizontal size={19} /></button></div><div className="project-actions"><button><Download size={14} /> تنزيل</button><button><Copy size={14} /> مشاركة</button></div></article> })}</section>

          <footer className="footer"><BrandMark /><span>كل ما تحتاجه لصناعة محتوى يُسمع ويُرى.</span><span className="footer-copy">© 2026 جميل AI</span></footer>
        </main>
      </div>

      {activeTool && <div className="drawer-overlay" onClick={() => setActiveTool(null)}><aside className="tool-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="drawer-kicker">مساحة العمل</span><h2>{currentTool?.title}</h2></div><button className="close-drawer" onClick={() => setActiveTool(null)}><X size={19} /></button></div><div className="drawer-body"><div className="cost-card"><span>التكلفة التقديرية</span><strong>{activeTool === "images" ? "12" : activeTool === "transcribe" ? "0" : activeTool === "tts" ? "4" : "تُحسب بعد الإعداد"} <small>رصيد</small></strong><small className="cost-note">لا يتم الخصم عند فشل العملية؛ التفريغ متاح حالياً دون خصم</small></div>{activeTool === "images" ? <><label className="field-label">صف الصورة</label><textarea className="prompt-field" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} /><div className="field-row"><label><span>النمط</span><select><option>سينمائي واقعي</option><option>رسوم ثلاثية الأبعاد</option><option>إعلاني نظيف</option></select></label><label><span>نسبة الأبعاد</span><select><option>16:9</option><option>1:1</option><option>9:16</option></select></label></div><div className="drawer-actions"><button className="secondary-button"><Upload size={16} /> صورة مرجعية</button><button className="primary-button" disabled={generateImage.isPending} onClick={runImageGeneration}>{generateImage.isPending ? <><Activity size={16} className="spin" /> جارٍ الإنشاء</> : <><Sparkles size={16} /> إنشاء الصورة</>}</button></div>{generateImage.error && <div className="error-box">تعذر التنفيذ: {generateImage.error.message}</div>}{generatedImage && <div className="result-preview"><img src={generatedImage} alt="النتيجة المولدة" /><a href={generatedImage} target="_blank" rel="noreferrer"><Download size={15} /> فتح وتنزيل النتيجة</a></div>}</> : activeTool === "transcribe" ? <><label className="field-label">ملف صوتي أو فيديو</label><label className="drop-zone file-picker"><Upload size={24} /><b>{audioFile ? audioFile.name : "اختر ملفاً من جهازك"}</b><small>MP3, WAV, M4A, OGG, MP4 حتى 100MB</small><input type="file" accept="audio/*,video/mp4" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} /></label><div className="field-row"><label><span>اللغة</span><select><option value="">اكتشاف تلقائي</option><option value="ar">العربية</option><option value="en">English</option></select></label></div><div className="drawer-actions"><button className="primary-button" disabled={!audioFile || transcribeUpload.isPending} onClick={runTranscription}>{transcribeUpload.isPending ? <><Activity size={16} className="spin" /> جارٍ التفريغ</> : <><FileText size={16} /> تحويل إلى نص</>}</button></div>{transcribeUpload.error && <div className="error-box">تعذر التفريغ: {transcribeUpload.error.message}</div>}{transcript && <div className="transcript-result"><div>{transcript}</div><a download="transcript.txt" href={`data:text/plain;charset=utf-8,${encodeURIComponent(transcript)}`}><Download size={15} /> تنزيل TXT</a></div>}</> : activeTool === "clean" ? <><label className="field-label">ملف الصوت المراد تحسينه</label><label className="drop-zone file-picker"><Upload size={24} /><b>{audioFile ? audioFile.name : "اختر تسجيلاً من جهازك"}</b><small>المعالجة محلية عبر ffmpeg — WAV أو MP3 حتى 100MB</small><input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} /></label><div className="drawer-actions"><button className="primary-button" disabled={!audioFile || cleanAudioUpload.isPending} onClick={runAudioCleanup}>{cleanAudioUpload.isPending ? <><Activity size={16} className="spin" /> جارٍ التحسين</> : <><WandSparkles size={16} /> تنقية وتحسين</>}</button></div>{cleanAudioUpload.error && <div className="error-box">تعذر تحسين الصوت: {cleanAudioUpload.error.message}</div>}{cleanedAudio && <div className="result-preview audio-result"><audio controls src={cleanedAudio} /><a href={cleanedAudio} download="jamil-cleaned-audio.wav"><Download size={15} /> تنزيل الملف المحسن</a></div>}</> : <><div className="tool-placeholder"><span className={`tool-icon tone-${currentTool?.tone}`}><CurrentToolIcon size={28} /></span><h3>مساحة عمل {currentTool?.title}</h3><p>هذه الواجهة جاهزة للإعداد والربط بالمحرك الرسمي. اختر ملفاً أو اكتب النص، ثم ستظهر التكلفة والمدة قبل التنفيذ.</p><div className="drop-zone"><Upload size={24} /><b>اسحب ملفاً هنا أو اختر من جهازك</b><small>MP3, WAV, MP4, PDF حتى 100MB</small></div></div><div className="drawer-actions"><button className="secondary-button" onClick={() => startLogin()}><LogIn size={16} /> تسجيل الدخول للبدء</button><button className="primary-button" onClick={() => setActiveTool(null)}>حفظ كمسودة <Check size={16} /></button></div></>}</div></aside></div>}
    </div>
  );
}
