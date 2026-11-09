import React, { useState } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { PhoneInput } from '../components/PhoneInput';
import {
  Video,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  Clock,
  Film,
  Music,
  Send,
  ArrowRight,
  Phone,
  User,
  Calendar,
} from 'lucide-react';

export const PremiumVideoPage: React.FC = () => {
  const { showToast } = useAuth();
  const { navigate } = useRouter();

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [eventType, setEventType] = useState('To‘y va Nikoh Oqshomi');
  const [names, setNames] = useState('');
  const [eventDate, setEventDate] = useState('2026-09-18');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [musicPref, setMusicPref] = useState('Romantic Violin Vals');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [telegram, setTelegram] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!names || !customerName || !phone) {
      showToast('Iltimos, barcha majburiy maydonlarni to‘ldiring', 'error');
      return;
    }
    if (!isPhoneValid) {
      showToast('Iltimos, telefon raqamingizni to‘liq kiriting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createOrder({
        serviceType: 'video_invitation',
        serviceName: `Video Taklifnoma (${names})`,
        planName: 'Individual Premium Video',
        customerName,
        customerPhone: phone,
        price: 450000,
        notes: `Uslub: ${videoStyle}, Kuy: ${musicPref}, Telegram: ${telegram}. Izoh: ${notes}`,
      });

      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 110,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B9DFFA', '#F5C9D8', '#231E1B'],
        });
      } catch {
        // ignore
      }
      showToast('Video buyurtmangiz muvaffaqiyatli qabul qilindi!', 'success');
    } catch {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-bold text-[#1E3A5F]">
            <Video className="w-3.5 h-3.5" />
            <span>Eksklyuziv Xizmat</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#231E1B] tracking-tight">
            Mualliflik Video Taklifnomalari
          </h1>
          <p className="text-sm text-[#5C4F48] leading-relaxed">
            Sizning sevgi tarixingiz, unutilmas fotosuratlaringiz va tantanali sanalaringiz bilan 4K formatda tayyorlangan video rolik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Video Showcase and Features */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video border border-white/20 group">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Video poster"
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  isVideoPlaying ? 'opacity-85 scale-105' : 'opacity-70'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full glass-panel-elevated flex items-center justify-center text-[#231E1B] hover:scale-110 active:scale-95 transition-all shadow-xl"
                aria-label="Namoyish"
              >
                {isVideoPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl px-4 py-2 flex items-center justify-between text-xs text-white">
                <span className="font-bold text-[11px] text-[#231E1B]">
                  {isVideoPlaying ? '4K Video namoyishi (Demo)' : 'Namuna rolikni tomosha qiling'}
                </span>
                <span className="text-[10px] text-[#7A6A63]">0:48 / 1:30</span>
              </div>
            </div>

            {/* Perks */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/95 space-y-4">
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                Video taklifnomaga nimalar kiradi?
              </h3>
              <ul className="space-y-2.5 text-xs text-[#4A3E39]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full HD yoki 4K formatda tayyorlash (9:16 yoki 16:9)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>8-15 tagacha fotosuratlaringizdan iborat estetik montaj</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Siz tanlagan fon musiqasi va kelin-kuyov nomlari</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Telegram va Instagram orqali jo‘natishga qulay fayl hajmi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tayyor bo‘lish muddati: 24 - 48 soat</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Video Custom Order Form */}
          <div className="lg:col-span-6 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-[#231E1B]">
                  Buyurtmangiz qabul qilindi!
                </h3>
                <p className="text-xs text-[#5C4F48] leading-relaxed max-w-sm mx-auto">
                  Menejerimiz qisqa vaqt ichida fotosuratlarni qabul qilib olish va video uslubini kelishish uchun Telegram yoki telefon orqali bog‘lanadi.
                </p>
                <div className="pt-3">
                  <Link
                    to="/dashboard/orders"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#231E1B] text-white text-xs font-bold hover:bg-black transition-colors"
                  >
                    <span>Mijoz kabinetida ko‘rish</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-playfair text-xl font-bold text-[#231E1B] pb-2 border-b border-black/5">
                  Video Taklifnoma Buyurtma Formasi
                </h2>

                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">
                    Tadbir turi
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                  >
                    <option value="To‘y va Nikoh Oqshomi">To‘y va Nikoh Oqshomi</option>
                    <option value="Fotixa to‘yi / Unashtiruv">Fotixa to‘yi / Unashtiruv</option>
                    <option value="Yubiley / Tug‘ilgan kun">Yubiley / Tug‘ilgan kun</option>
                    <option value="Beshik to‘y">Beshik to‘y</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Kelin-kuyov / Mezbon ismlari *
                    </label>
                    <input
                      type="text"
                      required
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      placeholder="Jasur & Shahlo"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Tadbir sanasi *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>
                </div>

                {/* Video Style Choice */}
                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1.5">
                    Video uslubi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cinematic', label: 'Cinematic Story (Kinematik)' },
                      { id: 'classic_gold', label: 'Royal Golden (Zarhal dabdaba)' },
                      { id: 'minimalist', label: 'Modern Minimalist (Nafis)' },
                      { id: 'traditional', label: 'Sharqona Baxmal (Milliy)' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setVideoStyle(style.id)}
                        className={`p-2.5 rounded-xl text-left border font-medium text-xs transition-all ${
                          videoStyle === style.id
                            ? 'border-[#3B6B88] bg-[#B9DFFA]/30 text-[#1E3A5F] font-bold shadow-xs'
                            : 'border-black/10 bg-white/70 text-[#5C4F48]'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Music preference */}
                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">
                    Musiqa tanlovi
                  </label>
                  <input
                    type="text"
                    value={musicPref}
                    onChange={(e) => setMusicPref(e.target.value)}
                    placeholder="Masalan: Sevimli to‘y kuyingiz yoki pop vals"
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                  />
                </div>

                {/* Contact info */}
                <div className="pt-2 border-t border-black/5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#3A2D28] block mb-1">
                        Sizning ismingiz *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Jasur To‘xtayev"
                        className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#3A2D28] block mb-1">
                        Telefon raqamingiz *
                      </label>
                      <PhoneInput
                        value={phone}
                        onChange={(fullVal, valid) => {
                          setPhone(fullVal);
                          setIsPhoneValid(valid);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Telegram username (fotosuratlarni olish uchun)
                    </label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@foydalanuvchi_nomi"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Qo‘shimcha istaklar va matn
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Videoda bo‘lishini xohlagan maxsus yozuvlar..."
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#7A6A63]">Xizmat narxi:</div>
                    <div className="text-lg font-extrabold text-[#231E1B]">
                      450 000 so‘m
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 rounded-2xl text-xs font-bold text-white bg-[#231E1B] hover:bg-black transition-all shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Qabul qilinmoqda...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Buyurtma Berish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
