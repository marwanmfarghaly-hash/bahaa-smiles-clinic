import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  Search,
  X,
  Smartphone,
  AlertCircle,
  Trash2,
  CalendarDays,
  ExternalLink,
  Menu,
  ChevronLeft
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: ClinicApp,
});

interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: "مؤكد" | "مكتمل" | "ملغي";
  createdAt: string;
}

const SERVICES = [
  {
    id: "implants",
    title: "زراعة الأسنان",
    desc: "تعويض الأسنان المفقودة بأحدث الغرسات العالمية الآمنة وبدون ألم.",
    icon: Sparkles,
  },
  {
    id: "endodontics",
    title: "علاج وحشو العصب",
    desc: "جلسات مريحة بأحدث أجهزة الروتاري للحفاظ على السن الطبيعي.",
    icon: ShieldCheck,
  },
  {
    id: "cleaning",
    title: "تنظيف وتلميع الأسنان",
    desc: "إزالة الجير والترسبات بعناية فائقة لحماية اللثة وانتعاش الفم.",
    icon: Stethoscope,
  },
  {
    id: "whitening",
    title: "تبييض الأسنان",
    desc: "جلسات تبييض آمنة وفعالة للحصول على ابتسامة مشرقة وطبيعية.",
    icon: Sparkles,
  },
  {
    id: "prosthetics",
    title: "تركيبات وتيجان الأسنان",
    desc: "تيجان وجسور الزيركون والإيماكس بأعلى درجات الدقة والجمال.",
    icon: ShieldCheck,
  },
  {
    id: "consultation",
    title: "كشف واستشارة عامة",
    desc: "فحص شامل وتشخيص دقيق باستخدام أحدث وسائل التشخيص الطبي.",
    icon: Stethoscope,
  },
];

const TIME_SLOTS = [
  "04:00 مساءً",
  "05:00 مساءً",
  "06:00 مساءً",
  "07:00 مساءً",
  "08:00 مساءً",
  "09:00 مساءً",
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-101",
    name: "أحمد محمود",
    phone: "01012345678",
    service: "زراعة الأسنان",
    date: "2026-11-25",
    time: "05:00 مساءً",
    notes: "كشف مبدئي للزراعة",
    status: "مؤكد",
    createdAt: "2026-11-23",
  },
  {
    id: "b-102",
    name: "سارة إبراهيم",
    phone: "01198765432",
    service: "تنظيف وتلميع الأسنان",
    date: "2026-11-26",
    time: "06:00 مساءً",
    notes: "",
    status: "مؤكد",
    createdAt: "2026-11-23",
  },
];

function ClinicApp() {
  const [activeTab, setActiveTab] = useState<"home" | "booking" | "doctor">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bahaa_clinic_bookings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_BOOKINGS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bahaa_clinic_bookings", JSON.stringify(bookings));
    }
  }, [bookings]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formService, setFormService] = useState(SERVICES[0].title);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Doctor Auth state
  const [isDoctorAuth, setIsDoctorAuth] = useState(false);
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorAuthError, setDoctorAuthError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("يرجى إدخال اسم المريض بالكامل.");
      return;
    }
    if (!formPhone.trim() || formPhone.trim().length < 10) {
      setFormError("يرجى إدخال رقم هاتف صحيح للتواصل.");
      return;
    }
    if (!formDate) {
      setFormError("يرجى تحديد يوم الموعد.");
      return;
    }

    // Check if Friday
    const selectedDay = new Date(formDate).getDay();
    if (selectedDay === 5) {
      setFormError("يوم الجمعة إجازة رسمية للعيادة. يرجى اختيار يوم آخر من السبت للخميس.");
      return;
    }

    if (!formTime) {
      setFormError("يرجى اختيار التوقيت المناسب للحجز.");
      return;
    }

    // Check capacity (max 2 per slot)
    const existingCount = bookings.filter(
      (b) => b.date === formDate && b.time === formTime && b.status !== "ملغي"
    ).length;

    if (existingCount >= 2) {
      setFormError("هذا الموعد مكتمل بالفعل (الحد الأقصى مريضين في الساعة). يرجى اختيار ساعة أخرى.");
      return;
    }

    const newBooking: Booking = {
      id: "BK-" + Math.floor(1000 + Math.random() * 9000),
      name: formName.trim(),
      phone: formPhone.trim(),
      service: formService,
      date: formDate,
      time: formTime,
      notes: formNotes.trim(),
      status: "مؤكد",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setBookings((prev) => [newBooking, ...prev]);
    setConfirmedBooking(newBooking);
    setFormName("");
    setFormPhone("");
    setFormNotes("");
    setFormTime("");
  };

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorAuthError("");
    if (doctorPassword.trim() === "Dental Clinic 2026") {
      setIsDoctorAuth(true);
      setDoctorPassword("");
    } else {
      setDoctorAuthError("كلمة السر غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.");
    }
  };

  const updateBookingStatus = (id: string, status: "مؤكد" | "مكتمل" | "ملغي") => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const deleteBooking = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الحجز نهائياً؟")) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-teal-700 text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-200" />
            <span>مواعيد العمل: السبت - الخميس (4:00 عصراً - 10:00 مساءً) | الجمعة مغلق</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:01286661471" className="flex items-center gap-1 hover:underline">
              <Phone className="w-4 h-4 text-teal-200" />
              <span dir="ltr">01286661471</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          {/* Logo & Clinic Name */}
          <div
            onClick={() => setActiveTab("home")}
            className="cursor-pointer flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Dental Clinic
              </h1>
              <p className="text-xs text-teal-700 font-semibold">
                د. عمر بهاء الدين — استشاري زراعة الأسنان
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab("home")}
              className={`transition-colors py-2 ${
                activeTab === "home" ? "text-teal-600 font-bold border-b-2 border-teal-600" : "text-slate-600 hover:text-teal-600"
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveTab("home");
                setTimeout(() => {
                  document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="text-slate-600 hover:text-teal-600 transition-colors py-2"
            >
              الخدمات
            </button>
            <button
              onClick={() => {
                setActiveTab("booking");
                setConfirmedBooking(null);
              }}
              className={`transition-colors py-2 ${
                activeTab === "booking" ? "text-teal-600 font-bold border-b-2 border-teal-600" : "text-slate-600 hover:text-teal-600"
              }`}
            >
              حجز موعد
            </button>
            <button
              onClick={() => {
                setActiveTab("home");
                setTimeout(() => {
                  document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="text-slate-600 hover:text-teal-600 transition-colors py-2"
            >
              عن العيادة
            </button>
            <button
              onClick={() => setActiveTab("doctor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === "doctor"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة الطبيب</span>
            </button>
          </nav>

          {/* Quick CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab("booking");
                setConfirmedBooking(null);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              احجز موعدك
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
              }}
              className="text-right py-2 px-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveTab("booking");
                setConfirmedBooking(null);
                setMobileMenuOpen(false);
              }}
              className="text-right py-2 px-3 rounded-lg text-teal-700 font-bold bg-teal-50"
            >
              حجز موعد للمريض
            </button>
            <button
              onClick={() => {
                setActiveTab("doctor");
                setMobileMenuOpen(false);
              }}
              className="text-right py-2 px-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>لوحة الطبيب الخاصة</span>
            </button>
            <a
              href="tel:01286661471"
              className="text-right py-2 px-3 text-sm text-slate-600 flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              <span>اتصال: 01286661471</span>
            </a>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main>
        {/* TAB 1: HOME PAGE */}
        {activeTab === "home" && (
          <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-teal-50/70 via-white to-slate-50 py-12 md:py-20 px-4 border-b border-slate-100">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-teal-100/80 text-teal-800 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full">
                    <ShieldCheck className="w-4 h-4" />
                    <span>رعاية طبية تخصصية بأحدث المعايير</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                    ابتسامة صحية وجميلة تبدأ مع{" "}
                    <span className="text-teal-600">د. عمر بهاء الدين</span>
                  </h2>

                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                    استشاري وماجستير زراعة وتجميل الأسنان. نقدم في عيادتنا أرقى معايير الرعاية والتعقيم الطبي مع أحدث الأجهزة لضمان علاج دقيق وخالٍ من الألم.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveTab("booking");
                        setConfirmedBooking(null);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-base"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>احجز موعدك الآن</span>
                    </button>

                    <a
                      href="https://wa.me/201286661471?text=مرحباً%20عيادة%20د.%20عمر%20بهاء%20الدين،%20أود%20الاستفسار%20عن%20المواعيد"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 text-base"
                    >
                      <span>واتساب العيادة</span>
                    </a>

                    <a
                      href="tel:01286661471"
                      className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span>01286661471</span>
                    </a>
                  </div>

                  {/* Trust Highlights */}
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
                    <div className="text-center p-3 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <p className="text-xs text-slate-500">مواعيد منظمة</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">حد أقصى مريضين/ساعة</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <p className="text-xs text-slate-500">تعقيم فائق</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">أعلى بروتوكول أمان</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <p className="text-xs text-slate-500">خبرة متخصصة</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">زراعة وتجميل</p>
                    </div>
                  </div>
                </div>

                {/* Hero Clinic Card */}
                <div className="md:col-span-5">
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-5">
                    <div className="relative rounded-xl overflow-hidden bg-teal-50 aspect-4/3 flex items-center justify-center border border-teal-100">
                      <img
                        src="/clinic-interior.jpg"
                        alt="عيادة د. عمر بهاء الدين"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback illustration if image not yet loaded
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4 text-white">
                        <div>
                          <p className="text-xs font-semibold text-teal-300">عيادة متخصصة</p>
                          <h3 className="font-bold text-lg">Dental Clinic</h3>
                          <p className="text-xs text-slate-200">٢٦١ ه‍ شارع الضغط</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                        <span>٢٦١ ه‍ شارع الضغط</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-teal-600 shrink-0" />
                        <span>من السبت إلى الخميس: 4:00 عصراً - 10:00 مساءً</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>الجمعة: إجازة أسبوعية</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("booking");
                        setConfirmedBooking(null);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      الانتقال إلى حجز موعد
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section id="services-section" className="py-16 px-4 max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-teal-700 font-bold text-sm tracking-wide">الخدمات العلاجية والتجميلية</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  رعاية متكاملة لصحة وجمال أسنانك
                </h3>
                <p className="text-slate-600 text-sm mt-2">
                  نستخدم أحدث البروتوكولات الطبية العالمية لضمان نتائج دقيقة وابتسامة تدوم.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SERVICES.map((srv) => {
                  const IconComponent = srv.icon;
                  return (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{srv.desc}</p>
                      <button
                        onClick={() => {
                          setFormService(srv.title);
                          setActiveTab("booking");
                          setConfirmedBooking(null);
                        }}
                        className="text-teal-600 font-semibold text-xs inline-flex items-center gap-1 hover:underline"
                      >
                        <span>طلب حجز لهذه الخدمة</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* About Doctor Section */}
            <section id="about-section" className="bg-slate-100 py-16 px-4">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shrink-0">
                    <User className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                  <div className="space-y-3 text-center md:text-right">
                    <div className="inline-block bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-md">
                      استشاري زراعة وتجميل الأسنان
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      د. عمر بهاء الدين
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      حاصل على ماجستير واستشاري زراعة الأسنان، بخبرة واسعة في تعويض وتجميل الأسنان وإعادة تأهيل الفكين بأحدث الوسائل التكنولوجية، مع الالتزام التام بتوفير تجربة علاج مريحة ودقيقة لكل مريض.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-slate-700">
                      <span>✓ تعقيم بأحدث الأجهزة</span>
                      <span>✓ مواعيد دقيقة</span>
                      <span>✓ متابعة دورية بعد العلاج</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Install App / PWA Section */}
            <section className="py-14 px-4 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="space-y-2 text-center sm:text-right">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
                      <Smartphone className="w-4 h-4" />
                      <span>تطبيق العيادة السريع على هاتفك</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold">
                      ثبّت التطبيق على شاشة موبايلك بسهولة
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md">
                      تقدر تضيف الموقع كأيقونة على شاشة تليفونك لحجز المواعيد ومتابعتها في أي وقت وبدون الحاجة لفتح المتجر.
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-xs space-y-2 text-slate-200 max-w-xs">
                    <p className="font-bold text-white text-sm">طريقة التثبيت:</p>
                    <p>• <strong>أندرويد:</strong> اضغط على القائمة (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية".</p>
                    <p>• <strong>آيفون:</strong> اضغط على زر المشاركة (Share) في Safari ثم "إضافة إلى الشاشة الرئيسية".</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: BOOKING PAGE */}
        {activeTab === "booking" && (
          <div className="py-12 px-4 max-w-3xl mx-auto">
            {confirmedBooking ? (
              /* Success Confirmation Card */
              <div className="bg-white rounded-2xl p-8 border border-teal-200 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    تم تأكيد حجزك بنجاح!
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    نسعد باستقبالك في عيادة د. عمر بهاء الدين
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-right space-y-2.5 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">رقم الحجز:</span>
                    <span className="font-bold text-teal-700">{confirmedBooking.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">اسم المريض:</span>
                    <span className="font-bold text-slate-800">{confirmedBooking.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">الخدمة:</span>
                    <span className="font-bold text-slate-800">{confirmedBooking.service}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">اليوم والتاريخ:</span>
                    <span className="font-bold text-slate-800">{confirmedBooking.date}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">الساعة:</span>
                    <span className="font-bold text-teal-700">{confirmedBooking.time}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">العنوان:</span>
                    <span className="font-semibold text-slate-800">٢٦١ ه‍ شارع الضغط</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      "موعد عيادة د. عمر بهاء الدين - " + confirmedBooking.service
                    )}&details=${encodeURIComponent(
                      "حجز موعد أسنان باسم: " + confirmedBooking.name + " - هاتف: " + confirmedBooking.phone
                    )}&location=${encodeURIComponent("٢٦١ ه‍ شارع الضغط")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm text-sm inline-flex items-center justify-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>إضافة الموعد لتقويم Google</span>
                  </a>

                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-5 rounded-xl text-sm"
                  >
                    حجز موعد آخر
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
                <div>
                  <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-md mb-2">
                    حجز سريع ومباشر
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    احجز موعد كشف أو استشارة
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    يرجى تعبئة البيانات التالية لاختيار التوقيت الأنسب لك.
                  </p>
                </div>

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  {/* Service */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      الخدمة المطلوبة
                    </label>
                    <select
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        يوم الموعد
                      </label>
                      <input
                        type="date"
                        min={minDate}
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        * مواعيد العيادة من السبت إلى الخميس (الجمعة إجازة)
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        الساعة المتاحة
                      </label>
                      <select
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                      >
                        <option value="">اختر الوقت</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        * العمل من 4:00 عصراً حتى 10:00 مساءً
                      </span>
                    </div>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      اسم المريض بالكامل
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل اسمك الكريم"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                    />
                  </div>

                  {/* Patient Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      رقم الهاتف (للتواصل وتأكيد الحجز)
                    </label>
                    <input
                      type="tel"
                      placeholder="مثال: 01286661471"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      ملاحظات أو شكوى الأسنان (اختياري)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="اكتب أي تفاصيل تحب إبلاغ الطبيب بها مسبقاً..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-base"
                  >
                    تأكيد حجز الموعد
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCTOR DASHBOARD */}
        {activeTab === "doctor" && (
          <div className="py-10 px-4 max-w-5xl mx-auto">
            {!isDoctorAuth ? (
              /* Doctor Login Gate */
              <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-md">
                  <Lock className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    بوابة الطبيب الخاصة
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    محمية بكلمة مرور - مخصصة لإدارة سجلات وحجوزات العيادة
                  </p>
                </div>

                {doctorAuthError && (
                  <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-200">
                    {doctorAuthError}
                  </div>
                )}

                <form onSubmit={handleDoctorLogin} className="space-y-4 text-right">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      كلمة مرور الطبيب
                    </label>
                    <input
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-slate-900 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all text-sm"
                  >
                    دخول إلى لوحة التحكم
                  </button>
                </form>
              </div>
            ) : (
              /* Doctor Control Panel */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-xs text-teal-700 font-bold">لوحة إدارة الحجوزات</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      سجلات المرضى والمواعيد
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-3 py-1.5 rounded-lg border border-teal-200">
                      إجمالي الحجوزات: {bookings.length}
                    </span>
                    <button
                      onClick={() => setIsDoctorAuth(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      placeholder="بحث باسم المريض أو رقم الهاتف أو كود الحجز..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-teal-600 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">الحالة:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-teal-600"
                    >
                      <option value="all">الكل ({bookings.length})</option>
                      <option value="مؤكد">مؤكد</option>
                      <option value="مكتمل">مكتمل</option>
                      <option value="ملغي">ملغي</option>
                    </select>
                  </div>
                </div>

                {/* Bookings Table / Cards */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {filteredBookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      لا توجد أي حجوزات تطابق البحث الحالي.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                          <tr>
                            <th className="py-3 px-4">كود الحجز</th>
                            <th className="py-3 px-4">المريض</th>
                            <th className="py-3 px-4">رقم الهاتف</th>
                            <th className="py-3 px-4">الخدمة</th>
                            <th className="py-3 px-4">الموعد</th>
                            <th className="py-3 px-4">الحالة</th>
                            <th className="py-3 px-4 text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-700">
                                {b.id}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">
                                {b.name}
                                {b.notes && (
                                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                                    ملاحظة: {b.notes}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 text-xs" dir="ltr">
                                <a
                                  href={`tel:${b.phone}`}
                                  className="text-teal-700 hover:underline font-mono"
                                >
                                  {b.phone}
                                </a>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 text-xs">
                                {b.service}
                              </td>
                              <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                                <div>{b.date}</div>
                                <div className="text-teal-700 font-semibold">{b.time}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                    b.status === "مؤكد"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : b.status === "مكتمل"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {b.status !== "مكتمل" && (
                                    <button
                                      onClick={() => updateBookingStatus(b.id, "مكتمل")}
                                      title="تحديد كمكتمل"
                                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                                    >
                                      ✓ تم
                                    </button>
                                  )}
                                  {b.status !== "ملغي" && (
                                    <button
                                      onClick={() => updateBookingStatus(b.id, "ملغي")}
                                      title="إلغاء الموعد"
                                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs"
                                    >
                                      إلغاء
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteBooking(b.id)}
                                    title="حذف نهائي"
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 mt-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-lg">Dental Clinic</h4>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              عيادة متخصصة في زراعة وتجميل الأسنان بإشراف د. عمر بهاء الدين. هدفنا تقديم رعاية طبية متقدمة تمنحك الثقة والراحة.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-sm text-teal-300 mb-3">بيانات التواصل والموقع</h5>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>٢٦١ ه‍ شارع الضغط</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span dir="ltr">01286661471</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>السبت - الخميس (4:00 عصراً - 10:00 مساءً)</span>
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm text-teal-300 mb-3">روابط سريعة</h5>
            <div className="flex flex-col gap-2 text-xs text-slate-300">
              <button
                onClick={() => {
                  setActiveTab("booking");
                  setConfirmedBooking(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-right hover:text-white"
              >
                • حجز موعد جديد
              </button>
              <button
                onClick={() => {
                  setActiveTab("doctor");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-right hover:text-white"
              >
                • تسجيل دخول الطبيب
              </button>
              <a
                href="https://wa.me/201286661471"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                • التواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © 2026 عيادة Dental Clinic - د. عمر بهاء الدين
        </div>
      </footer>
    </div>
  );
}
