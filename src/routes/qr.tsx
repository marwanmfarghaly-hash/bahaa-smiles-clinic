import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, QrCode, Download, Share2, Smartphone, Sparkles, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/qr")({
  component: QrPage,
});

function QrPage() {
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin);
    }
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    siteUrl || "https://dental-clinic.lovable.app"
  )}&margin=10&color=0f766e`;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-teal-700 font-bold hover:text-teal-800 transition-colors text-sm"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span className="font-bold text-slate-900 text-sm">Dental Clinic</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 py-8 text-center space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
            <QrCode className="w-4 h-4" />
            <span>رمز الاستجابة السريع للعيادة</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            امسح الكود لفتح وتثبيت التطبيق
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            وجه كاميرا هاتفك نحو الرمز للدخول مباشرة إلى عيادة د. عمر بهاء الدين وحجز موعدك فوراً.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="QR Code لعيادة د. عمر بهاء الدين"
              className="w-64 h-64 rounded-xl shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">د. عمر بهاء الدين</p>
            <p className="flex items-center justify-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>٢٦١ ه‍ شارع الضغط</span>
            </p>
            <p className="flex items-center justify-center gap-1 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span dir="ltr">01286661471</span>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <a
              href={qrImageUrl}
              download="dental-clinic-qr.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الرمز</span>
            </a>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Dental Clinic - د. عمر بهاء الدين",
                    url: siteUrl,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(siteUrl);
                  alert("تم نسخ رابط العيادة بنجاح!");
                }
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة الرابط</span>
            </button>
          </div>
        </div>

        <div className="bg-teal-900 text-white p-5 rounded-2xl text-right text-xs space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-teal-200">
            <Smartphone className="w-4 h-4" />
            <span>كيفية التثبيت بعد المسح:</span>
          </p>
          <p className="text-slate-300 leading-relaxed">
            1. بعد فتح الرابط في المتصفح، اضغط على زر <strong>"تثبيت التطبيق"</strong> أو خيارات المتصفح.
          </p>
          <p className="text-slate-300 leading-relaxed">
            2. على آيفون: اضغط زر المشاركة (Share) ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200 bg-white">
        Dental Clinic - د. عمر بهاء الدين © 2026
      </footer>
    </div>
  );
}
