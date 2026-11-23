import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Bell,
  Trash2,
  Search,
  FileText,
  Plus,
  Stethoscope,
  ScanLine,
  Activity,
  Layers,
  Brush,
  Sun,
  Crosshair,
  ArrowUpRight,
  CalendarPlus,
  RefreshCw,
} from "lucide-react";

import heroImage from "@/assets/dental-clinic-room.webp";
import { ClinicHeader } from "@/components/ClinicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClinicLocale } from "@/hooks/use-clinic-locale";
import {
  clinicDetails,
  copy,
  defaultServices,
  type ClinicService,
  type Locale,
} from "@/lib/clinic-content";
import {
  addClinicOffDay,
  createClinicBooking,
  deleteClinicAppointment,
  deleteClinicOffDay,
  deleteClinicService,
  getAvailableSlots,
  getDoctorAccess,
  getDoctorDashboard,
  getDoctorPushKey,
  getPublicClinic,
  lockDoctorPanel,
  saveClinicService,
  saveClinicSettings,
  saveDoctorPushSubscription,
  searchPatientHistory,
  unlockDoctorPanel,
  updateClinicAppointment,
} from "@/lib/clinic.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dental Clinic - د. عمر بهاء الدين | استشاري زراعة الأسنان" },
      {
        name: "description",
        content:
          "عيادة د. عمر بهاء الدين لزراعة وتجميل الأسنان - ٢٦١ ه‍ شارع الضغط - حجز مواعيد ورعاية طبية متكاملة.",
      },
      { property: "og:title", content: "Dental Clinic - د. عمر بهاء الدين" },
      {
        property: "og:description",
        content: "احجز كشفك الآن بعيادة د. عمر بهاء الدين لزراعة وتجميل الأسنان.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function getServiceIcon(icon: string) {
  switch (icon) {
    case "scan-line":
      return <ScanLine className="size-6 text-teal-600" />;
    case "activity":
      return <Activity className="size-6 text-teal-600" />;
    case "layers-3":
    case "layers":
      return <Layers className="size-6 text-teal-600" />;
    case "brush":
      return <Brush className="size-6 text-teal-600" />;
    case "sun":
      return <Sun className="size-6 text-teal-600" />;
    case "crosshair":
      return <Crosshair className="size-6 text-teal-600" />;
    case "sparkles":
      return <Sparkles className="size-6 text-teal-600" />;
    default:
      return <Stethoscope className="size-6 text-teal-600" />;
  }
}

function HomePage() {
  const { locale, toggleLocale } = useClinicLocale();
  const text = copy[locale];

  // Clinic public data
  const [services, setServices] = useState<ClinicService[]>(defaultServices);
  const [clinicPhone, setClinicPhone] = useState(clinicDetails.phone);
  const [clinicAddress, setClinicAddress] = useState(clinicDetails.address[locale]);

  // Booking Form State
  const [selectedService, setSelectedService] = useState(defaultServices[0]?.id || "consultation");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; booked: number; available: boolean }[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
    serviceName: string;
  } | null>(null);
  const [bookingError, setBookingError] = useState("");

  // Doctor Admin Panel State
  const [showDoctorPanel, setShowDoctorPanel] = useState(false);
  const [doctorPassword, setDoctorPassword] = useState("");
  const [isDoctorUnlocked, setIsDoctorUnlocked] = useState(false);
  const [doctorAuthLoading, setDoctorAuthLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [historySearchPhone, setHistorySearchPhone] = useState("");
  const [patientHistoryResults, setPatientHistoryResults] = useState<any[] | null>(null);
  const [isSearchingHistory, setIsSearchingHistory] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState("");

  // Load public clinic details
  useEffect(() => {
    getPublicClinic()
      .then((res: any) => {
        if (res?.services && res.services.length > 0) {
          setServices(res.services);
        }
        if (res?.settings) {
          if (res.settings.phone) setClinicPhone(res.settings.phone);
          if (locale === "ar" && res.settings.address_ar) setClinicAddress(res.settings.address_ar);
          if (locale === "en" && res.settings.address_en) setClinicAddress(res.settings.address_en);
        }
      })
      .catch(() => {});
  }, [locale]);

  // Check doctor access
  useEffect(() => {
    getDoctorAccess()
      .then((res: any) => {
        if (res?.unlocked) {
          setIsDoctorUnlocked(true);
          loadDoctorDashboardData();
        }
      })
      .catch(() => {});
  }, []);

  const loadDoctorDashboardData = async () => {
    try {
      const data = await getDoctorDashboard();
      setDashboardData(data);
    } catch (e) {}
  };

  // Min bookable date = today
  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }
    setBookingError("");
    setSelectedTime("");
    getAvailableSlots({ data: { date: selectedDate } })
      .then((res: any) => {
        if (res?.closed) {
          setBookingError(res.reason || text.noSlots);
          setAvailableSlots([]);
        } else if (res?.slots) {
          setAvailableSlots(res.slots);
        }
      })
      .catch(() => {
        setBookingError(text.noSlots);
        setAvailableSlots([]);
      });
  }, [selectedDate, text.noSlots]);

  // Handle Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (!selectedDate || !selectedTime || !patientName.trim() || !patientPhone.trim()) {
      setBookingError(locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة واختيار الموعد." : "Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result: any = await createClinicBooking({
        data: {
          patientName: patientName.trim(),
          phone: patientPhone.trim(),
          serviceId: selectedService,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes: patientNotes.trim() || undefined,
        },
      });

      const chosenService = services.find((s) => s.id === selectedService);
      setBookingSuccess({
        id: result.id,
        patientName: patientName.trim(),
        date: selectedDate,
        time: selectedTime,
        serviceName: chosenService?.title[locale] || selectedService,
      });
    } catch (err: any) {
      setBookingError(err.message || (locale === "ar" ? "تعذر إتمام الحجز، قد يكون الموعد قد اكتمل." : "Booking failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add to Calendar (.ics format download)
  const downloadCalendarFile = () => {
    if (!bookingSuccess) return;
    const [hours, minutes] = bookingSuccess.time.split(":");
    const startDate = new Date(`${bookingSuccess.date}T${bookingSuccess.time}:00`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dental Clinic Omar Bahaa//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${bookingSuccess.id}@dentalclinic.com
DTSTAMP:${formatCalDate(new Date())}
DTSTART:${formatCalDate(startDate)}
DTEND:${formatCalDate(endDate)}
SUMMARY:كشف أسنان - د. عمر بهاء الدين
DESCRIPTION:موعد كشف للمريض ${bookingSuccess.patientName} - خدمة: ${bookingSuccess.serviceName}
LOCATION:٢٦١ ه‍ شارع الضغط
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `appointment-${bookingSuccess.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Doctor Auth
  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorAuthLoading(true);
    try {
      await unlockDoctorPanel({ data: { password: doctorPassword } });
      setIsDoctorUnlocked(true);
      setDoctorPassword("");
      await loadDoctorDashboardData();
    } catch (err: any) {
      alert(locale === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password");
    } finally {
      setDoctorAuthLoading(false);
    }
  };

  const handleDoctorLogout = async () => {
    await lockDoctorPanel();
    setIsDoctorUnlocked(false);
    setDashboardData(null);
  };

  // Patient Medical History Search
  const handleSearchPatientHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historySearchPhone.trim()) return;
    setIsSearchingHistory(true);
    try {
      const results: any = await searchPatientHistory({ data: { phone: historySearchPhone.trim() } });
      setPatientHistoryResults(results);
    } catch (err) {
      setPatientHistoryResults([]);
    } finally {
      setIsSearchingHistory(false);
    }
  };

  // Subscribe to Doctor Web Push Notifications
  const handleEnablePushNotifications = async () => {
    setPushStatusMessage(locale === "ar" ? "جاري تفعيل الإشعارات..." : "Enabling push...");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushStatusMessage(locale === "ar" ? "المتصفح لا يدعم إشعارات الويب." : "Browser does not support Web Push.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatusMessage(locale === "ar" ? "تم رفض إذن الإشعارات من المتصفح." : "Push permission denied.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const keyData: any = await getDoctorPushKey();
      if (!keyData?.publicKey) {
        setPushStatusMessage("VAPID Key not found");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyData.publicKey,
      });

      await saveDoctorPushSubscription({
        data: {
          subscription: subscription.toJSON(),
          deviceLabel: navigator.userAgent.slice(0, 50),
        },
      });

      setPushStatusMessage(locale === "ar" ? "✅ تم تفعيل إشعارات الحجز بنجاح على هذا الهاتف!" : "✅ Push enabled successfully!");
      loadDoctorDashboardData();
    } catch (err: any) {
      setPushStatusMessage(`⚠️ ${err.message || "Error enabling push"}`);
    }
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <ClinicHeader locale={locale} onToggleLanguage={toggleLocale} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-teal-950 text-white py-16 sm:py-24">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <img src={heroImage} alt="Dental Clinic" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 px-3.5 py-1 text-xs sm:text-sm font-semibold rounded-full">
              <Sparkles className="size-4 ml-1.5" />
              {clinicDetails.credential[locale]}
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {clinicDetails.name} <br />
              <span className="text-teal-300">{clinicDetails.doctor[locale]}</span>
            </h1>

            <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {text.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2 text-xs sm:text-sm text-teal-200">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin className="size-4 text-teal-300" />
                <span>{clinicAddress}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="size-4 text-teal-300" />
                <span>{clinicDetails.hours[locale]}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm sm:text-base"
              >
                <span>{text.book}</span>
                <ArrowUpRight className="size-5" />
              </a>
              <a
                href={`tel:${clinicPhone}`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
              >
                <Phone className="size-4 text-teal-300" />
                <span dir="ltr">{clinicPhone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-4/3">
              <img src={heroImage} alt="Dental Clinic Room" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (NO prices) */}
      <section id="services" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="outline" className="text-teal-700 border-teal-300 bg-teal-50 px-3 py-1">
            {text.services}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {locale === "ar" ? "خدمات طبية تخصصية متكاملة" : "Specialized Dental Services"}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            {locale === "ar"
              ? "نقدم أعلى مستويات الرعاية السنية بأحدث التقنيات لضمان راحة وسلامة أسنانكم."
              : "Comprehensive dental care with state-of-the-art technology for your comfort."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="size-12 rounded-xl bg-teal-50 flex items-center justify-center">
                {getServiceIcon(svc.icon)}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base">{svc.title[locale]}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{svc.description[locale]}</p>
              </div>
              <a
                href="#booking"
                onClick={() => setSelectedService(svc.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 pt-2"
              >
                <span>{text.book}</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Booking Section */}
      <section id="booking" className="py-16 sm:py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-8">
            <Badge className="bg-teal-600 text-white px-3 py-1">{text.bookingTitle}</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {locale === "ar" ? "احجز كشفك الطبي بسهولة" : "Book Your Appointment"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">{text.bookingIntro}</p>
          </div>

          {bookingSuccess ? (
            <div className="bg-white rounded-3xl p-8 border border-teal-200 shadow-xl text-center space-y-6">
              <div className="size-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">{text.appointmentConfirmed}</h3>
                <p className="text-slate-600 text-sm">{text.confirmation}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-md mx-auto text-sm space-y-2 text-right">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{text.name}:</span>
                  <span className="font-bold text-slate-800">{bookingSuccess.patientName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{text.service}:</span>
                  <span className="font-bold text-teal-700">{bookingSuccess.serviceName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{text.date}:</span>
                  <span className="font-bold text-slate-800">{bookingSuccess.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{text.time}:</span>
                  <span className="font-bold text-slate-800">{bookingSuccess.time}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button
                  onClick={downloadCalendarFile}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold flex-1"
                >
                  <CalendarPlus className="size-4 ml-1.5" />
                  <span>{text.calendar}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBookingSuccess(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setPatientName("");
                    setPatientPhone("");
                    setPatientNotes("");
                  }}
                  className="flex-1"
                >
                  {locale === "ar" ? "حجز موعد آخر" : "Book Another"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              {bookingError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="size-5 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Step 1: Select Service */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">{text.service}</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.title[locale]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">{text.date}</label>
                <Input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 py-6 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-500">{clinicDetails.days[locale]}</p>
              </div>

              {/* Step 3: Select Available Time Slot */}
              {selectedDate && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">{text.time}</label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            type="button"
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-3 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                              !slot.available
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-teal-700 border-teal-700 text-white shadow-md ring-2 ring-teal-400"
                                : "bg-white border-slate-200 hover:border-teal-500 text-slate-800"
                            }`}
                          >
                            <span className="text-sm">{slot.time}</span>
                            <span className="text-[10px] opacity-80">
                              {slot.available
                                ? locale === "ar"
                                  ? `متاح (${2 - slot.booked} أماكن)`
                                  : `Available (${2 - slot.booked})`
                                : locale === "ar"
                                ? "مكتمل"
                                : "Fully booked"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      {bookingError || text.noSlots}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Patient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{text.name}</label>
                  <Input
                    placeholder={locale === "ar" ? "أدخل اسمك ثلاثي" : "Full Name"}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{text.mobile}</label>
                  <Input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Step 5: Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{text.notes}</label>
                <Textarea
                  placeholder={text.notePlaceholder}
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 text-sm sm:text-base rounded-xl shadow-md"
              >
                {isSubmitting ? (
                  <RefreshCw className="size-4 animate-spin ml-2" />
                ) : (
                  <CheckCircle2 className="size-4 ml-2" />
                )}
                <span>{text.submit}</span>
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section id="contact" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="bg-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div className="space-y-3">
            <div className="size-12 rounded-2xl bg-teal-800 flex items-center justify-center mx-auto md:mx-0">
              <MapPin className="size-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-lg text-white">{text.address}</h3>
            <p className="text-teal-100 text-sm leading-relaxed">{clinicAddress}</p>
          </div>

          <div className="space-y-3">
            <div className="size-12 rounded-2xl bg-teal-800 flex items-center justify-center mx-auto md:mx-0">
              <Clock className="size-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-lg text-white">{text.hours}</h3>
            <p className="text-teal-100 text-sm leading-relaxed">{clinicDetails.hours[locale]}</p>
            <p className="text-xs text-amber-300 font-semibold">{clinicDetails.days[locale]}</p>
          </div>

          <div className="space-y-3">
            <div className="size-12 rounded-2xl bg-teal-800 flex items-center justify-center mx-auto md:mx-0">
              <Phone className="size-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-lg text-white">{text.phone}</h3>
            <p className="text-teal-100 text-sm" dir="ltr">
              <a href={`tel:${clinicPhone}`} className="hover:underline font-bold text-lg text-teal-200">
                {clinicPhone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Doctor Control Panel (Protected with password) */}
      <section className="py-12 bg-slate-200 border-t border-slate-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-slate-700" />
              <h3 className="font-extrabold text-slate-800 text-lg">
                {locale === "ar" ? "لوحة تحكم الطبيب (الإدارة)" : "Doctor Admin Portal"}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDoctorPanel(!showDoctorPanel)}
              className="border-slate-400 bg-white"
            >
              {showDoctorPanel
                ? locale === "ar"
                  ? "إخفاء اللوحة"
                  : "Hide Panel"
                : locale === "ar"
                ? "فتح لوحة الإدارة"
                : "Open Admin"}
            </Button>
          </div>

          {showDoctorPanel && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-xl space-y-8">
              {!isDoctorUnlocked ? (
                /* Password Login Form */
                <form onSubmit={handleDoctorLogin} className="max-w-md mx-auto space-y-4 text-center">
                  <div className="size-12 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="size-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    {locale === "ar" ? "تسجيل دخول الطبيب" : "Doctor Authentication"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {locale === "ar"
                      ? "أدخل كلمة المرور المخصصة للوصول إلى الحجوزات والسجلات الطبية."
                      : "Enter doctor password to view records and manage clinic."}
                  </p>
                  <Input
                    type="password"
                    placeholder="كلمة المرور"
                    value={doctorPassword}
                    onChange={(e) => setDoctorPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={doctorAuthLoading}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold"
                  >
                    {doctorAuthLoading ? <RefreshCw className="size-4 animate-spin" /> : <Unlock className="size-4 ml-1.5" />}
                    <span>{locale === "ar" ? "دخول" : "Unlock"}</span>
                  </Button>
                </form>
              ) : (
                /* Unlocked Doctor Dashboard */
                <div className="space-y-8">
                  {/* Dashboard Top bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xl">
                        {locale === "ar" ? "أهلاً بك يا دكتور" : "Welcome Doctor"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {locale === "ar" ? "لوحة الإدارة والتحكم في الحجوزات والسجلات" : "Clinic Management Dashboard"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleEnablePushNotifications}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                      >
                        <Bell className="size-4 ml-1" />
                        <span>تفعيل إشعارات الحجز على هذا الهاتف 🔔</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDoctorLogout} className="text-xs">
                        خروج
                      </Button>
                    </div>
                  </div>

                  {pushStatusMessage && (
                    <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl">
                      {pushStatusMessage}
                    </div>
                  )}

                  {/* Patient History Search */}
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Search className="size-4 text-teal-600" />
                      <span>السجل الطبي وتاريخ الزيارات السابقة للمريض</span>
                    </h5>
                    <form onSubmit={handleSearchPatientHistory} className="flex gap-2">
                      <Input
                        placeholder="ابحث برقم موبايل المريض..."
                        value={historySearchPhone}
                        onChange={(e) => setHistorySearchPhone(e.target.value)}
                        className="bg-white"
                        dir="ltr"
                      />
                      <Button type="submit" disabled={isSearchingHistory} className="bg-teal-700 text-white shrink-0">
                        {isSearchingHistory ? <RefreshCw className="size-4 animate-spin" /> : "بحث"}
                      </Button>
                    </form>

                    {patientHistoryResults && (
                      <div className="space-y-2 pt-2">
                        {patientHistoryResults.length === 0 ? (
                          <p className="text-xs text-slate-500">لا توجد زيارات سابقة مسجلة لهذا الرقم.</p>
                        ) : (
                          <div className="space-y-3">
                            {patientHistoryResults.map((rec: any) => (
                              <div key={rec.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                                <div className="flex justify-between font-bold text-slate-800">
                                  <span>{rec.patient_name} ({rec.phone})</span>
                                  <Badge variant="outline">{rec.status}</Badge>
                                </div>
                                <p className="text-slate-500">
                                  التاريخ: {rec.appointment_date} · الساعة: {rec.appointment_time}
                                </p>
                                {rec.medical_notes && (
                                  <p className="text-teal-900 bg-teal-50 p-2 rounded">
                                    <strong>ملاحظات الطبيب:</strong> {rec.medical_notes}
                                  </p>
                                )}
                                {rec.treatment_plan && (
                                  <p className="text-slate-800 bg-slate-100 p-2 rounded">
                                    <strong>خطة العلاج:</strong> {rec.treatment_plan}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Appointments Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 text-base">جدول الحجوزات والمواعيد</h5>
                      <Button size="sm" variant="ghost" onClick={loadDoctorDashboardData} className="text-xs gap-1">
                        <RefreshCw className="size-3.5" />
                        <span>تحديث القائمة</span>
                      </Button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                          <tr>
                            <th className="p-3">المريض</th>
                            <th className="p-3">رقم الهاتف</th>
                            <th className="p-3">التاريخ والوقت</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dashboardData?.appointments && dashboardData.appointments.length > 0 ? (
                            dashboardData.appointments.map((apt: any) => (
                              <tr key={apt.id} className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">{apt.patient_name}</td>
                                <td className="p-3 text-slate-600" dir="ltr">{apt.phone}</td>
                                <td className="p-3 text-slate-700 font-medium">
                                  {apt.appointment_date} · {apt.appointment_time}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={apt.status}
                                    onChange={async (e) => {
                                      await updateClinicAppointment({
                                        data: { id: apt.id, status: e.target.value as any },
                                      });
                                      loadDoctorDashboardData();
                                    }}
                                    className="bg-white border rounded px-2 py-1 text-xs"
                                  >
                                    <option value="confirmed">مؤكد</option>
                                    <option value="completed">تم الكشف</option>
                                    <option value="cancelled">ملغي</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={async () => {
                                      if (confirm("هل تريد حذف هذا الحجز نهائياً؟")) {
                                        await deleteClinicAppointment({ data: { id: apt.id } });
                                        loadDoctorDashboardData();
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1 rounded"
                                    title="حذف"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-500">
                                لا توجد حجوزات مسجلة حالياً.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-white text-sm">
            {clinicDetails.name} - {clinicDetails.doctor[locale]}
          </p>
          <p>{clinicAddress} · هاتف: {clinicPhone}</p>
          <p className="text-slate-500 pt-2">© 2026 Dental Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
