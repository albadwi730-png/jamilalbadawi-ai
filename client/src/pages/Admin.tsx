import { Link } from "wouter";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  FileCheck2,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  MoreHorizontal,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const paymentRows = [
  { id: "#PAY-1048", user: "سارة محمد", plan: "احترافية", method: "محفظة جوالي", amount: "15,000 ر.ي", status: "قيد المراجعة", tone: "pending" },
  { id: "#PAY-1047", user: "عبدالله علي", plan: "أساسية", method: "الكريمي", amount: "7,500 ر.ي", status: "مقبول", tone: "success" },
  { id: "#PAY-1046", user: "نورا يحيى", plan: "حزمة 2,000 رصيد", method: "فلوسك", amount: "5,000 ر.ي", status: "مقبول", tone: "success" },
  { id: "#PAY-1045", user: "محمود سالم", plan: "احترافية", method: "الكريمي", amount: "15,000 ر.ي", status: "مرفوض", tone: "danger" },
];

function AdminMetric({ label, value, change, icon: Icon, tone }: { label: string; value: string; change: string; icon: typeof Users; tone: string }) {
  return <div className="admin-metric"><span className={`admin-metric-icon ${tone}`}><Icon size={18} /></span><div><span>{label}</span><strong>{value}</strong><small className={change.startsWith("-") ? "negative" : "positive"}>{change}</small></div></div>;
}

export default function Admin() {
  const auth = trpc.auth.me.useQuery();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: auth.data?.role === "admin" });
  const summary = overview.data;
  const format = (value: number | undefined, suffix = "") => value === undefined ? "—" : `${value.toLocaleString("ar-YE")}${suffix}`;

  if (auth.isLoading) {
    return <div className="admin-gate" dir="rtl"><Loader2 className="spin" size={24} /><span>جارٍ التحقق من صلاحيات المالك…</span></div>;
  }

  if (!auth.data) {
    return <div className="admin-gate" dir="rtl"><div><ShieldCheck size={28} /><h1>لوحة المالك محمية</h1><p>سجّل الدخول بحساب المالك للوصول إلى الإحصاءات والمدفوعات والإعدادات الحساسة.</p><button className="primary-button" onClick={() => startLogin()}>تسجيل الدخول</button><Link href="/" className="back-link">العودة إلى المنصة</Link></div></div>;
  }

  if (auth.data.role !== "admin") {
    return <div className="admin-gate" dir="rtl"><div><LockKeyhole size={28} /><h1>ليس لديك صلاحية</h1><p>هذا القسم مخصص لحساب Super Admin المعيّن من مالك المنصة.</p><Link href="/" className="primary-button">العودة إلى الرئيسية</Link></div></div>;
  }

  return <div className="admin-shell" dir="rtl">
    <aside className="admin-sidebar"><div className="admin-brand"><span className="brand-wave"><i /><i /><i /><i /></span><div><b>جميل</b> <em>AI</em><small>لوحة المالك</small></div></div><div className="owner-card"><span className="avatar-photo">ج</span><div><b>جميل البدوي</b><small>Super Admin</small></div><ShieldCheck size={17} /></div><nav><span className="admin-nav-label">المراقبة</span><a className="active"><BarChart3 size={18} /> الملخص</a><a><Users size={18} /> المستخدمون <small>1,284</small></a><a><Layers3 size={18} /> العمليات</a><a><WalletCards size={18} /> الأرصدة والباقات</a><span className="admin-nav-label">الإدارة</span><a><Receipt size={18} /> المدفوعات <small className="alert-count">12</small></a><a><Sparkles size={18} /> محركات الذكاء الاصطناعي</a><a><FileText size={18} /> المحتوى</a><a><Bell size={18} /> الإشعارات</a><a><Settings2 size={18} /> إعدادات المنصة</a></nav><div className="admin-sidebar-foot"><LockKeyhole size={16} /> <span>حسابك محمي بالمصادقة الثنائية</span></div></aside>
    <div className="admin-main"><header className="admin-topbar"><div><Link href="/" className="back-link"><ArrowRight size={17} /> العودة للمنصة</Link><span className="admin-divider" /><h1>نظرة عامة</h1></div><div className="admin-actions"><button className="icon-button"><Search size={18} /></button><button className="icon-button"><Bell size={18} /><i>2</i></button><button className="admin-date">آخر ٣٠ يوماً <ChevronDown size={15} /></button><button className="avatar-photo small">ج</button></div></header><main className="admin-content"><div className="admin-welcome"><div><p className="eyebrow">الاثنين، ١٦ نوفمبر ٢٠٢٦</p><h2>صباح الإدارة، جميل <span>✦</span></h2><p>هذه صورة سريعة عن أداء جميل AI وتدفق العمليات اليوم.</p></div><button className="export-button"><FileCheck2 size={16} /> تصدير التقرير</button></div><section className="admin-metrics"><AdminMetric label="إجمالي المستخدمين" value={format(summary?.users)} change={summary ? `+${summary.newUsers} جديد` : "جارٍ التحميل"} icon={Users} tone="purple" /><AdminMetric label="الإيرادات المسجلة" value={format(summary?.revenue, " ر.ي")} change={summary ? `${summary.pendingPayments} طلب بانتظار المراجعة` : "جارٍ التحميل"} icon={CircleDollarSign} tone="green" /><AdminMetric label="الأرصدة المستخدمة" value={format(summary?.creditsUsed)} change={summary ? `${summary.creditsSold} مباعة أو ممنوحة` : "جارٍ التحميل"} icon={Gauge} tone="blue" /><AdminMetric label="تكلفة المحركات" value="تُحسب من المزود" change="تحتاج ربط التكاليف" icon={Database} tone="orange" /></section><section className="admin-grid"><div className="analytics-panel"><div className="panel-head"><div><h3>نشاط المنصة</h3><p>توليد المحتوى خلال الفترة المحددة</p></div><div className="chart-legend"><span><i className="legend-purple" /> عمليات صوت</span><span><i className="legend-blue" /> عمليات فيديو</span></div></div><div className="chart-area"><div className="chart-y"><span>١٢٠٠</span><span>٩٠٠</span><span>٦٠٠</span><span>٣٠٠</span><span>٠</span></div><div className="chart"><div className="chart-grid-lines" /><svg viewBox="0 0 620 230" preserveAspectRatio="none"><defs><linearGradient id="fillPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8d5cff" stopOpacity=".27" /><stop offset="1" stopColor="#8d5cff" stopOpacity="0" /></linearGradient><linearGradient id="fillBlue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#40bff4" stopOpacity=".18" /><stop offset="1" stopColor="#40bff4" stopOpacity="0" /></linearGradient></defs><path d="M0 182 C45 164 75 168 108 130 S170 149 205 112 S270 135 305 94 S364 120 400 86 S455 106 491 62 S555 90 620 29 L620 230 L0 230Z" fill="url(#fillPurple)" /><path d="M0 194 C48 185 78 187 112 158 S168 178 206 140 S268 160 304 128 S365 148 401 112 S459 130 493 97 S550 116 620 76 L620 230 L0 230Z" fill="url(#fillBlue)" /><path d="M0 182 C45 164 75 168 108 130 S170 149 205 112 S270 135 305 94 S364 120 400 86 S455 106 491 62 S555 90 620 29" fill="none" stroke="#8557fa" strokeWidth="3" /><path d="M0 194 C48 185 78 187 112 158 S168 178 206 140 S268 160 304 128 S365 148 401 112 S459 130 493 97 S550 116 620 76" fill="none" stroke="#35b8eb" strokeWidth="2.5" strokeDasharray="6 5" /></svg><div className="chart-x"><span>١ أكتوبر</span><span>٧</span><span>١٤</span><span>٢١</span><span>٢٨</span><span>اليوم</span></div></div></div></div><div className="engine-panel"><div className="panel-head"><div><h3>حالة المحركات</h3><p>المراقبة اللحظية للخدمات</p></div><button className="more-button"><MoreHorizontal size={19} /></button></div><div className="engine-list"><div><span className="engine-icon purple"><Sparkles size={17} /></span><span><b>ImageService</b><small>توليد الصور</small></span><em className="online">متصل</em></div><div><span className="engine-icon blue"><WavesIcon /></span><span><b>Speech to Text</b><small>تفريغ الصوت</small></span><em className="online">متصل</em></div><div><span className="engine-icon orange"><ClapperIcon /></span><span><b>Video Provider</b><small>توليد الفيديو</small></span><em className="warning">مراقبة</em></div><div><span className="engine-icon green"><CloudIcon /></span><span><b>Storage</b><small>تخزين الملفات</small></span><em className="online">متصل</em></div></div><button className="panel-link">إدارة جميع المحركات <ArrowRight size={15} /></button></div></section><section className="payments-panel"><div className="panel-head"><div><h3>آخر طلبات الدفع</h3><p>مراجعة التحويلات اليدوية قبل إضافة الرصيد</p></div><button className="panel-link">عرض جميع المدفوعات <ArrowRight size={15} /></button></div><div className="table-wrap"><table><thead><tr><th>رقم الطلب</th><th>المستخدم</th><th>الباقة</th><th>الوسيلة</th><th>القيمة</th><th>الحالة</th><th /></tr></thead><tbody>{paymentRows.map(row => <tr key={row.id}><td><b className="mono">{row.id}</b></td><td><span className="table-user"><span className="avatar-photo tiny">{row.user.slice(0, 1)}</span>{row.user}</span></td><td>{row.plan}</td><td>{row.method}</td><td><b>{row.amount}</b></td><td><span className={`status ${row.tone}`}>{row.tone === "success" ? <Check size={13} /> : row.tone === "danger" ? <X size={13} /> : <Clock3 size={13} />}{row.status}</span></td><td><button className="more-button"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section><div className="admin-note"><span><TrendingUp size={18} /></span><p><b>مؤشر جيد:</b> ارتفع معدل إتمام عمليات الصوت بنسبة ١٨٪ هذا الأسبوع. راجع تكاليف مزود الفيديو قبل تفعيل حملتك القادمة.</p><button>فهمت</button></div></main></div>
  </div>;
}

function WavesIcon() { return <span className="mini-wave-icon"><i /><i /><i /><i /></span>; }
function ClapperIcon() { return <span className="clapper-icon"><i /><i /><i /></span>; }
function CloudIcon() { return <span className="cloud-icon">☁</span>; }
