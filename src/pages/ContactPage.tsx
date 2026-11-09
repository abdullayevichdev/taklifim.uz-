import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2, Instagram } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useAuth();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) {
      showToast('Iltimos, barcha majburiy maydonlarni to‘ldiring', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitContactMessage({
        name: name.trim(),
        contact: contact.trim(),
        subject: subject.trim() || 'Umumiy murojaat',
        message: message.trim(),
      });
      setSubmitted(true);
      showToast('Xabaringiz muvaffaqiyatli jo‘natildi!', 'success');
    } catch {
      showToast('Xatolik yuz berdi, iltimos qayta urinib ko‘ring', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D9658B]">
            Aloqa
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#231E1B]">
            Biz bilan bog‘laning
          </h1>
          <p className="text-sm text-[#5C4F48]">
            Savollaringiz, takliflaringiz yoki maxsus dizayn buyurtmalaringiz bo‘yicha istalgan vaqtda yordam berishga tayyormiz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/95 space-y-5">
              <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                Murojaat ma’lumotlari
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5EBDD] flex items-center justify-center text-[#B48B47] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Telefon</span>
                    <a
                      href="tel:+998933223580"
                      className="font-bold text-[#231E1B] hover:text-[#D9658B] transition-colors mt-0.5 block"
                    >
                      +998 93 322 35 80
                    </a>
                    <p className="text-[#7A6A63]">Har kuni: 09:00 - 21:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5C9D8]/50 flex items-center justify-center text-[#D9658B] shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Telegram</span>
                    <a
                      href="https://t.me/taklifim_support"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#231E1B] hover:text-[#D9658B] transition-colors mt-0.5 block"
                    >
                      @taklifim_support
                    </a>
                    <p className="text-[#7A6A63]">Tezkor javob berish xizmati</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#B9DFFA]/60 flex items-center justify-center text-[#1E3A5F] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Elektron pochta</span>
                    <a
                      href="mailto:info@taklifim.uz"
                      className="font-bold text-[#231E1B] hover:text-[#D9658B] transition-colors mt-0.5 block"
                    >
                      info@taklifim.uz
                    </a>
                    <p className="text-[#7A6A63]">Rasmiy hamkorlik va takliflar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5EBDD] flex items-center justify-center text-[#B48B47] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Bosh ofis</span>
                    <p className="font-bold text-[#231E1B] mt-0.5">
                      Toshkent shahri, Shayxontohur tumani, Navoiy ko‘chasi, 42
                    </p>
                    <p className="text-[#7A6A63]">O‘zbekiston</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social channels card */}
            <div className="glass-panel rounded-3xl p-5 border border-white/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#231E1B]">Ijtimoiy tarmoqlarimiz</h4>
                <p className="text-[11px] text-[#7A6A63]">Yangi shablon va aksiyalardan xabardor bo‘ling</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#231E1B] hover:text-[#D9658B] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#231E1B] hover:text-[#1E3A5F] transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-md">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-[#231E1B]">
                    Rahmat, xabaringiz qabul qilindi!
                  </h3>
                  <p className="text-xs text-[#7A6A63] max-w-md mx-auto">
                    Menejerlarimiz tez orada siz bilan bog‘lanishadi va barcha savollaringizga batafsil javob berishadi.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setContact('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#231E1B] text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Yangi xabar yuborish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="font-playfair text-xl font-bold text-[#231E1B] mb-2">
                    Bizga xabar qoldiring
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C4F48] mb-1">
                        Ismingiz *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jasur Alimov"
                        className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5 focus:border-[#D9658B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5C4F48] mb-1">
                        Telefon raqam yoki Telegram *
                      </label>
                      <input
                        type="text"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="+998 90 123 45 67 yoki @username"
                        className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5 focus:border-[#D9658B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] mb-1">
                      Mavzu
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Masalan: Maxsus dizayn taklifnomasi yoki Hamkorlik"
                      className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5 focus:border-[#D9658B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] mb-1">
                      Xabaringiz matni *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Savolingiz yoki loyihangiz haqida batafsil yozing..."
                      className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5 focus:border-[#D9658B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#231E1B] text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Yuborilmoqda...' : 'Xabarni yuborish'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
