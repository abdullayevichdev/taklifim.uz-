import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { mockInvitations } from '../data/mockInvitations';
import { mockGuests } from '../data/mockGuests';
import { mockTemplates } from '../data/mockTemplates';
import { api } from '../services/api';
import { calculateCountdown, validateRSVPForm } from '../utils/logic';
import { ShareModal } from '../components/ShareModal';
import { MusicPlayer } from '../components/MusicPlayer';
import { InteractiveMap } from '../components/InteractiveMap';
import { CustomDropdown } from '../components/CustomDropdown';
import { PhoneInput } from '../components/PhoneInput';
import { TemplateThemeDecoration } from '../components/TemplateThemeDecoration';
import { Language, GuestRSVP, InvitationData } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Crown,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  Utensils,
  Music,
  ExternalLink,
  MailOpen,
  Globe,
  Instagram,
  Phone,
} from 'lucide-react';
import { TaklifimLogo } from '../components/TaklifimLogo';

// Haqiqiy va to'liq ko'p tilli tarjimalar (UZ / RU / EN)
const guestTranslations: Record<Language, {
  envelopeSubtitle: string;
  weddingCeremony: string;
  defaultQuote: string;
  openEnvelope: string;
  clickToOpen: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  countdownPassed: string;
  gallery: string;
  galleryTitle: string;
  schedule: string;
  scheduleSubtitle: string;
  venueTitle: string;
  openGoogleMaps: string;
  saveToCalendar: string;
  rsvpTitle: string;
  rsvpSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  phone: string;
  attendingQuestion: string;
  attendingYes: string;
  attendingNo: string;
  guestCount: string;
  mealPref: string;
  mealDefault: string;
  wishes: string;
  wishesPlaceholder: string;
  submitRSVP: string;
  rsvpSuccess: string;
  wishesWall: string;
  seeYou: string;
  withRespect: string;
  socialConnect: string;
  callPhone: string;
  createdOn: string;
  dearGuest: string;
  timeRemaining: string;
  timePrefix: string;
  from: string;
  to: string;
  defaultEvent: string;
  defaultMessage: string;
}> = {
  uz: {
    envelopeSubtitle: 'Baxtli lahzalar chorlovi',
    weddingCeremony: 'To‘y & Nikoh Marosimi',
    defaultQuote: '«Sizni muqaddas rishta — nikoh to‘yimiz munosabati bilan yoziladigan dasturxonimizga lutfan taklif etamiz.»',
    openEnvelope: 'Taklifnomani ochish',
    clickToOpen: 'Muborak to‘y taklifnomasini ochish uchun bosing',
    days: 'Kun',
    hours: 'Soat',
    minutes: 'Daqiqa',
    seconds: 'Soniya',
    countdownPassed: 'Tantana boshlandi!',
    gallery: 'Fotogalereya',
    galleryTitle: 'Bizning suratlarimiz',
    schedule: 'To‘y dasturi',
    scheduleSubtitle: 'Tantanali oqshom rejasi',
    venueTitle: 'Manzil va Xarita',
    openGoogleMaps: 'Google Maps‘da to‘liq ochish',
    saveToCalendar: 'Google Taqvimga saqlash',
    rsvpTitle: 'Tashrifingizni tasdiqlang (RSVP)',
    rsvpSubtitle: 'Biz uchun tashrifingiz katta quvonch. Iltimos, javobingizni bildiring.',
    fullName: 'Ism va familiyangiz',
    fullNamePlaceholder: 'To‘liq ismingizni kiriting',
    phone: 'Telefon raqamingiz',
    attendingQuestion: 'Tashrif buyura olasizmi?',
    attendingYes: 'Ha, albatta boraman',
    attendingNo: 'Uzr, bora olmayman',
    guestCount: 'Necha kishi tashrif buyurasiz?',
    mealPref: 'Taom afzalligingiz (ixtiyoriy)',
    mealDefault: 'Milliy taomlar / To‘y oshi',
    wishes: 'Kelin-kuyovga samimiy tilaklaringiz',
    wishesPlaceholder: 'Ezgu tilaklaringizni yozib qoldiring...',
    submitRSVP: 'Javobni yuborish',
    rsvpSuccess: 'Rahmat! Javobingiz muvaffaqiyatli qabul qilindi.',
    wishesWall: 'Mehmonlar tilaklari devori',
    seeYou: 'Sizni kutib qolamiz!',
    withRespect: 'Hurmat bilan, mezbonlar oilasi',
    socialConnect: 'Biz bilan bog‘lanish va to‘y yangiliklari',
    callPhone: 'Qo‘ng‘iroq qilish',
    createdOn: 'Taklifim platformasida yaratildi',
    dearGuest: 'Hurmatli Mehmonimiz!',
    timeRemaining: 'Tantanagacha qolgan vaqt',
    timePrefix: 'Soat',
    from: 'dan',
    to: 'gacha',
    defaultEvent: 'To‘y va Nikoh Oqshomi',
    defaultMessage: 'Sizni hayotimizdagi eng quvonchli va hayajonli kunimiz — Nikoh to‘yimiz munosabati bilan yoziladigan dasturxonimizga lutfan taklif etamiz. Sizning duolaringiz va samimiy tabassumlaringiz ushbu oqshomimizga o‘zgacha fayz bag‘ishlaydi.',
  },
  ru: {
    envelopeSubtitle: 'Приглашение на счастливое торжество',
    weddingCeremony: 'Свадебное Торжество',
    defaultQuote: '«Приглашаем вас разделить с нами радость создания новой семьи на нашем праздничном торжестве.»',
    openEnvelope: 'Открыть приглашение',
    clickToOpen: 'Нажмите, чтобы открыть свадебное приглашение',
    days: 'Дней',
    hours: 'Часов',
    minutes: 'Минут',
    seconds: 'Секунд',
    countdownPassed: 'Торжество началось!',
    gallery: 'Фотогалерея',
    galleryTitle: 'Наши фотографии',
    schedule: 'Программа вечера',
    scheduleSubtitle: 'Расписание торжества',
    venueTitle: 'Место проведения и Карта',
    openGoogleMaps: 'Открыть в Google Maps',
    saveToCalendar: 'Сохранить в Google Календарь',
    rsvpTitle: 'Подтвердите присутствие (RSVP)',
    rsvpSubtitle: 'Ваше присутствие для нас огромная радость. Пожалуйста, подтвердите ответ.',
    fullName: 'Ваше имя и фамилия',
    fullNamePlaceholder: 'Введите ваше полное имя',
    phone: 'Номер телефона',
    attendingQuestion: 'Сможете ли вы прийти?',
    attendingYes: 'Да, обязательно приду',
    attendingNo: 'К сожалению, не смогу',
    guestCount: 'Сколько человек будет с вами?',
    mealPref: 'Предпочтения по меню (необязательно)',
    mealDefault: 'Традиционные блюда / Плов',
    wishes: 'Ваши теплые пожелания',
    wishesPlaceholder: 'Напишите искренние пожелания молодоженам...',
    submitRSVP: 'Отправить ответ',
    rsvpSuccess: 'Спасибо! Ваш ответ успешно принят.',
    wishesWall: 'Стена пожеланий гостей',
    seeYou: 'С нетерпением ждем вас!',
    withRespect: 'С уважением, семья хозяев',
    socialConnect: 'Связаться с нами и новости свадьбы',
    callPhone: 'Позвонить',
    createdOn: 'Создано на платформе Taklifim',
    dearGuest: 'Дорогой наш Гость!',
    timeRemaining: 'До торжества осталось',
    timePrefix: 'Время:',
    from: 'с',
    to: 'до',
    defaultEvent: 'Свадебное Торжество',
    defaultMessage: 'Уважаемые родные и близкие! Мы искренне приглашаем вас разделить этот счастливый день нашего бракосочетания. Ваше присутствие и теплые пожелания станут для нас величайшей радостью.',
  },
  en: {
    envelopeSubtitle: 'An Invitation to Cherished Moments',
    weddingCeremony: 'Wedding & Marriage Ceremony',
    defaultQuote: '«We cordially invite you to celebrate the joyous union of our hearts and lives at our wedding feast.»',
    openEnvelope: 'Open Invitation',
    clickToOpen: 'Click to open the wedding invitation',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Mins',
    seconds: 'Secs',
    countdownPassed: 'The celebration has begun!',
    gallery: 'Photo Gallery',
    galleryTitle: 'Our Precious Moments',
    schedule: 'Event Schedule',
    scheduleSubtitle: 'Timeline of the evening',
    venueTitle: 'Venue & Location Map',
    openGoogleMaps: 'Open in Google Maps',
    saveToCalendar: 'Add to Google Calendar',
    rsvpTitle: 'Confirm Your Attendance (RSVP)',
    rsvpSubtitle: 'Your presence would bring us immense joy. Please let us know your response.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number',
    attendingQuestion: 'Will you be attending?',
    attendingYes: 'Yes, I will attend',
    attendingNo: 'Regretfully, I cannot attend',
    guestCount: 'Number of guests attending?',
    mealPref: 'Meal Preference (Optional)',
    mealDefault: 'Traditional wedding banquet',
    wishes: 'Your warm wishes for the couple',
    wishesPlaceholder: 'Leave a heartfelt message...',
    submitRSVP: 'Send RSVP Response',
    rsvpSuccess: 'Thank you! Your response has been received.',
    wishesWall: 'Guest Wishes Wall',
    seeYou: 'We look forward to seeing you!',
    withRespect: 'Warmly, the host family',
    socialConnect: 'Connect with Us & Wedding Updates',
    callPhone: 'Call',
    createdOn: 'Powered by Taklifim Platform',
    dearGuest: 'Dear Beloved Guest!',
    timeRemaining: 'Countdown to Celebration',
    timePrefix: 'Time:',
    from: 'from',
    to: 'to',
    defaultEvent: 'Wedding Celebration',
    defaultMessage: 'Dear family and friends! We joyfully invite you to celebrate our special wedding day with us. Your blessings and warm presence will make our celebration truly unforgettable.',
  },
};

// Dinamik kelin-kuyov monogrammasi (Masalan, Asrorbek va Madina => "A & M")
const getMonogram = (inv: InvitationData | null): string => {
  if (!inv) return 'T';
  if (inv.partner1Name && inv.partner2Name) {
    const p1 = inv.partner1Name.trim().charAt(0).toUpperCase();
    const p2 = inv.partner2Name.trim().charAt(0).toUpperCase();
    return `${p1} & ${p2}`;
  }
  const raw = inv.hostNames || '';
  const parts = raw.split(/&|va|and|\+/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const p1 = parts[0].charAt(0).toUpperCase();
    const p2 = parts[1].charAt(0).toUpperCase();
    return `${p1} & ${p2}`;
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].charAt(0).toUpperCase();
  }
  return 'A & M';
};

export const InvitationGuestPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { showToast } = useAuth();
  const slug = params.slug || 'nodir-malika-wedding';

  // Load invitation data from API / mock
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Independent invitation language setting
  const [invLang, setInvLang] = useState<Language>('uz');
  const gt = guestTranslations[invLang] || guestTranslations.uz;

  // Envelope cover opening state
  const [isCoverOpened, setIsCoverOpened] = useState<boolean>(false);
  const [isOpeningAnimation, setIsOpeningAnimation] = useState<boolean>(false);

  const handleOpenInvitation = () => {
    setIsOpeningAnimation(true);

    try {
      // 1-bosqich: Markaziy ulug'vor oltin va pushti portlash
      confetti({
        particleCount: 220,
        spread: 120,
        origin: { y: 0.5, x: 0.5 },
        colors: [primaryColor, secondaryColor, accentColor, '#FFD700', '#F5C9D8', '#B9DFFA', '#FFFFFF', '#D9658B'],
        ticks: 350,
        gravity: 0.75,
        scalar: 1.3,
      });

      // 2-bosqich: Chap tomondan romantik to'y salyuti
      setTimeout(() => {
        confetti({
          particleCount: 130,
          angle: 55,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: [primaryColor, '#FFD700', '#F5C9D8', '#FFFFFF', '#D9658B'],
          ticks: 300,
          gravity: 0.85,
          scalar: 1.2,
        });
      }, 180);

      // 3-bosqich: O'ng tomondan moviy va zarhal feyerverk
      setTimeout(() => {
        confetti({
          particleCount: 130,
          angle: 125,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: [secondaryColor, '#FFD700', '#B9DFFA', '#FFFFFF', '#4A9BD4'],
          ticks: 300,
          gravity: 0.85,
          scalar: 1.2,
        });
      }, 350);

      // 4-bosqich: Yuqoridan sekin tushuvchi zarhal yomg'ir
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0, x: 0.5 },
          colors: ['#FFD700', '#F5C9D8', '#FFFFFF', '#E27B9B'],
          ticks: 450,
          gravity: 0.6,
          scalar: 1.1,
        });
      }, 550);

      // 5-bosqich: Yakuniy tantanali to'lqin
      setTimeout(() => {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.6, x: 0.5 },
          colors: [primaryColor, secondaryColor, '#FFD700', '#FFFFFF', accentColor],
          ticks: 300,
          gravity: 0.7,
          scalar: 1.2,
        });
      }, 750);
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsCoverOpened(true);
      setIsOpeningAnimation(false);
    }, 900);
  };

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  // Photo gallery lightbox
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Share modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // RSVP Form state
  const [rsvpFullName, setRsvpFullName] = useState<string>('');
  const [rsvpPhone, setRsvpPhone] = useState<string>('');
  const [isRsvpPhoneValid, setIsRsvpPhoneValid] = useState<boolean>(false);
  const [rsvpAttending, setRsvpAttending] = useState<boolean>(true);
  const [rsvpGuestCount, setRsvpGuestCount] = useState<number>(1);
  const [rsvpMeal, setRsvpMeal] = useState<string>('Milliy taomlar / To‘y oshi');
  const [rsvpMessage, setRsvpMessage] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isRsvpSubmitted, setIsRsvpSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Guest wishes wall
  const [guestList, setGuestList] = useState<GuestRSVP[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let data = await api.getInvitationBySlug(slug);

      // Agar slug bo'yicha topilmasa, mockInvitations orasida qidirish
      if (!data) {
        const mockMatch = mockInvitations.find((m) => m.slug === slug || m.id === slug);
        if (mockMatch) {
          data = mockMatch;
        }
      }

      if (data) {
        setInvitation(data);
        setInvLang(data.language || 'uz');
      } else {
        // Agar umuman topilmasa, qoralamalardan yoki birinchi mavjud taklifnomadan tekshirish
        const allLocal = await api.getInvitations();
        const fallback = allLocal.find((i) => i.slug === slug) || allLocal[0] || mockInvitations[0];
        setInvitation(fallback);
        if (fallback) setInvLang(fallback.language || 'uz');
      }
      const guests = await api.getGuests(slug);
      setGuestList(guests);
      setLoading(false);

      // Increment view count in real time
      api.incrementViews(slug);
    }
    load();

    // Live subscription for real-time guest RSVP and wishes
    const unsubscribeGuests = api.subscribe<GuestRSVP[]>('guests', (allGuests) => {
      setGuestList(allGuests.filter((g) => g.invitationSlug === slug));
    });

    return () => {
      unsubscribeGuests();
    };
  }, [slug]);

  const handleAddToCalendar = () => {
    if (!invitation) return;
    const cleanDate = invitation.eventDate.replace(/-/g, '');
    const [sH, sM] = (invitation.startTime || '18:00').split(':');
    const [eH, eM] = (invitation.endTime || '23:00').split(':');
    const startIso = `${cleanDate}T${sH || '18'}${sM || '00'}00`;
    const endIso = `${cleanDate}T${eH || '23'}${eM || '00'}00`;
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      invitation.eventTitle
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
      invitation.invitationMessage
    )}&location=${encodeURIComponent(invitation.venueName + ', ' + invitation.venueAddress)}`;
    window.open(gcalUrl, '_blank');
    showToast('Google Taqvim havolasi ochildi!', 'success');
  };

  // Real-time Countdown timer
  useEffect(() => {
    if (!invitation?.eventDate) return;

    const timer = setInterval(() => {
      const result = calculateCountdown(invitation.eventDate, invitation.startTime);
      setCountdown(result);
    }, 1000);

    // Initial run
    setCountdown(calculateCountdown(invitation.eventDate, invitation.startTime));

    return () => clearInterval(timer);
  }, [invitation?.eventDate, invitation?.startTime]);

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activePhotoIndex === null || !invitation) return;
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev + 1) % invitation.galleryImages.length : 0
        );
      }
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) =>
          prev !== null
            ? (prev - 1 + invitation.galleryImages.length) %
              invitation.galleryImages.length
            : 0
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePhotoIndex, invitation]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRSVPForm({
      fullName: rsvpFullName,
      attending: rsvpAttending,
      guestCount: rsvpGuestCount,
      phone: rsvpPhone,
      isPhoneValid: isRsvpPhoneValid,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const newGuest = await api.submitRSVP({
        invitationId: invitation?.id || 'inv-1',
        invitationSlug: slug,
        invitationOwnerId: invitation?.ownerId, // Invitation egasini saqlash
        fullName: rsvpFullName.trim(),
        phone: rsvpPhone.trim(),
        attending: rsvpAttending,
        guestCount: rsvpAttending ? rsvpGuestCount : 0,
        mealPreference: rsvpMeal,
        message: rsvpMessage.trim(),
      });

      setGuestList((prev) => [newGuest, ...prev]);
      setIsRsvpSubmitted(true);

      // Celebration effect
      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F5C9D8', '#B9DFFA', '#B48B47'],
        });
      } catch {
        // ignore
      }

      showToast('Tashrifingiz muvaffaqiyatli qayd etildi! Rahmat!', 'success');
    } catch {
      showToast('Xatolik yuz berdi, iltimos qayta urinib ko‘ring', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#B48B47] animate-spin mx-auto" />
          <p className="font-playfair text-sm font-semibold text-[#231E1B]">
            Taklifnoma ochilmoqda...
          </p>
        </div>
      </div>
    );
  }

  // Resolve chosen template configuration
  const templateDef =
    mockTemplates.find(
      (t) => t.slug === invitation.templateSlug || t.id === invitation.templateId
    ) || mockTemplates[0];

  const isDarkTheme =
    templateDef.slug === 'template-19' ||
    templateDef.slug === 'template-10' ||
    templateDef.slug === 'template-18' ||
    templateDef.slug === 'template-3' ||
    templateDef.slug === 'template-5' ||
    (templateDef.colorStyle.background &&
      (templateDef.colorStyle.background.startsWith('#0') ||
        templateDef.colorStyle.background.startsWith('#1') ||
        templateDef.colorStyle.background.startsWith('#2')));

  const primaryColor =
    invitation.customColors?.primary && invitation.customColors?.primary !== '#B48B47'
      ? invitation.customColors.primary
      : templateDef.colorStyle.primary;

  const secondaryColor =
    invitation.customColors?.secondary && invitation.customColors?.secondary !== '#D9658B'
      ? invitation.customColors.secondary
      : templateDef.colorStyle.secondary;

  const accentColor =
    invitation.customColors?.accent && invitation.customColors?.accent !== '#C9A96E'
      ? invitation.customColors.accent
      : templateDef.colorStyle.accent;

  const bgColor =
    invitation.customColors?.background &&
    invitation.customColors?.background !== '#FAF6F0' &&
    invitation.customColors?.background !== '#FAFAFA'
      ? invitation.customColors.background
      : templateDef.colorStyle.background;

  const textColor =
    invitation.customColors?.text &&
    invitation.customColors?.text !== '#2A2420' &&
    invitation.customColors?.text !== '#171717'
      ? invitation.customColors.text
      : templateDef.colorStyle.text;

  const headingFont =
    invitation.customFonts?.heading || templateDef.typography.headingFont || 'Playfair Display';

  // Tilga moslashtirilgan to'liq dinamik matnlar
  const getLocalizedContent = (inv: InvitationData, lang: Language) => {
    if (lang === 'ru') {
      return {
        eventType: 'СВАДЕБНОЕ ТОРЖЕСТВО',
        weddingCeremony: 'СВАДЕБНОЕ ТОРЖЕСТВО',
        invitationQuote: '«Приглашаем вас разделить с нами радость создания новой семьи на нашем праздничном торжестве.»',
        invitationMessage: 'Уважаемые родные и близкие! Мы искренне приглашаем вас разделить этот счастливый день нашего бракосочетания. Ваше присутствие станет для нас величайшей радостью.',
        translateSchedule: (title: string, desc?: string) => {
          if (/kutib|vstrech|welcome/i.test(title)) return { title: 'Встреча дорогих гостей', desc: 'Живая музыка и приветственный фуршет' };
          if (/kirib|kirish|vxod|entrance/i.test(title)) return { title: 'Торжественный выход молодоженов', desc: 'Первый свадебный танец пары' };
          if (/tabrik|duo|pozdrav|blessing/i.test(title)) return { title: 'Поздравления родителей и гостей', desc: 'Искренние пожелания и тосты' };
          if (/tort|cake/i.test(title)) return { title: 'Разрезание свадебного торта', desc: 'Праздничный торт и десерт' };
          if (/salom|konsert|final/i.test(title)) return { title: 'Келин салом и шоу-программа', desc: 'Праздничный концерт и финал' };
          return { title, desc };
        },
      };
    }
    if (lang === 'en') {
      return {
        eventType: 'WEDDING CELEBRATION',
        weddingCeremony: 'WEDDING & MARRIAGE CEREMONY',
        invitationQuote: '«We cordially invite you to celebrate the joyous union of our hearts and lives at our wedding feast.»',
        invitationMessage: 'Dear family and friends! We joyfully invite you to celebrate our special wedding day with us. Your blessings and warm presence will make our celebration truly unforgettable.',
        translateSchedule: (title: string, desc?: string) => {
          if (/kutib|vstrech|welcome/i.test(title)) return { title: 'Guest Welcome & Reception', desc: 'Live acoustic music & welcome drinks' };
          if (/kirib|kirish|vxod|entrance/i.test(title)) return { title: 'Grand Entrance & First Dance', desc: 'Welcoming the bride and groom' };
          if (/tabrik|duo|pozdrav|blessing/i.test(title)) return { title: 'Family Blessings & Speeches', desc: 'Warm heartfelt words from loved ones' };
          if (/tort|cake/i.test(title)) return { title: 'Wedding Cake Ceremony', desc: 'Cutting the celebration cake' };
          if (/salom|konsert|final/i.test(title)) return { title: 'Celebration & Grand Finale', desc: 'Music, dancing and farewell fireworks' };
          return { title, desc };
        },
      };
    }
    return {
      eventType: inv.eventType || 'TO‘Y VA NIKOH MAROSIMI',
      weddingCeremony: gt.weddingCeremony,
      invitationQuote: inv.invitationQuote || gt.defaultQuote,
      invitationMessage: inv.invitationMessage,
      translateSchedule: (title: string, desc?: string) => ({ title, desc }),
    };
  };

  const loc = getLocalizedContent(invitation, invLang);

  // 1. LUXURY WEDDING ENVELOPE COVER OPENING EFFECT
  if (!isCoverOpened) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Template Visual Theme Backdrop */}
        {templateDef.previewImage && (
          <div
            className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${templateDef.previewImage})`,
              opacity: isDarkTheme ? 0.35 : 0.12,
              filter: isDarkTheme ? 'contrast(1.15) brightness(0.85)' : 'contrast(1.05)',
            }}
          />
        )}

        {/* Top Floating Language Switcher for Envelope Screen */}
        <div className="absolute top-4 z-40 flex items-center justify-center">
          <div
            className={`rounded-full px-3 py-1.5 flex items-center gap-1.5 border shadow-xs ${
              isDarkTheme
                ? 'bg-slate-900/90 border-white/15 text-white'
                : 'glass-panel border-white/80 bg-white/80'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-amber-300' : 'text-[#5C4F48]'}`} />
            <button
              onClick={() => setInvLang('uz')}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                invLang === 'uz'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-[#231E1B] text-white shadow-xs'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white'
                  : 'text-[#7A6A63] hover:text-[#231E1B]'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setInvLang('ru')}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                invLang === 'ru'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-[#231E1B] text-white shadow-xs'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white'
                  : 'text-[#7A6A63] hover:text-[#231E1B]'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setInvLang('en')}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                invLang === 'en'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-[#231E1B] text-white shadow-xs'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white'
                  : 'text-[#7A6A63] hover:text-[#231E1B]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Soft floating romance ambient glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none" style={{ backgroundColor: secondaryColor }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none" style={{ backgroundColor: primaryColor }} />

        {/* Realistic Luxury Envelope Card */}
        <div
          className={`relative max-w-md w-full rounded-[36px] p-8 sm:p-10 text-center space-y-6 backdrop-blur-2xl transition-all duration-700 ${
            isDarkTheme
              ? 'bg-[#0E1A2B]/95 text-white border-2 border-amber-400/30 shadow-[0_25px_80px_rgba(0,0,0,0.7)]'
              : 'bg-white/85 text-[#231E1B] border border-white/95 shadow-[0_25px_70px_rgba(0,0,0,0.12)]'
          } ${
            isOpeningAnimation ? 'scale-105 opacity-80 blur-[0.5px] -translate-y-4' : 'animate-fadeIn'
          }`}
          style={{
            boxShadow: `0 25px 60px -15px ${primaryColor}35, 0 0 0 1px ${
              isDarkTheme ? 'rgba(212,175,55,0.25)' : 'rgba(255, 255, 255, 0.9)'
            }`,
          }}
        >
          {/* Decorative Envelope Flap Header with Gold Trim */}
          <div className="relative pt-2">
            <div className="w-16 h-1 mx-auto rounded-full opacity-40 mb-3" style={{ backgroundColor: primaryColor }} />
            <span
              className="font-script text-3xl sm:text-4xl tracking-wider block font-bold leading-relaxed mb-1"
              style={{
                color: isDarkTheme ? '#F5D061' : '#7A4A28',
                textShadow: isDarkTheme ? '0 2px 10px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              {gt.envelopeSubtitle}
            </span>
            <div
              className={`text-[10px] uppercase tracking-[0.25em] font-extrabold mt-1 ${
                isDarkTheme ? 'text-amber-200/80' : 'text-[#7A6A63]'
              }`}
            >
              {loc.weddingCeremony}
            </div>
          </div>

          {/* Royal Wax Seal Monogram */}
          <div className="relative py-2">
            <div
              className={`w-24 h-24 rounded-full mx-auto p-1.5 shadow-[0_10px_30px_rgba(217,101,139,0.35)] flex items-center justify-center cursor-pointer transition-all duration-700 relative group ${
                isOpeningAnimation ? 'rotate-180 scale-125' : 'hover:scale-105 active:scale-95'
              }`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
              onClick={handleOpenInvitation}
            >
              <div
                className={`w-full h-full rounded-full flex flex-col items-center justify-center border-2 border-white shadow-inner ${
                  isDarkTheme
                    ? 'bg-[#0B1525]'
                    : 'bg-gradient-to-tr from-[#FFF5F8] via-white to-[#F0F8FF]'
                }`}
              >
                <Crown className="w-5 h-5 mb-0.5" style={{ color: primaryColor }} />
                <span
                  className={`font-playfair text-xs font-black tracking-widest ${
                    isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'
                  }`}
                >
                  {getMonogram(invitation)}
                </span>
              </div>
              <div className="absolute inset-0 rounded-full border border-white/80 animate-ping opacity-30 pointer-events-none" />
            </div>
          </div>

          {/* Couple Names & Title */}
          <div className="space-y-2">
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isDarkTheme ? 'text-white' : 'text-[#1E1418]'
              }`}
              style={{ fontFamily: headingFont }}
            >
              {invitation.hostNames}
            </h1>
            <p
              className={`text-xs sm:text-sm max-w-xs mx-auto leading-relaxed italic ${
                isDarkTheme ? 'text-slate-300' : 'text-[#5C4F48]'
              }`}
            >
              {loc.invitationQuote}
            </p>
          </div>

          {/* Grand Opening Button */}
          <div className="pt-2">
            <button
              disabled={isOpeningAnimation}
              onClick={handleOpenInvitation}
              className={`w-full py-4 sm:py-5 px-8 rounded-2xl text-sm font-extrabold text-white shadow-[0_12px_35px_rgba(226,123,155,0.45)] hover:shadow-[0_18px_45px_rgba(226,123,155,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                !isOpeningAnimation ? 'animate-pulse' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {isOpeningAnimation ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="tracking-wide">...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white text-white group-hover:scale-125 transition-transform" />
                  <span className="tracking-wide text-sm font-bold">{gt.openEnvelope}</span>
                  <Sparkles className="w-4 h-4 text-white/90 group-hover:rotate-45 transition-transform" />
                </>
              )}
            </button>
            <span
              className={`text-[11px] mt-2 block font-medium ${
                isDarkTheme ? 'text-amber-200/80' : 'text-[#8A7C74]'
              }`}
            >
              ✨ {gt.clickToOpen}
            </span>
          </div>

          {/* Taklifim Platform Badge at bottom of Cover */}
          <div className="pt-2 flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-semibold shadow-xs ${
                isDarkTheme
                  ? 'bg-slate-900/80 border-white/10 text-amber-200'
                  : 'bg-white/70 border-black/5 text-[#8A7C74]'
              }`}
            >
              <TaklifimLogo className="w-3.5 h-3.5" />
              <span>{gt.createdOn}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GUEST PAGE FULL VIEW
  return (
    <div
      className="min-h-screen transition-colors pb-24 relative"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Template Visual Theme Backdrop */}
      {templateDef.previewImage && (
        <div
          className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${templateDef.previewImage})`,
            opacity: isDarkTheme ? 0.35 : 0.12,
            filter: isDarkTheme ? 'contrast(1.15) brightness(0.85)' : 'contrast(1.05)',
          }}
        />
      )}

      {/* Floating Invitation Header: Language switch, Music, Share */}
      <div className="fixed top-4 left-4 right-4 z-40 max-w-2xl mx-auto flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Independent invitation language switcher */}
          <div
            className={`rounded-2xl px-2.5 py-1.5 flex items-center gap-1.5 border shadow-xs ${
              isDarkTheme
                ? 'bg-[#0E1A2B]/90 border-white/15 text-white'
                : 'glass-panel border-white/80'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-amber-300' : 'text-[#5C4F48]'}`} />
            <button
              onClick={() => setInvLang('uz')}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-all ${
                invLang === 'uz'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#231E1B] text-white'
                  : isDarkTheme
                  ? 'text-slate-400'
                  : 'text-[#7A6A63]'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setInvLang('ru')}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-all ${
                invLang === 'ru'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#231E1B] text-white'
                  : isDarkTheme
                  ? 'text-slate-400'
                  : 'text-[#7A6A63]'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setInvLang('en')}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-all ${
                invLang === 'en'
                  ? isDarkTheme
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#231E1B] text-white'
                  : isDarkTheme
                  ? 'text-slate-400'
                  : 'text-[#7A6A63]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className={`p-2.5 rounded-2xl border shadow-xs transition-colors ${
              isDarkTheme
                ? 'bg-[#0E1A2B]/90 border-white/15 text-white hover:bg-slate-800'
                : 'glass-panel border-white/80 text-[#231E1B] hover:bg-white'
            }`}
            title="Ulashish"
            aria-label="Ulashish"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Single Column Invitation Canvas */}
      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-16">
        {/* 1. COVER / HERO */}
        <section className="text-center space-y-6 pt-4 animate-fadeIn">
          <TemplateThemeDecoration
            templateSlug={invitation.templateSlug}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            language={invLang}
          />

          <div
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: primaryColor }}
          >
            {loc.eventType}
          </div>

          <h1
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
              isDarkTheme ? 'text-white' : 'text-[#231E1B]'
            }`}
            style={{ fontFamily: headingFont }}
          >
            {invitation.hostNames}
          </h1>

          <div
            className="w-14 h-0.5 mx-auto opacity-60"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Cover photo */}
          {invitation.coverImage && (
            <div
              className={`relative rounded-3xl overflow-hidden shadow-xl aspect-4/3 max-w-lg mx-auto border-4 ${
                isDarkTheme ? 'border-amber-400/40' : 'border-white/80'
              }`}
            >
              <img
                src={invitation.coverImage}
                alt={invitation.hostNames}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quote */}
          {loc.invitationQuote && (
            <p
              className={`font-playfair text-sm italic max-w-md mx-auto leading-relaxed ${
                isDarkTheme ? 'text-slate-200' : 'text-[#5C4F48]'
              }`}
            >
              {loc.invitationQuote}
            </p>
          )}
        </section>

        {/* 2. COUNTDOWN TIMER */}
        <section
          className={`rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md backdrop-blur-md ${
            isDarkTheme
              ? 'bg-[#121F33]/90 border border-amber-400/25 text-white'
              : 'glass-panel-elevated border border-white/95'
          }`}
        >
          <div
            className="text-xs uppercase font-bold tracking-wider"
            style={{ color: primaryColor }}
          >
            {countdown.isPassed ? gt.countdownPassed : gt.timeRemaining}
          </div>

          {countdown.isPassed ? (
            <div
              className={`py-2 text-sm font-bold rounded-2xl p-3 ${
                isDarkTheme
                  ? 'bg-emerald-950/80 text-emerald-300'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              🎉 {gt.countdownPassed}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto">
              <div
                className={`p-3 rounded-2xl shadow-xs ${
                  isDarkTheme
                    ? 'bg-[#0B1525] border border-amber-400/20'
                    : 'bg-white/80 border border-black/5'
                }`}
              >
                <div
                  className={`font-playfair text-2xl sm:text-3xl font-extrabold ${
                    isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'
                  }`}
                >
                  {countdown.days}
                </div>
                <div
                  className={`text-[10px] uppercase font-bold ${
                    isDarkTheme ? 'text-amber-200/70' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.days}
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl shadow-xs ${
                  isDarkTheme
                    ? 'bg-[#0B1525] border border-amber-400/20'
                    : 'bg-white/80 border border-black/5'
                }`}
              >
                <div
                  className={`font-playfair text-2xl sm:text-3xl font-extrabold ${
                    isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'
                  }`}
                >
                  {countdown.hours}
                </div>
                <div
                  className={`text-[10px] uppercase font-bold ${
                    isDarkTheme ? 'text-amber-200/70' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.hours}
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl shadow-xs ${
                  isDarkTheme
                    ? 'bg-[#0B1525] border border-amber-400/20'
                    : 'bg-white/80 border border-black/5'
                }`}
              >
                <div
                  className={`font-playfair text-2xl sm:text-3xl font-extrabold ${
                    isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'
                  }`}
                >
                  {countdown.minutes}
                </div>
                <div
                  className={`text-[10px] uppercase font-bold ${
                    isDarkTheme ? 'text-amber-200/70' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.minutes}
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl shadow-xs ${
                  isDarkTheme
                    ? 'bg-[#0B1525] border border-amber-400/20'
                    : 'bg-white/80 border border-black/5'
                }`}
              >
                <div
                  className={`font-playfair text-2xl sm:text-3xl font-extrabold ${
                    isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'
                  }`}
                >
                  {countdown.seconds}
                </div>
                <div
                  className={`text-[10px] uppercase font-bold ${
                    isDarkTheme ? 'text-amber-200/70' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.seconds}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. PERSONAL INVITATION MESSAGE */}
        <section className="text-center space-y-4 max-w-lg mx-auto">
          <div
            className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center shadow-xs ${
              isDarkTheme ? 'bg-amber-400/20 text-amber-300' : 'bg-white/60 text-[#B48B47]'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <h2
            className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-[#231E1B]'}`}
            style={{ fontFamily: headingFont }}
          >
            {gt.dearGuest}
          </h2>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDarkTheme ? 'text-slate-200' : 'text-[#4A3E39]'
            }`}
          >
            {loc.invitationMessage}
          </p>
        </section>

        {/* 4. DATE, TIME & VENUE INFORMATION */}
        <section
          className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-md backdrop-blur-md ${
            isDarkTheme
              ? 'bg-[#121F33]/90 border border-amber-400/25 text-white'
              : 'glass-panel-elevated border border-white/95'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDarkTheme ? 'bg-[#0B1525] text-amber-400' : 'bg-[#F5EBDD] text-[#B48B47]'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isDarkTheme ? 'text-amber-200/80' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.schedule}
                </span>
                <h4
                  className={`text-sm font-bold mt-0.5 ${
                    isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                  }`}
                >
                  {invitation.eventDate}
                </h4>
                <p className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-[#5C4F48]'}`}>
                  {gt.timePrefix} {invitation.startTime}
                  {invitation.endTime ? ` ${gt.to} ${invitation.endTime}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDarkTheme ? 'bg-[#0B1525] text-amber-400' : 'bg-[#F5EBDD] text-[#B48B47]'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isDarkTheme ? 'text-amber-200/80' : 'text-[#8A7C74]'
                  }`}
                >
                  {gt.venueTitle}
                </span>
                <h4
                  className={`text-sm font-bold mt-0.5 ${
                    isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                  }`}
                >
                  {invitation.venueName}
                </h4>
                <p className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-[#5C4F48]'}`}>
                  {invitation.venueAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="pt-2">
            <InteractiveMap
              latitude={invitation.latitude}
              longitude={invitation.longitude}
              venueName={invitation.venueName}
              venueAddress={invitation.venueAddress}
              mapUrl={invitation.mapUrl}
              primaryColor={primaryColor}
            />
          </div>
          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <a
              href={
                invitation.mapUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${invitation.venueName} ${invitation.venueAddress}`
                )}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <MapPin className="w-4 h-4" />
              <span>{gt.openGoogleMaps}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
            <button
              onClick={handleAddToCalendar}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 shadow-xs transition-all ${
                isDarkTheme
                  ? 'bg-[#0B1525] hover:bg-[#121F33] text-white border-white/10'
                  : 'bg-white/90 hover:bg-white text-[#231E1B] border-black/10'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#B48B47]" />
              <span>{gt.saveToCalendar}</span>
            </button>
          </div>
        </section>

        {/* 5. EVENT SCHEDULE / TIMELINE */}
        {invitation.schedule && invitation.schedule.length > 0 && (
          <section className="space-y-6">
            <div className="text-center">
              <span
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: primaryColor }}
              >
                {gt.schedule}
              </span>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                }`}
                style={{ fontFamily: headingFont }}
              >
                {gt.scheduleSubtitle}
              </h3>
            </div>

            <div className="space-y-3">
              {invitation.schedule.map((item, idx) => {
                const rawTitle =
                  typeof item.title === 'string'
                    ? item.title
                    : (item.title as any)[invLang] || item.title.uz;
                const rawDesc =
                  typeof item.description === 'string'
                    ? item.description
                    : (item.description as any)?.[invLang] || item.description?.uz;
                const translated = loc.translateSchedule(rawTitle, rawDesc);
                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl p-4 shadow-xs flex items-center gap-4 ${
                      isDarkTheme
                        ? 'bg-[#121F33]/90 border border-amber-400/20 text-white backdrop-blur-md'
                        : 'glass-panel border border-white/80'
                    }`}
                  >
                    <div
                      className={`font-mono text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                        isDarkTheme
                          ? 'text-amber-300 bg-[#0B1525] border border-amber-400/30'
                          : 'text-[#B48B47] bg-[#F5EBDD]'
                      }`}
                    >
                      {item.time}
                    </div>
                    <div>
                      <h5
                        className={`text-xs font-bold ${
                          isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                        }`}
                      >
                        {translated.title}
                      </h5>
                      {translated.desc && (
                        <p
                          className={`text-[11px] mt-0.5 ${
                            isDarkTheme ? 'text-slate-300' : 'text-[#7A6A63]'
                          }`}
                        >
                          {translated.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. PHOTO GALLERY & LIGHTBOX */}
        {invitation.galleryImages && invitation.galleryImages.length > 0 && (
          <section className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <span
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: primaryColor }}
              >
                {gt.gallery}
              </span>
              <h3
                className={`text-2xl sm:text-3xl font-bold mt-1 ${
                  isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                }`}
                style={{ fontFamily: headingFont }}
              >
                {invitation.galleryTitle || gt.galleryTitle}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {invitation.galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative h-44 rounded-2xl overflow-hidden cursor-pointer shadow-xs border group ${
                    isDarkTheme ? 'border-amber-400/30' : 'border-white'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lightbox Modal */}
        {activePhotoIndex !== null && invitation.galleryImages && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() =>
                setActivePhotoIndex(
                  (activePhotoIndex - 1 + invitation.galleryImages.length) %
                    invitation.galleryImages.length
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Oldingi"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={invitation.galleryImages[activePhotoIndex]}
              alt="Katta rasm"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={() =>
                setActivePhotoIndex(
                  (activePhotoIndex + 1) % invitation.galleryImages.length
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Keyingi"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* 7. DRESS CODE - Foydalanuvchi talabi bilan olib tashlandi */}

        {/* 8. RSVP FORM */}
        {invitation.rsvpEnabled && (
          <section
            className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md ${
              isDarkTheme
                ? 'bg-[#121F33]/90 border border-amber-400/25 text-white'
                : 'glass-panel-elevated border border-white/95'
            }`}
          >
            <div className="text-center space-y-2">
              <span
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: primaryColor }}
              >
                {gt.rsvpTitle}
              </span>
              <h3
                className={`text-2xl font-bold ${
                  isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                }`}
                style={{ fontFamily: headingFont }}
              >
                {gt.attendingQuestion}
              </h3>
              <p
                className={`text-xs ${
                  isDarkTheme ? 'text-slate-300' : 'text-[#7A6A63]'
                }`}
              >
                {gt.rsvpSubtitle}
              </p>
            </div>

            {isRsvpSubmitted ? (
              <div
                className={`p-6 rounded-2xl border text-center space-y-3 animate-fadeIn ${
                  isDarkTheme
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4
                  className={`font-playfair text-lg font-bold ${
                    isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                  }`}
                >
                  {gt.rsvpSuccess}
                </h4>
                <p
                  className={`text-xs ${
                    isDarkTheme ? 'text-slate-300' : 'text-[#5C4F48]'
                  }`}
                >
                  {gt.seeYou}
                </p>
                <button
                  onClick={() => setIsRsvpSubmitted(false)}
                  className={`text-xs font-semibold underline pt-1 ${
                    isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'
                  }`}
                >
                  Boshqa mehmon nomidan javob berish
                </button>
              </div>
            ) : (
              <form onSubmit={handleRSVPSubmit} className="space-y-4 text-xs">
                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                    }`}
                  >
                    {gt.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpFullName}
                    onChange={(e) => setRsvpFullName(e.target.value)}
                    placeholder={gt.fullNamePlaceholder}
                    className={`w-full p-3 rounded-xl border outline-none text-xs ${
                      isDarkTheme
                        ? 'bg-[#0B1525] border-amber-400/30 text-white placeholder-slate-400'
                        : 'bg-white border-black/10 text-[#231E1B]'
                    }`}
                  />
                  {formErrors.fullName && (
                    <span className="text-rose-600 text-[11px] mt-1 block">
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                    }`}
                  >
                    {gt.phone}
                  </label>
                  <PhoneInput
                    value={rsvpPhone}
                    onChange={(fullVal, isValid) => {
                      setRsvpPhone(fullVal);
                      setIsRsvpPhoneValid(isValid);
                      if (formErrors.phone && isValid) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.phone;
                          return next;
                        });
                      }
                    }}
                    error={formErrors.phone}
                  />
                </div>

                {/* Attendance radio choice */}
                <div className="space-y-1.5 pt-1">
                  <label
                    className={`font-bold block ${
                      isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                    }`}
                  >
                    {gt.attendingQuestion} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRsvpAttending(true)}
                      className={`p-3 rounded-xl font-bold border transition-all ${
                        rsvpAttending
                          ? isDarkTheme
                            ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-xs'
                            : 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-xs'
                          : isDarkTheme
                          ? 'border-white/10 bg-[#0B1525] text-slate-400'
                          : 'border-black/10 bg-white text-[#7A6A63]'
                      }`}
                    >
                      ✓ {gt.attendingYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpAttending(false)}
                      className={`p-3 rounded-xl font-bold border transition-all ${
                        !rsvpAttending
                          ? isDarkTheme
                            ? 'border-rose-400 bg-rose-950/80 text-rose-200 shadow-xs'
                            : 'border-rose-600 bg-rose-50/80 text-rose-900 shadow-xs'
                          : isDarkTheme
                          ? 'border-white/10 bg-[#0B1525] text-slate-400'
                          : 'border-black/10 bg-white text-[#7A6A63]'
                      }`}
                    >
                      ✕ {gt.attendingNo}
                    </button>
                  </div>
                </div>

                {/* Guest Count if attending */}
                {rsvpAttending && (
                  <div className="pt-1">
                    <label
                      className={`font-bold block mb-1 ${
                        isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                      }`}
                    >
                      {gt.guestCount}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setRsvpGuestCount(cnt)}
                          className={`w-10 h-10 rounded-xl font-bold text-xs border transition-all ${
                            rsvpGuestCount === cnt
                              ? isDarkTheme
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-[#231E1B] text-white'
                              : isDarkTheme
                              ? 'bg-[#0B1525] border-white/10 text-white'
                              : 'bg-white border-black/10 text-[#5C4F48]'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Preference */}
                {rsvpAttending && invitation.askMealPreference && (
                  <div className="pt-1">
                    <label
                      className={`font-bold block mb-1 ${
                        isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                      }`}
                    >
                      {gt.mealPref}
                    </label>
                    <CustomDropdown
                      value={rsvpMeal}
                      onChange={(val) => setRsvpMeal(val)}
                      className="w-full"
                      buttonClassName={`w-full justify-between p-3 ${
                        isDarkTheme
                          ? 'bg-[#0B1525] border border-amber-400/30 text-white'
                          : 'bg-white'
                      }`}
                      dropdownClassName="w-full left-0 right-0"
                      options={[
                        { value: 'Milliy taomlar / To‘y oshi', label: gt.mealDefault },
                        { value: 'Go‘shtli taomlar / Steak', label: 'Go‘shtli taomlar / Steak' },
                        { value: 'Baliq / Dengiz mahsulotlari', label: 'Baliq / Parhez taomlar' },
                        { value: 'Vegetarian', label: 'Vegetarian' },
                      ]}
                    />
                  </div>
                )}

                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      isDarkTheme ? 'text-amber-200' : 'text-[#3A2D28]'
                    }`}
                  >
                    {gt.wishes}
                  </label>
                  <textarea
                    rows={3}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder={gt.wishesPlaceholder}
                    className={`w-full p-3 rounded-xl border outline-none text-xs ${
                      isDarkTheme
                        ? 'bg-[#0B1525] border-amber-400/30 text-white placeholder-slate-400'
                        : 'bg-white border-black/10 text-[#231E1B]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? '...' : gt.submitRSVP}
                </button>
              </form>
            )}
          </section>
        )}

        {/* 9. GUEST WISHES WALL */}
        {guestList.length > 0 && (
          <section className="space-y-4">
            <div className="text-center">
              <span
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: primaryColor }}
              >
                {gt.wishesWall}
              </span>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  isDarkTheme ? 'text-white' : 'text-[#231E1B]'
                }`}
                style={{ fontFamily: headingFont }}
              >
                {gt.wishes}
              </h3>
            </div>

            <div className="space-y-3">
              {guestList.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border shadow-xs text-xs space-y-1.5 ${
                    isDarkTheme
                      ? 'bg-[#121F33]/90 border border-amber-400/20 text-white backdrop-blur-md'
                      : 'bg-white/70 border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className={isDarkTheme ? 'text-amber-300' : 'text-[#231E1B]'}>
                      {g.fullName}
                    </strong>
                    <span
                      className={`text-[10px] ${
                        isDarkTheme ? 'text-slate-400' : 'text-[#8A7C74]'
                      }`}
                    >
                      {g.submittedAt}
                    </span>
                  </div>
                  {g.message && (
                    <p
                      className={`italic leading-relaxed ${
                        isDarkTheme ? 'text-slate-200' : 'text-[#5C4F48]'
                      }`}
                    >
                      "{g.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. FINAL THANK YOU & SOCIAL ICONS */}
        <section className="text-center pt-8 pb-12 border-t border-black/10 space-y-4">
          <p
            className={`text-2xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-[#231E1B]'
            }`}
            style={{ fontFamily: headingFont }}
          >
            {gt.seeYou}
          </p>
          <p
            className={`text-xs font-medium ${
              isDarkTheme ? 'text-slate-300' : 'text-[#7A6A63]'
            }`}
          >
            {gt.withRespect} ({invitation.hostNames})
          </p>

          {/* Social Links for the Host (Instagram, Telegram, Telegram Channel, Phone) */}
          <div className="pt-2 space-y-2.5">
            <span
              className={`text-[11px] font-semibold block ${
                isDarkTheme ? 'text-amber-200/80' : 'text-[#8A7C74]'
              }`}
            >
              {gt.socialConnect}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
              {/* Instagram */}
              <a
                href={
                  invitation.socialLinks?.instagram
                    ? (invitation.socialLinks.instagram.startsWith('http')
                        ? invitation.socialLinks.instagram
                        : `https://instagram.com/${invitation.socialLinks.instagram.replace('@', '')}`)
                    : 'https://instagram.com/'
                }
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              {/* Telegram Shaxsiy */}
              <a
                href={
                  invitation.socialLinks?.telegram
                    ? (invitation.socialLinks.telegram.startsWith('http')
                        ? invitation.socialLinks.telegram
                        : `https://t.me/${invitation.socialLinks.telegram.replace('@', '')}`)
                    : 'https://t.me/'
                }
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group"
                title="Telegram"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              {/* Telegram Kanal */}
              <a
                href={
                  invitation.socialLinks?.telegramChannel
                    ? (invitation.socialLinks.telegramChannel.startsWith('http')
                        ? invitation.socialLinks.telegramChannel
                        : `https://t.me/${invitation.socialLinks.telegramChannel.replace('@', '')}`)
                    : 'https://t.me/'
                }
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0088cc] to-[#006699] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group relative"
                title="Telegram Kanal"
                aria-label="Telegram Kanal"
              >
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-[8px] font-black text-black flex items-center justify-center border border-white">
                  📢
                </span>
              </a>

              {/* Telefon */}
              <a
                href={`tel:${(invitation.socialLinks?.phone || '+998933223580').replace(/\s+/g, '')}`}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group"
                title={gt.callPhone}
                aria-label={gt.callPhone}
              >
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2-RASM: Taklifim platformasida yaratildi badge (Singan rasm aslo chiqmaydi) */}
          <div className="pt-4 flex items-center justify-center">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-semibold transition-all shadow-xs ${
                isDarkTheme
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-white/15 text-amber-200'
                  : 'bg-white/70 hover:bg-white border-black/5 text-[#8A7C74] hover:text-[#231E1B]'
              }`}
            >
              <TaklifimLogo className="w-4 h-4" />
              <span>{gt.createdOn}</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Floating Music Player if enabled & uploaded */}
      {invitation.musicEnabled && invitation.musicUrl && (
        <MusicPlayer
          url={invitation.musicUrl}
          title={invitation.musicTitle}
          autoPlay={true}
          delaySeconds={5}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={`/i/${slug}`}
          title={`${invitation.hostNames} — ${invitation.eventType}`}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
