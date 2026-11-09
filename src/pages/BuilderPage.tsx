import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { useAuth } from '../context/AuthContext';
import { mockTemplates } from '../data/mockTemplates';
import { mockPlans } from '../data/mockPlans';
import { InvitationData, ScheduleItem, DressCodeColor, Template } from '../types';
import { CustomDropdown } from '../components/CustomDropdown';
import { TemplateThemeDecoration } from '../components/TemplateThemeDecoration';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { audioStorage } from '../utils/audioStorage';
import { api } from '../services/api';
import { formatPriceUZS } from '../utils/logic';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  MapPin,
  Music,
  Image as ImageIcon,
  Plus,
  Trash2,
  Users,
  Eye,
  Sliders,
  Palette,
  Type,
  FileText,
  CreditCard,
  Share2,
  CheckCircle2,
  Play,
  Pause,
  Compass,
  Navigation,
  Search,
  ExternalLink,
  Instagram,
  Send,
  Phone,
} from 'lucide-react';
import { TaklifimLogo } from '../components/TaklifimLogo';

// Mashhur tantanalar zallari va ularning aniq koordinatalari
const POPULAR_VENUES = [
  { name: '«Versal» Tantanalar Majmuasi', address: 'Toshkent sh., Shayxontohur t., Navoiy ko‘chasi, 42', lat: 41.3217, lng: 69.2415 },
  { name: '«Yakkasaroy» Tantanalar Saroyi', address: 'Toshkent sh., Shota Rustaveli ko‘chasi, 82', lat: 41.2785, lng: 69.2458 },
  { name: '«Ezidiyor» Majmuasi', address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko‘chasi', lat: 41.2721, lng: 69.2014 },
  { name: '«Hyatt Regency Tashkent» Ballroom', address: 'Toshkent sh., Navoiy shoh ko‘chasi, 1-A', lat: 41.3168, lng: 69.2788 },
  { name: '«Hilton Tashkent City»', address: 'Toshkent sh., Islom Karimov ko‘chasi, 2', lat: 41.3121, lng: 69.2512 },
  { name: '«Osiyo Grand»', address: 'Toshkent sh., Yunusobod tumani, A. Temur shoh ko‘chasi', lat: 41.3541, lng: 69.2890 },
  { name: '«Mumtoz» Tantanalar Saroyi', address: 'Toshkent sh., Qorasaroy ko‘chasi, 312', lat: 41.3489, lng: 69.2312 },
  { name: '«Sayohat» Restorani', address: 'Toshkent sh., Mirzo Ulug‘bek tumani, Buyuk Ipak Yo‘li ko‘chasi, 115', lat: 41.3245, lng: 69.3142 },
];

// Sara to'y taronalari kutubxonasi (100% ishlaydigan audio fayllar)
const PRESET_MUSIC_TRACKS = [
  { title: 'Nafis To‘y Valsi (Pianino va Skripka)', url: '/audio/wedding_vals.mp3' },
  { title: 'Romantik Sevgi Taronasi (Sweet Love)', url: '/audio/romantic_love.mp3' },
];

// Google Maps havolasidan yoki matndan koordinatalarni aniqlovchi aqlli parser
function parseGoogleMapsInput(input: string): { lat?: number; lng?: number } | null {
  if (!input) return null;
  const coordRegex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
  const match = input.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

export const BuilderPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { t, language } = useLanguage();
  const { showToast, isLoggedIn, canUseFreePlan, markFreePlanUsed, user } = useAuth();
  const templateSlug = params.templateSlug || 'template-1';

  // Find template
  const initialTemplate =
    mockTemplates.find((t) => t.slug === templateSlug) || mockTemplates[0];

  const [availableTemplates, setAvailableTemplates] = useState<Template[]>(mockTemplates);

  useEffect(() => {
    async function loadTpls() {
      const list = await api.getTemplates();
      setAvailableTemplates(list);
    }
    loadTpls();

    const unsub = api.subscribe<Template[]>('templates', (updated) => {
      setAvailableTemplates(updated);
    });
    return () => unsub();
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTabMobile, setActiveTabMobile] = useState<'settings' | 'preview'>('settings');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-free');
  const [isDemoSubmitting, setIsDemoSubmitting] = useState<boolean>(false);
  const [isOrderComplete, setIsOrderComplete] = useState<boolean>(false);
  const [publishedSlug, setPublishedSlug] = useState<string>('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');

  // Main Builder State (Live reactive)
  const [invitationState, setInvitationState] = useState<InvitationData>(() => {
    // Check saved draft in localStorage
    try {
      const draft = localStorage.getItem('taklifim_builder_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (params.templateSlug && parsed.templateSlug !== params.templateSlug) {
          const matchTpl = mockTemplates.find((t) => t.slug === params.templateSlug);
          if (matchTpl) {
            parsed.templateId = matchTpl.id;
            parsed.templateSlug = matchTpl.slug;
            parsed.coverImage = matchTpl.previewImage;
            parsed.galleryImages = [matchTpl.previewImage, ...(parsed.galleryImages?.slice(1) || [])];
            parsed.customColors = { ...matchTpl.colorStyle };
            parsed.customFonts = {
              heading: matchTpl.typography.headingFont,
              body: matchTpl.typography.bodyFont,
            };
          }
        }
        return parsed;
      }
    } catch {
      // ignore
    }

    return {
      id: `inv-${Date.now()}`,
      slug: `toylarimiz-${Math.floor(1000 + Math.random() * 9000)}`,
      templateId: initialTemplate.id,
      templateSlug: initialTemplate.slug,
      language: 'uz',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventType: 'To‘y va Nikoh Oqshomi',
      eventTitle: 'Asrorbek & Madina Nikoh To‘yi',
      hostNames: 'Asrorbek & Madina',
      partner1Name: 'Asrorbek',
      partner2Name: 'Madina',
      eventDate: '2026-09-24',
      startTime: '18:00',
      endTime: '23:00',
      venueName: '«Versal» Tantanalar Majmuasi',
      venueAddress: 'Toshkent sh., Shayxontohur tumani, Navoiy ko‘chasi, 42-uy',
      city: 'Toshkent',
      latitude: 41.3217,
      longitude: 69.2415,
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=41.3217,69.2415',
      invitationMessage:
        'Sizni baxtli oqshomimiz — Nikoh to‘yimiz munosabati bilan yoziladigan dasturxonimizga lutfan taklif etamiz. Tashrifingiz bizga quvonch bag‘ishlaydi!',
      invitationQuote: '«Sizni muqaddas rishta — nikoh to‘yimiz munosabati bilan yoziladigan dasturxonimizga lutfan taklif etamiz.»',
      coverImage: initialTemplate.previewImage,
      galleryImages: [
        initialTemplate.previewImage,
      ],
      galleryTitle: 'Bizning suratlarimiz',
      galleryPosition: 'after_message',
      musicEnabled: true,
      musicTitle: 'Nafis To‘y Valsi (Pianino va Skripka)',
      musicUrl: '/audio/wedding_vals.mp3',
      musicFileData: undefined,
      musicPlacement: 'all',
      socialLinks: {
        instagram: '',
        telegram: '',
        telegramChannel: '',
        phone: '',
      },
      schedule: [
        { id: '1', time: '17:30', title: 'Mehmonlarni kutib olish', description: 'Jonli musiqa' },
        { id: '2', time: '18:30', title: 'Tantanali kirish', description: 'Ilk raqs' },
        { id: '3', time: '21:00', title: 'To‘y torti marosimi' },
      ],
      dressCodeEnabled: false,
      dressCodeTitle: 'Pastel & Elegant Glamour',
      dressCodeDescription: 'Och pastel va oqshom liboslari tavsiya etiladi.',
      dressCodeColors: [
        { name: 'Cream', hex: '#F5EBDD' },
        { name: 'Blush Pink', hex: '#F5C9D8' },
        { name: 'Sky Blue', hex: '#B9DFFA' },
      ],
      rsvpEnabled: true,
      rsvpDeadline: '2026-09-15',
      allowCompanion: true,
      maxCompanions: 2,
      askMealPreference: true,
      customColors: {
        primary: initialTemplate.colorStyle.primary,
        secondary: initialTemplate.colorStyle.secondary,
        accent: initialTemplate.colorStyle.accent,
        background: initialTemplate.colorStyle.background,
        text: initialTemplate.colorStyle.text,
      },
      customFonts: {
        heading: initialTemplate.typography.headingFont,
        body: initialTemplate.typography.bodyFont,
      },
    };
  });

  // Keep template sync if changed
  const handleSelectTemplate = (tpl: Template) => {
    setInvitationState((prev) => ({
      ...prev,
      templateId: tpl.id,
      templateSlug: tpl.slug,
      coverImage: tpl.previewImage,
      galleryImages: [tpl.previewImage, ...(prev.galleryImages ? prev.galleryImages.slice(1) : [])],
      customColors: {
        primary: tpl.colorStyle.primary,
        secondary: tpl.colorStyle.secondary,
        accent: tpl.colorStyle.accent,
        background: tpl.colorStyle.background,
        text: tpl.colorStyle.text,
      },
      customFonts: {
        heading: tpl.typography.headingFont,
        body: tpl.typography.bodyFont,
      },
    }));
    showToast(`«${tpl.name}» shabloni tanlandi!`, 'info');
  };

  // Draft management
  useEffect(() => {
    if (!invitationState.musicUrl) {
      setPreviewAudioUrl('');
      return;
    }
    audioStorage.getAudioUrl(invitationState.musicUrl).then((resolved) => {
      setPreviewAudioUrl(resolved || invitationState.musicUrl || '');
    });
  }, [invitationState.musicUrl]);

  const handleSaveDraft = async () => {
    try {
      localStorage.setItem('taklifim_builder_draft', JSON.stringify(invitationState));
      // Shuningdek, api orqali ham saqlash, shunda mehmon ko'rinishida ham darhol aks etadi
      await api.saveInvitation({
        ...invitationState,
        ownerId: user?.id || 'anonymous',
      });
      showToast(t.builder.draftSavedMsg, 'success');
    } catch {
      showToast('Qoralamani saqlashda xatolik', 'error');
    }
  };

  const handleStartOver = () => {
    if (confirm('Barcha kiritilgan o‘zgarishlarni bekor qilib, boshidan boshlamoqchimisiz?')) {
      localStorage.removeItem('taklifim_builder_draft');
      window.location.reload();
    }
  };

  // Schedule management
  const handleAddScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: `s-${Date.now()}`,
      time: '19:00',
      title: 'Tantanali qism',
      description: '',
    };
    setInvitationState((prev) => ({
      ...prev,
      schedule: [...prev.schedule, newItem],
    }));
  };

  const handleRemoveScheduleItem = (id: string) => {
    setInvitationState((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== id),
    }));
  };

  // Photo gallery upload with multi-select and live preview sync
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newUrls: string[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          newUrls.push(uploadEvent.target.result as string);
          loadedCount++;
          if (loadedCount === fileList.length) {
            setInvitationState((prev) => {
              const updatedGallery = [...prev.galleryImages, ...newUrls];
              return {
                ...prev,
                galleryImages: updatedGallery,
                coverImage: updatedGallery[0] || prev.coverImage,
              };
            });
            showToast(`${fileList.length} ta fotosurat qo‘shildi!`, 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setInvitationState((prev) => {
      const updated = prev.galleryImages.filter((_, i) => i !== index);
      return {
        ...prev,
        galleryImages: updated,
        coverImage: updated.length > 0 ? updated[0] : prev.coverImage,
      };
    });
    showToast('Surat olib tashlandi', 'info');
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setInvitationState((prev) => {
      const updated = [...prev.galleryImages];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return {
        ...prev,
        galleryImages: updated,
        coverImage: updated[0] || prev.coverImage,
      };
    });
  };

  // Music upload handler (Supports multiple audio files via IndexedDB without localStorage quota limits)
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let firstUploadedKey = '';
    let firstUploadedTitle = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        continue;
      }

      try {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_]+/g, ' ').trim() || 'Yuklangan musiqa';
        const trackId = `track_${Date.now()}_${i}`;
        const storageKey = await audioStorage.saveAudioFile(`audio_${invitationState.id}_${trackId}`, file);

        if (!firstUploadedKey) {
          firstUploadedKey = storageKey;
          firstUploadedTitle = cleanName;
        }

        setInvitationState((prev) => {
          const prevTracks = prev.musicTracks || [];
          const newTrack = { id: trackId, title: cleanName, url: storageKey };
          const updatedTracks = [...prevTracks, newTrack];
          const updated = {
            ...prev,
            musicEnabled: true,
            musicTitle: prev.musicTitle || cleanName,
            musicUrl: prev.musicUrl || storageKey,
            musicTracks: updatedTracks,
            musicPlacement: prev.musicPlacement || 'all',
          };
          try {
            localStorage.setItem('taklifim_builder_draft', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        showToast(`«${cleanName}» muvaffaqiyatli yuklandi! 🎵`, 'success');
      } catch (err) {
        console.error('Audio upload error:', err);
      }
    }

    if (firstUploadedKey) {
      const resolved = await audioStorage.getAudioUrl(firstUploadedKey);
      setPreviewAudioUrl(resolved);
    }

    e.target.value = '';
  };

  const handleSelectTrack = (track: { id: string; title: string; url: string }) => {
    setInvitationState((prev) => ({
      ...prev,
      musicEnabled: true,
      musicTitle: track.title,
      musicUrl: track.url,
    }));
    audioStorage.getAudioUrl(track.url).then((resolved) => {
      setPreviewAudioUrl(resolved);
    });
    showToast(`«${track.title}» tanlandi! 🎵`, 'success');
  };

  const handleRemoveTrack = (trackId: string) => {
    setInvitationState((prev) => {
      const remaining = (prev.musicTracks || []).filter((t) => t.id !== trackId);
      const activeUrl = prev.musicUrl;
      const willResetActive = remaining.every((t) => t.url !== activeUrl);
      return {
        ...prev,
        musicTracks: remaining,
        musicTitle: willResetActive ? (remaining[0]?.title || '') : prev.musicTitle,
        musicUrl: willResetActive ? (remaining[0]?.url || '') : prev.musicUrl,
        musicEnabled: remaining.length > 0 ? prev.musicEnabled : false,
      };
    });
    showToast('Qo‘shiq olib tashlandi', 'info');
  };

  const handleRemoveMusic = () => {
    setInvitationState((prev) => ({
      ...prev,
      musicEnabled: false,
      musicTitle: '',
      musicUrl: '',
      musicTracks: [],
      musicFileData: undefined,
    }));
    setPreviewAudioUrl('');
    showToast('Barcha musiqalar olib tashlandi', 'info');
  };

  // Checkout submission: 1-martalik bepul, keyingi safar esa aynan shablonning narxi
  const handleFinalCheckout = async () => {
    if (isDemoSubmitting) return;

    const currentTemplate = availableTemplates.find((t) => t.slug === invitationState.templateSlug) || initialTemplate;
    const isFree = canUseFreePlan();
    const finalPrice = isFree ? 0 : (currentTemplate?.price || 180000);

    if (isFree) {
      if (!isLoggedIn) {
        showToast('1 martalik bepul taklifnomani faollashtirish uchun tizimga kiring yoki ro‘yxatdan o‘ting!', 'info');
        navigate('/login');
        return;
      }
    }

    setIsDemoSubmitting(true);

    try {
      // 1. Save invitation as published
      const saved = await api.saveInvitation({
        ...invitationState,
        status: 'published',
        ownerId: user?.id || 'anonymous', // Invitation egasini belgilash
        updatedAt: new Date().toISOString(),
      });

      // 2. Create order record
      await api.createOrder({
        serviceType: 'website_invitation',
        serviceName: `${invitationState.eventTitle} (${invitationState.hostNames})`,
        planName: isFree ? '1 Martalik Bepul' : `${currentTemplate.name} (${formatPriceUZS(finalPrice)})`,
        price: finalPrice,
        customerName: invitationState.hostNames,
        invitationId: saved.id,
      });

      // 3. Agar bepul tarif bo'lsa, 1 martalik cheklovni belgilash
      if (isFree) {
        markFreePlanUsed();
      }

      // Clear draft
      try { localStorage.removeItem('taklifim_builder_draft'); } catch { /* ignore */ }

      setPublishedSlug(saved.slug);
      setIsOrderComplete(true);

      // Celebration confetti
      try {
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors: ['#F5C9D8', '#B9DFFA', '#B48B47', '#D9658B', '#FFD700'] });
      } catch {}

      showToast(isFree ? "Tabriklaymiz! 1 martalik bepul taklifnomangiz muvaffaqiyatli faollashtirildi!" : "Taklifnoma muvaffaqiyatli faollashtirildi!", 'success');
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Faollashtirishda xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.', 'error');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: t.builder.steps.template },
    { num: 2, title: t.builder.steps.details },
    { num: 3, title: t.builder.steps.message },
    { num: 4, title: t.builder.steps.design },
    { num: 5, title: t.builder.steps.photos },
    { num: 6, title: t.builder.steps.schedule },
    { num: 7, title: t.builder.steps.venue },
    { num: 8, title: t.builder.steps.music },
    { num: 9, title: t.builder.steps.rsvp },
    { num: 10, title: t.builder.steps.review },
    { num: 11, title: t.builder.steps.checkout },
  ];

  if (isOrderComplete) {
    const liveUrl = `/i/${publishedSlug || invitationState.slug}`;
    const fullLiveUrl = typeof window !== 'undefined' ? `${window.location.origin}${liveUrl}` : liveUrl;

    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/95 shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {selectedPlanId === 'plan-free' ? '🎁 Tekin Taklifnoma Faollashtirildi' : 'Buyurtma Tasdiqlandi'}
            </span>
            <h1 className="font-playfair text-3xl font-bold text-[#231E1B]">
              Muborak Bo‘lsin!
            </h1>
            <p className="text-xs sm:text-sm text-[#5C4F48] leading-relaxed">
              Sizning raqamli taklifnomangiz muvaffaqiyatli saqlandi va real vaqtda mehmonlarga ulashish uchun faol holatga keltirildi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-black/5 text-xs text-left space-y-2.5">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-[#8A7C74]">Tadbir:</span>
              <strong className="text-[#231E1B]">{invitationState.eventTitle}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-[#8A7C74]">Ismlar:</span>
              <strong className="text-[#231E1B]">{invitationState.hostNames}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-[#8A7C74]">Sana:</span>
              <strong className="text-[#231E1B]">{invitationState.eventDate} ({invitationState.startTime})</strong>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[#8A7C74]">Havola:</span>
              <span className="font-mono text-[#D9658B] font-bold truncate max-w-[200px]">
                {liveUrl}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to={liveUrl}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-[#231E1B] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              <span>Taklifnomani ochish</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(fullLiveUrl);
                  showToast('Havola nusxalandi!', 'success');
                }
              }}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-[#231E1B] glass-panel hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Havolani nusxalash</span>
            </button>
          </div>

          <div className="pt-2 border-t border-black/5">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-[#8A7C74] hover:text-[#231E1B] flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mijoz kabinetiga o‘tish (RSVP va mehmonlarni boshqarish)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Builder Bar */}
        <div className="glass-panel-elevated rounded-3xl p-4 sm:p-5 border border-white/95 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/templates"
              className="p-2 rounded-xl hover:bg-black/5 text-[#5C4F48] transition-colors"
              title="Ortga"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-playfair text-xl font-bold text-[#231E1B]">
                Taklifnoma Konstruktori
              </h1>
              <p className="text-[11px] text-[#7A6A63]">
                {stepsList[currentStep - 1]?.title} bosqichi ({currentStep}/11)
              </p>
            </div>
          </div>

          {/* Quick Draft Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3E39] glass-panel hover:bg-white border border-black/5"
              title="Qoralamani saqlash"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Qoralamani saqlash</span>
            </button>
            <button
              onClick={handleStartOver}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              title="Boshidan boshlash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mobile View Toggle */}
            <div className="flex lg:hidden items-center p-1 rounded-xl bg-black/5">
              <button
                onClick={() => setActiveTabMobile('settings')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeTabMobile === 'settings' ? 'bg-white shadow-xs text-[#231E1B]' : 'text-[#7A6A63]'
                }`}
              >
                Sozlamalar
              </button>
              <button
                onClick={() => setActiveTabMobile('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeTabMobile === 'preview' ? 'bg-white shadow-xs text-[#231E1B]' : 'text-[#7A6A63]'
                }`}
              >
                Ko‘rinish
              </button>
            </div>
          </div>
        </div>

        {/* Steps Progress Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {stepsList.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentStep === st.num
                  ? 'bg-[#231E1B] text-white shadow-xs'
                  : currentStep > st.num
                  ? 'bg-[#E8F3FA] text-[#1E3A5F]'
                  : 'glass-panel text-[#8A7C74] hover:bg-white'
              }`}
            >
              <span>{st.num}. {st.title}</span>
            </button>
          ))}
        </div>

        {/* SPLIT LAYOUT: Settings Panel on Left, Reactive Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: STEP SETTINGS PANEL */}
          <div
            className={`lg:col-span-6 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-lg space-y-6 ${
              activeTabMobile === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* STEP 1: Select Template */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  1. Shablonni tanlang
                </h3>
                <p className="text-xs text-[#7A6A63]">
                  Taklifnomangiz qiyofasini belgilovchi dizaynni tanlang:
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {availableTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-2 ${
                        invitationState.templateSlug === tpl.slug
                          ? 'border-[#D9658B] bg-white shadow-md'
                          : 'border-transparent hover:border-black/10 glass-panel'
                      }`}
                    >
                      <img
                        src={tpl.previewImage}
                        alt={tpl.name}
                        className="w-full h-24 object-cover rounded-xl mb-2"
                      />
                      <div className="text-xs font-bold text-[#231E1B] truncate">{tpl.name}</div>
                      <div className="text-[10px] text-[#7A6A63]">{tpl.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  2. Tadbir ma’lumotlari
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">Tadbir turi</label>
                    <input
                      type="text"
                      value={invitationState.eventType}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, eventType: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Asosiy sarlavha (Kelin va kuyov yoki Mezbon)
                    </label>
                    <input
                      type="text"
                      value={invitationState.hostNames}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, hostNames: e.target.value }))
                      }
                      placeholder="Masalan: Nodir & Malika"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#3A2D28] block mb-1">To‘y sanasi</label>
                      <input
                        type="date"
                        value={invitationState.eventDate}
                        onChange={(e) =>
                          setInvitationState((p) => ({ ...p, eventDate: e.target.value }))
                        }
                        className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#3A2D28] block mb-1">Boshlanish vaqti</label>
                      <input
                        type="time"
                        value={invitationState.startTime}
                        onChange={(e) =>
                          setInvitationState((p) => ({ ...p, startTime: e.target.value }))
                        }
                        className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">To‘yxona / Joy nomi</label>
                    <input
                      type="text"
                      value={invitationState.venueName}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, venueName: e.target.value }))
                      }
                      placeholder="«Versal» Majmuasi"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">Aniq manzil</label>
                    <input
                      type="text"
                      value={invitationState.venueAddress}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, venueAddress: e.target.value }))
                      }
                      placeholder="Toshkent sh., Shayxontohur tumani..."
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Invitation Text */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  3. Taklif matni va hikmat
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Samimiy taklif matni
                    </label>
                    <textarea
                      rows={5}
                      value={invitationState.invitationMessage}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, invitationMessage: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Hikmatli so‘z yoki shior (Iqtibos)
                    </label>
                    <input
                      type="text"
                      value={invitationState.invitationQuote || ''}
                      onChange={(e) =>
                        setInvitationState((p) => ({ ...p, invitationQuote: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Design & Colors */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                      4. Ranglar va Shriftlar
                    </h3>
                    <p className="text-xs text-[#7A6A63] mt-0.5">
                      Taklifnomaning har bir rangini o‘zingiz erkin sozlang
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInvitationState((p) => ({
                        ...p,
                        customColors: {
                          primary: initialTemplate.colorStyle.primary,
                          secondary: initialTemplate.colorStyle.secondary,
                          accent: initialTemplate.colorStyle.accent,
                          background: initialTemplate.colorStyle.background,
                          text: initialTemplate.colorStyle.text,
                        },
                      }));
                      showToast('Ranglar shablon holatiga qaytarildi', 'info');
                    }}
                    className="text-[11px] font-semibold text-[#8A7C74] hover:text-[#231E1B] underline"
                  >
                    Shablon rangiga qaytarish
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Color Grid with Color Picker AND Manual Hex Input */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {([
                      { key: 'primary', label: 'Asosiy rang (Tugmalar, sarlavhalar)', default: '#B48B47' },
                      { key: 'secondary', label: 'Ikkilamchi rang (Aksent belgilar)', default: '#D9658B' },
                      { key: 'accent', label: 'Ajratuvchi rang (Hoshiya, bezak)', default: '#C9A96E' },
                      { key: 'background', label: 'Fon rangi (Sahifa orqa foni)', default: '#FAF6F0' },
                      { key: 'text', label: 'Matn rangi (Asosiy yozuvlar)', default: '#231E1B' },
                    ] as { key: keyof NonNullable<typeof invitationState.customColors>; label: string; default: string }[]).map((item) => {
                      const { key, label } = item;
                      const currentVal = invitationState.customColors?.[key] || item.default;
                      return (
                        <div key={key} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 border border-black/8 hover:bg-white hover:shadow-xs transition-all">
                          {/* Native color picker */}
                          <div className="relative">
                            <input
                              type="color"
                              value={currentVal.startsWith('#') && currentVal.length === 7 ? currentVal : '#B48B47'}
                              onChange={(e) =>
                                setInvitationState((p) => ({
                                  ...p,
                                  customColors: { ...p.customColors, [key]: e.target.value },
                                }))
                              }
                              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white shadow-xs p-0 bg-transparent flex-shrink-0"
                              title={label}
                            />
                          </div>

                          {/* Label and description */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#231E1B] truncate">{label}</p>
                            <p className="text-[10px] text-[#8A7C74]">HEX kodini kiriting yoki tanlang</p>
                          </div>

                          {/* Manual HEX code input */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input
                              type="text"
                              value={currentVal}
                              maxLength={7}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInvitationState((p) => ({
                                  ...p,
                                  customColors: { ...p.customColors, [key]: val },
                                }));
                              }}
                              placeholder="#000000"
                              className="w-20 px-2 py-1 rounded-lg border border-black/10 bg-white font-mono text-xs text-[#231E1B] uppercase text-center focus:ring-1 focus:ring-[#D9658B] outline-none"
                            />
                            <div
                              className="w-7 h-7 rounded-lg border border-black/10 shadow-inner flex-shrink-0"
                              style={{ backgroundColor: currentVal }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Curated Pre-made Themes */}
                  <div className="pt-2">
                    <label className="font-bold text-[#3A2D28] block mb-2">
                      Tayyor nafis rang palitralari (1 bosishda o‘zgartirish)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { name: 'Oltin Nafosat', colors: { primary: '#B48B47', secondary: '#D9658B', accent: '#C9A96E', background: '#FAF6F0', text: '#231E1B' } },
                        { name: 'Pushti Romantika', colors: { primary: '#D9658B', secondary: '#F5C9D8', accent: '#E8A0B8', background: '#FFF5F8', text: '#2A1520' } },
                        { name: 'Moviy Dengiz', colors: { primary: '#2A6F97', secondary: '#B9DFFA', accent: '#61A5C2', background: '#F0F8FF', text: '#1A2A35' } },
                        { name: 'Zumrad Tabiat', colors: { primary: '#2D6A4F', secondary: '#95D5B2', accent: '#52B788', background: '#F2FBF5', text: '#1B3A2B' } },
                        { name: 'Qirollik Binafsha', colors: { primary: '#7209B7', secondary: '#F72585', accent: '#B5179E', background: '#FAF5FF', text: '#240046' } },
                        { name: 'Monoxrom Klassika', colors: { primary: '#1F2937', secondary: '#6B7280', accent: '#4B5563', background: '#FFFFFF', text: '#111827' } },
                      ].map((palette) => (
                        <button
                          key={palette.name}
                          type="button"
                          onClick={() => {
                            setInvitationState((p) => ({ ...p, customColors: palette.colors }));
                            showToast(`«${palette.name}» palitrasi qo‘llandi!`, 'info');
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl border border-black/8 bg-white/80 hover:bg-white hover:shadow-xs transition-all text-left group"
                        >
                          <div className="flex gap-0.5 flex-shrink-0">
                            {Object.values(palette.colors).slice(0, 3).map((c, i) => (
                              <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-xs" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-[#3A2D28] truncate group-hover:text-black">
                            {palette.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography Font selector */}
                  <div className="pt-2">
                    <label className="font-bold text-[#3A2D28] block mb-1">Sarlavha shrifti (Typography)</label>
                    <CustomDropdown
                      value={invitationState.customFonts?.heading || 'Playfair Display'}
                      onChange={(val) =>
                        setInvitationState((p) => ({
                          ...p,
                          customFonts: { ...p.customFonts, heading: val },
                        }))
                      }
                      className="w-full"
                      buttonClassName="w-full justify-between"
                      dropdownClassName="w-full left-0 right-0"
                      options={[
                        { value: 'Playfair Display', label: 'Playfair Display (Klassik va nafis serif)' },
                        { value: 'Cinzel', label: 'Cinzel (Qirollik monoxrom serifi)' },
                        { value: 'Great Vibes', label: 'Great Vibes (Qo‘lyozma romantik)' },
                        { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Zamonaviy toza modern)' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Photos */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                    5. Fotosuratlar galereyasi
                  </h3>
                  <p className="text-xs text-[#7A6A63] mt-1">
                    Taklifnomangizga mehmonlar zavqlanib tomosha qilishi uchun romantik va unutilmas suratlarni joylang.
                  </p>
                </div>

                {/* Surat bo'limi turi (Sarlavhasi) */}
                <div className="p-3.5 rounded-2xl bg-white/70 border border-black/5 space-y-2.5">
                  <label className="font-bold text-xs text-[#3A2D28] block">
                    Surat bo‘limining turi (Shablonda ko‘rinadigan sarlavha):
                  </label>
                  <CustomDropdown
                    value={
                      ['Bizning suratlarimiz', 'To‘y jarayoni suratlari', 'To‘yxona suratlari'].includes(invitationState.galleryTitle || '')
                        ? invitationState.galleryTitle || 'Bizning suratlarimiz'
                        : 'Boshqa'
                    }
                    onChange={(val) => {
                      if (val === 'Boshqa') {
                        setInvitationState((p) => ({ ...p, galleryTitle: '' }));
                      } else {
                        setInvitationState((p) => ({ ...p, galleryTitle: val }));
                      }
                    }}
                    options={[
                      { value: 'Bizning suratlarimiz', label: '💑 Bizning suratlarimiz' },
                      { value: 'To‘y jarayoni suratlari', label: '📸 To‘y jarayoni suratlari' },
                      { value: 'To‘yxona suratlari', label: '🏛️ To‘yxona suratlari' },
                      { value: 'Boshqa', label: '✏️ Boshqa (O‘zingiz yozing)' },
                    ]}
                    className="w-full"
                    buttonClassName="w-full justify-between text-xs"
                    dropdownClassName="w-full left-0 right-0"
                  />

                  {/* Boshqa tanlanganda erkin sarlavha kiritish maydoni */}
                  {(!['Bizning suratlarimiz', 'To‘y jarayoni suratlari', 'To‘yxona suratlari'].includes(invitationState.galleryTitle || '') || invitationState.galleryTitle === '') && (
                    <div className="pt-1.5 animate-fadeIn">
                      <label className="text-[11px] font-semibold text-[#7A6A63] block mb-1">
                        O‘zingiz istagan sarlavhani yozing:
                      </label>
                      <input
                        type="text"
                        value={invitationState.galleryTitle || ''}
                        onChange={(e) => setInvitationState((p) => ({ ...p, galleryTitle: e.target.value }))}
                        placeholder="Masalan: Muhabbat qissasi, Fotoxotiralar..."
                        className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B] transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Suratlar bo'limining joylashuv o'rni */}
                <div className="p-3.5 rounded-2xl bg-white/70 border border-black/5 space-y-2">
                  <label className="font-bold text-xs text-[#3A2D28] block">
                    Shablonda suratlar bo‘limi qayerda joylashsin?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'after_message', label: 'Taklif matnidan so‘ng', badge: 'Tavsiya' },
                      { id: 'after_date', label: 'Sana va manzildan so‘ng', badge: 'Klassik' },
                      { id: 'after_schedule', label: 'Dastur jadvalidan so‘ng', badge: 'Pastda' },
                    ].map((pos) => {
                      const isSel = (invitationState.galleryPosition || 'after_message') === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setInvitationState((p) => ({ ...p, galleryPosition: pos.id as any }))}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                            isSel
                              ? 'bg-gradient-to-tr from-[#FFF5F8] to-[#F0F8FF] border-[#D9658B] shadow-xs ring-1 ring-[#D9658B]/30'
                              : 'bg-white/80 border-black/10 hover:border-black/20'
                          }`}
                        >
                          <span className={`font-bold ${isSel ? 'text-[#D9658B]' : 'text-[#3A2D28]'}`}>
                            {pos.label}
                          </span>
                          <span className="text-[10px] text-[#7A6A63] font-medium bg-black/5 px-2 py-0.5 rounded-full w-max">
                            {pos.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Yuklash maydoni */}
                <div className="border-2 border-dashed border-[#B48B47]/40 rounded-2xl p-6 text-center hover:bg-white/40 transition-colors bg-white/20">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-input"
                  />
                  <label htmlFor="photo-upload-input" className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F5C9D8] to-[#B9DFFA] flex items-center justify-center mx-auto text-[#231E1B] shadow-xs">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-[#231E1B]">
                      Yangi fotosurat(lar) tanlash
                    </div>
                    <div className="text-[11px] text-[#7A6A63]">
                      PNG, JPG — bir vaqtda bir nechta surat tanlashingiz mumkin
                    </div>
                  </label>
                </div>

                {/* Yuklangan suratlar ro'yxati va tartibini o'zgartirish */}
                {invitationState.galleryImages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#3A2D28]">
                      <span>Yuklangan suratlar ({invitationState.galleryImages.length} ta)</span>
                      <span className="text-[10px] font-normal text-[#7A6A63]">
                        ← → tugmalari orqali tartibini o‘zgartiring
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {invitationState.galleryImages.map((img, idx) => {
                        const isCover = (invitationState.coverImage || invitationState.galleryImages[0]) === img;
                        return (
                          <div
                            key={idx}
                            className={`relative group rounded-xl overflow-hidden h-28 shadow-xs border transition-all ${
                              isCover ? 'ring-2 ring-[#D9658B] border-[#D9658B]' : 'border-black/10'
                            }`}
                          >
                            <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {/* Tartib raqami */}
                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              #{idx + 1} {isCover && '★ Muqova'}
                            </span>

                            {/* O'chirish tugmasi */}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pastki boshqaruv paneli (Chapga / O'ngga surish) */}
                            <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePhoto(idx, idx - 1)}
                                className="p-1 rounded bg-white/20 text-white hover:bg-white/40 disabled:opacity-20 transition-all text-[10px] font-bold flex items-center"
                                title="Chapga surish"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setInvitationState((p) => ({ ...p, coverImage: img }));
                                  showToast('Ushbu surat asosiy muqova qilib belgilandi!', 'success');
                                }}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/30 hover:bg-white text-black font-semibold transition-all truncate"
                              >
                                {isCover ? 'Asosiy' : 'Muqova qilish'}
                              </button>

                              <button
                                type="button"
                                disabled={idx === invitationState.galleryImages.length - 1}
                                onClick={() => handleMovePhoto(idx, idx + 1)}
                                className="p-1 rounded bg-white/20 text-white hover:bg-white/40 disabled:opacity-20 transition-all text-[10px] font-bold flex items-center"
                                title="O‘ngga surish"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center font-medium">
                    Hozircha suratlar yo‘q. Yangi surat qo‘shsangiz, taklifnomada unutilmas fotogalereya paydo bo‘ladi!
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Schedule */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                    6. Tadbir dasturi (Jadval)
                  </h3>
                  <button
                    onClick={handleAddScheduleItem}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#231E1B] text-white text-xs font-semibold hover:bg-black"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Qo‘shish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {invitationState.schedule.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-2xl glass-panel border border-black/10 flex items-center gap-2">
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInvitationState((p) => ({
                            ...p,
                            schedule: p.schedule.map((s) => (s.id === item.id ? { ...s, time: val } : s)),
                          }));
                        }}
                        className="w-24 p-1.5 rounded-lg text-xs font-bold border border-black/10 bg-white"
                      />
                      <input
                        type="text"
                        value={typeof item.title === 'string' ? item.title : item.title.uz}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInvitationState((p) => ({
                            ...p,
                            schedule: p.schedule.map((s) => (s.id === item.id ? { ...s, title: val } : s)),
                          }));
                        }}
                        placeholder="Bosqich nomi"
                        className="flex-1 p-1.5 rounded-lg text-xs border border-black/10 bg-white"
                      />
                      <button
                        onClick={() => handleRemoveScheduleItem(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Venue & Map */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                    7. Manzil va Google Xaritasi
                  </h3>
                  <p className="text-xs text-[#7A6A63] mt-0.5">
                    Mehmonlar adashmasdan to‘g‘ri yetib kelishlari uchun aniq manzil va Google Maps lokatsiyasini kiriting.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* To'yxona nomi */}
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">To‘yxona / Bino nomi</label>
                    <input
                      type="text"
                      value={invitationState.venueName}
                      onChange={(e) => setInvitationState((p) => ({ ...p, venueName: e.target.value }))}
                      placeholder="«Versal» Tantanalar Majmuasi"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  {/* Aniq manzil */}
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">Aniq yo‘nalish manzili</label>
                    <input
                      type="text"
                      value={invitationState.venueAddress}
                      onChange={(e) => setInvitationState((p) => ({ ...p, venueAddress: e.target.value }))}
                      placeholder="Toshkent sh., Shayxontohur tumani, Navoiy ko‘chasi, 42-uy"
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                    />
                  </div>

                  {/* Saytning o'zidagi ixcham Interaktiv Google/OSM Xaritasi */}
                  <div className="space-y-2">
                    <label className="font-bold text-[#1E1418] block">
                      📍 Interaktiv Xaritada to‘yxona lokatsiyasini belgilang:
                    </label>
                    <LocationPickerMap
                      latitude={invitationState.latitude || 41.3217}
                      longitude={invitationState.longitude || 69.2415}
                      onLocationSelect={(lat, lng, detectedAddress) => {
                        setInvitationState((p) => {
                          const updated = {
                            ...p,
                            latitude: lat,
                            longitude: lng,
                            venueAddress: detectedAddress || p.venueAddress,
                            mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                          };
                          // Zudlik bilan avto-saqlash
                          try {
                            localStorage.setItem('taklifim_builder_draft', JSON.stringify(updated));
                          } catch {}
                          return updated;
                        });
                        showToast(`Xaritada lokatsiya muvaffaqiyatli belgilandi! 📍 (${lat}, ${lng})`, 'success');
                      }}
                    />
                  </div>

                  {/* Mashhur to'yxonalar tezkor tanlovi */}
                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1.5 flex items-center justify-between">
                      <span>Yoki mashhur to‘yxonani 1-klikda tanlang:</span>
                      <span className="text-[10px] text-[#D9658B] font-semibold">Tezkor to‘ldirish</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 border border-black/5 rounded-2xl bg-black/5">
                      {POPULAR_VENUES.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setInvitationState((p) => {
                              const updated = {
                                ...p,
                                venueName: v.name,
                                venueAddress: v.address,
                                latitude: v.lat,
                                longitude: v.lng,
                                mapUrl: `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`,
                              };
                              try {
                                localStorage.setItem('taklifim_builder_draft', JSON.stringify(updated));
                              } catch {}
                              return updated;
                            });
                            showToast(`«${v.name}» koordinatalari belgilandi!`, 'success');
                          }}
                          className={`p-2 rounded-xl text-left transition-all text-[11px] font-bold border ${
                            invitationState.venueName === v.name
                              ? 'bg-white border-[#D9658B] text-[#D9658B] shadow-xs'
                              : 'bg-white/70 border-transparent hover:bg-white text-[#231E1B]'
                          }`}
                        >
                          <span className="truncate block">📍 {v.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: Music */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                    8. Fon Musiqasi va Pleylist
                  </h3>
                  <p className="text-xs text-[#7A6A63] mt-1">
                    Taklifnomangiz uchun xohlagancha qo‘shiq yuklang yoki sara to‘y kuylaridan tanlang. Musiqalar qayerlarda va qanday yangrashini o‘zingiz belgilang.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Musiqani yoqish/o'chirish */}
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white/70 border border-black/5 hover:bg-white transition-all shadow-xs">
                    <input
                      type="checkbox"
                      checked={invitationState.musicEnabled}
                      onChange={(e) => setInvitationState((p) => ({ ...p, musicEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#D9658B]"
                    />
                    <div>
                      <span className="font-bold text-sm text-[#231E1B] block">Musiqiy jo‘rlikni yoqish</span>
                      <span className="text-[11px] text-[#7A6A63]">Mehmonlar taklifnomani ko‘rishida nafis musiqa yangrashi</span>
                    </div>
                  </label>

                  {invitationState.musicEnabled && (
                    <div className="space-y-5 pt-1 animate-fadeIn">
                      {/* Musiqa qayerlarda yangrashini tanlash (Joylashuv va ijro uslubi) */}
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FFF5F8] via-white to-[#F0F8FF] border border-[#D9658B]/30 space-y-3 shadow-xs">
                        <label className="font-bold text-xs text-[#231E1B] block">
                          🎵 Musiqa qayerda va qanday yangrasin? (Joylashuvni tanlang):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, musicPlacement: 'all' }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              (!invitationState.musicPlacement || invitationState.musicPlacement === 'all')
                                ? 'bg-white border-[#D9658B] ring-2 ring-[#D9658B]/20 shadow-xs'
                                : 'bg-white/60 border-black/5 hover:bg-white'
                            }`}
                          >
                            <span className="text-base block mb-1">🌟</span>
                            <span className="font-bold text-[11px] text-[#231E1B] block">Butun sahifada</span>
                            <span className="text-[10px] text-[#7A6A63] block mt-0.5">Boshidan oxirigacha uzluksiz chalinadi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, musicPlacement: 'cover' }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              invitationState.musicPlacement === 'cover'
                                ? 'bg-white border-[#D9658B] ring-2 ring-[#D9658B]/20 shadow-xs'
                                : 'bg-white/60 border-black/5 hover:bg-white'
                            }`}
                          >
                            <span className="text-base block mb-1">💌</span>
                            <span className="font-bold text-[11px] text-[#231E1B] block">Taklifnomani ochganda</span>
                            <span className="text-[10px] text-[#7A6A63] block mt-0.5">Ochilgach 5 soniyada asta yangraydi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, musicPlacement: 'floating' }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              invitationState.musicPlacement === 'floating'
                                ? 'bg-white border-[#D9658B] ring-2 ring-[#D9658B]/20 shadow-xs'
                                : 'bg-white/60 border-black/5 hover:bg-white'
                            }`}
                          >
                            <span className="text-base block mb-1">🎧</span>
                            <span className="font-bold text-[11px] text-[#231E1B] block">Suzuvchi pleyer</span>
                            <span className="text-[10px] text-[#7A6A63] block mt-0.5">Ekranning pastki qismidagi pult orqali</span>
                          </button>
                        </div>
                      </div>

                      {/* Xohlagancha musiqa yuklash (Multiple Uploads) */}
                      <div className="border-2 border-dashed border-[#B48B47]/40 rounded-2xl p-5 text-center hover:bg-white/60 transition-colors bg-white/30 space-y-2">
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          onChange={handleMusicUpload}
                          className="hidden"
                          id="music-upload-input"
                        />
                        <label htmlFor="music-upload-input" className="cursor-pointer space-y-2 block">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F5C9D8] to-[#B9DFFA] flex items-center justify-center mx-auto text-[#231E1B] shadow-xs">
                            <Music className="w-6 h-6 text-[#D9658B]" />
                          </div>
                          <div className="text-xs font-bold text-[#231E1B]">
                            + O‘z kompyuter yoki telefoningizdan xohlagancha audio yuklang
                          </div>
                          <div className="text-[11px] text-[#7A6A63]">
                            Bir vaqtning o‘zida bir nechta MP3, WAV, OGG yoki M4A audio fayllarni yuklashingiz mumkin
                          </div>
                        </label>
                      </div>

                      {/* Yuklangan qo'shiqlar ro'yxati (User Uploaded Tracks Playlist) */}
                      {invitationState.musicTracks && invitationState.musicTracks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#231E1B]">
                              Yuklagan qo‘shiqlaringiz ({invitationState.musicTracks.length} ta):
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveMusic}
                              className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                            >
                              Barchasini tozalash
                            </button>
                          </div>

                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {invitationState.musicTracks.map((track) => {
                              const isActive = invitationState.musicUrl === track.url;
                              return (
                                <div
                                  key={track.id}
                                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                    isActive
                                      ? 'bg-gradient-to-r from-[#FFF5F8] to-[#F0F8FF] border-[#D9658B] ring-1 ring-[#D9658B]/30 shadow-xs'
                                      : 'bg-white/80 border-black/5 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                        isActive ? 'bg-[#D9658B] text-white' : 'bg-black/5 text-[#5A4A52]'
                                      }`}
                                    >
                                      <Music className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold truncate ${isActive ? 'text-[#D9658B]' : 'text-[#231E1B]'}`}>
                                        {track.title}
                                      </p>
                                      {isActive && (
                                        <span className="text-[10px] text-emerald-600 font-semibold block">
                                          ✓ Faol ijro etilmoqda
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectTrack(track)}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                        isActive
                                          ? 'bg-[#D9658B] text-white shadow-xs'
                                          : 'bg-black/5 text-[#5A4A52] hover:bg-black/10'
                                      }`}
                                    >
                                      {isActive ? '✓ Tanlangan' : 'Tanlash'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTrack(track.id)}
                                      className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title="O‘chirish"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mashhur to'y kuylaridan tanlash */}
                      <div>
                        <label className="font-bold text-[#3A2D28] block mb-2 flex items-center justify-between">
                          <span>Kutubxonadagi sara romantik to‘y kuylari:</span>
                          <span className="text-[10px] text-[#D9658B] font-semibold">Tayyor & kafolatlangan audio</span>
                        </label>
                        <div className="space-y-1.5">
                          {PRESET_MUSIC_TRACKS.map((track, idx) => {
                            const isSelected = invitationState.musicUrl === track.url;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setInvitationState((p) => ({
                                    ...p,
                                    musicEnabled: true,
                                    musicTitle: track.title,
                                    musicUrl: track.url,
                                    musicFileData: undefined,
                                  }));
                                  setPreviewAudioUrl(track.url);
                                  showToast(`«${track.title}» tanlandi! 🎵`, 'success');
                                }}
                                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#FFF5F8] to-[#F0F8FF] border-[#D9658B] shadow-xs ring-1 ring-[#D9658B]/30'
                                    : 'bg-white/80 border-black/5 hover:bg-white hover:border-black/15'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-[#D9658B] text-white' : 'bg-black/5 text-[#5A4A52]'
                                  }`}>
                                    <Music className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#D9658B]' : 'text-[#231E1B]'}`}>
                                    {track.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold shrink-0 px-2.5 py-1 rounded-full bg-black/5 text-[#5A4A52]">
                                  {isSelected ? '✓ Tanlangan' : 'Tanlash'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hozirgi faol musiqa tekshiruv paneli */}
                      {invitationState.musicUrl && (
                        <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FFF5F8] to-[#F0F8FF] border border-[#D9658B]/30 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#D9658B] text-white flex items-center justify-center shadow-xs shrink-0">
                                <Music className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-[#231E1B] block truncate">
                                  {invitationState.musicTitle || 'Tanlangan musiqa'}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-semibold block">
                                  ✓ Hozirda ushbu qo‘shiq taklifnomaga biriktirilgan
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Joyida tinglab ko'rish */}
                          <div className="pt-1">
                            <audio controls src={previewAudioUrl || invitationState.musicUrl} key={previewAudioUrl || invitationState.musicUrl} className="w-full h-8 rounded-lg" />
                          </div>

                          {/* Kuy nomini tahrirlash */}
                          <div>
                            <label className="font-bold text-[#3A2D28] block mb-1 text-[11px]">
                              Mehmonlar ko‘radigan qo‘shiq nomi:
                            </label>
                            <input
                              type="text"
                              value={invitationState.musicTitle || ''}
                              onChange={(e) => setInvitationState((p) => ({ ...p, musicTitle: e.target.value }))}
                              placeholder="Masalan: Asrorbek & Madina to‘y valsi"
                              className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B] text-[#231E1B] font-semibold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 9: RSVP Settings */}
            {currentStep === 9 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  9. RSVP va Mehmonlar sozlamalari
                </h3>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invitationState.rsvpEnabled}
                      onChange={(e) => setInvitationState((p) => ({ ...p, rsvpEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#D9658B]"
                    />
                    <span className="font-bold text-sm text-[#231E1B]">Mehmonlar RSVP tizimini yoqish</span>
                  </label>

                  <div>
                    <label className="font-bold text-[#3A2D28] block mb-1">
                      Tasdiqlashning so‘nggi muddati (Deadline)
                    </label>
                    <input
                      type="date"
                      value={invitationState.rsvpDeadline}
                      onChange={(e) => setInvitationState((p) => ({ ...p, rsvpDeadline: e.target.value }))}
                      className="w-full p-2.5 rounded-xl glass-panel border border-black/10"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={invitationState.allowCompanion}
                      onChange={(e) => setInvitationState((p) => ({ ...p, allowCompanion: e.target.checked }))}
                      className="rounded text-[#D9658B]"
                    />
                    <span>Hamroh (oila a’zolari) bilan kelishga ruxsat berish</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invitationState.askMealPreference}
                      onChange={(e) => setInvitationState((p) => ({ ...p, askMealPreference: e.target.checked }))}
                      className="rounded text-[#D9658B]"
                    />
                    <span>Taom afzalligini so‘rash (Milliy osh / Go‘sht / Baliq / Vegetarian)</span>
                  </label>

                  {/* Mezbonlar ijtimoiy tarmoqlari va aloqa (Instagram, Telegram, Telegram kanal, Telefon) */}
                  <div className="pt-4 border-t border-black/10 space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#231E1B] flex items-center gap-2">
                        <span>📲 Mezbonlar bilan aloqa & Ijtimoiy tarmoqlar</span>
                      </h4>
                      <p className="text-[11px] text-[#7A6A63] mt-0.5">
                        Taklifnoma oxirida mehmonlar siz bilan bog‘lanishi, to‘y kanaliga qo‘shilishi yoki tabrik yuborishi uchun havolalarni kiriting:
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {/* Instagram */}
                      <div>
                        <label className="font-bold text-[#3A2D28] block mb-1 text-[11px] flex items-center gap-1.5">
                          <span className="text-[#E4405F]">📸</span>
                          <span>Instagram sahifa yoki havola:</span>
                        </label>
                        <input
                          type="text"
                          value={invitationState.socialLinks?.instagram || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvitationState((p) => ({
                              ...p,
                              socialLinks: { ...p.socialLinks, instagram: val },
                            }));
                          }}
                          placeholder="Masalan: https://instagram.com/asrorbek_madina yoki @asrorbek_madina"
                          className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B]"
                        />
                      </div>

                      {/* Telegram shaxsiy */}
                      <div>
                        <label className="font-bold text-[#3A2D28] block mb-1 text-[11px] flex items-center gap-1.5">
                          <span className="text-[#229ED9]">✈️</span>
                          <span>Telegram shaxsiy profil (tabriklar uchun):</span>
                        </label>
                        <input
                          type="text"
                          value={invitationState.socialLinks?.telegram || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvitationState((p) => ({
                              ...p,
                              socialLinks: { ...p.socialLinks, telegram: val },
                            }));
                          }}
                          placeholder="Masalan: https://t.me/asrorbek yoki @asrorbek"
                          className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B]"
                        />
                      </div>

                      {/* Telegram kanal */}
                      <div>
                        <label className="font-bold text-[#3A2D28] block mb-1 text-[11px] flex items-center gap-1.5">
                          <span className="text-[#0088cc]">📢</span>
                          <span>Telegram kanal (To‘y foto/video kanali):</span>
                        </label>
                        <input
                          type="text"
                          value={invitationState.socialLinks?.telegramChannel || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvitationState((p) => ({
                              ...p,
                              socialLinks: { ...p.socialLinks, telegramChannel: val },
                            }));
                          }}
                          placeholder="Masalan: https://t.me/asrorbek_madina_toylarimiz"
                          className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B]"
                        />
                      </div>

                      {/* Telefon raqam */}
                      <div>
                        <label className="font-bold text-[#3A2D28] block mb-1 text-[11px] flex items-center gap-1.5">
                          <span className="text-emerald-600">📞</span>
                          <span>Telefon raqam (qo‘ng‘iroq qilish uchun):</span>
                        </label>
                        <input
                          type="tel"
                          value={invitationState.socialLinks?.phone || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvitationState((p) => ({
                              ...p,
                              socialLinks: { ...p.socialLinks, phone: val },
                            }));
                          }}
                          placeholder="Masalan: +998 90 123 45 67"
                          className="w-full p-2.5 rounded-xl bg-white border border-black/10 text-xs outline-none focus:border-[#D9658B]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: Review */}
            {currentStep === 10 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  10. Taklifnomani yakuniy ko‘rib chiqish
                </h3>
                <div className="p-4 rounded-2xl bg-white/70 border border-black/5 text-xs space-y-2.5">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#8A7C74]">Tadbir:</span>
                    <strong className="text-[#231E1B]">{invitationState.eventTitle}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#8A7C74]">Ismlar:</span>
                    <strong className="text-[#231E1B]">{invitationState.hostNames}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#8A7C74]">Sana va vaqt:</span>
                    <strong className="text-[#231E1B]">
                      {invitationState.eventDate} ({invitationState.startTime})
                    </strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-[#8A7C74]">To‘yxona:</span>
                    <strong className="text-[#231E1B]">{invitationState.venueName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A7C74]">Fotosuratlar:</span>
                    <strong className="text-[#231E1B]">{invitationState.galleryImages.length} ta rasm</strong>
                  </div>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  ✓ Barcha asosiy maydonlar to‘ldirildi. Keyingi bosqichda tarifni tanlab, taklifnomani jonli rejimga chiqaring!
                </p>
              </div>
            )}

            {/* STEP 11: Plan & Checkout */}
            {currentStep === 11 && (() => {
              const currentTemplate = availableTemplates.find((t) => t.slug === invitationState.templateSlug) || initialTemplate;
              const isFreeAvailable = canUseFreePlan();
              const templatePrice = currentTemplate?.price || 180000;

              return (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                      11. Taklifnomani faollashtirish
                    </h3>
                    <p className="text-xs text-[#7A6A63]">
                      {isFreeAvailable
                        ? 'Siz uchun 1 martalik bepul faollashtirish imkoniyati faol!'
                        : `Tanlangan «${currentTemplate.name}» shabloni uchun to‘lov miqdori:`}
                    </p>
                  </div>

                  {/* Faqat 1 ta toza va aniq kartochka */}
                  {isFreeAvailable ? (
                    <div className="p-5 rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          🎁 1 MARTALIK BEPUL SOVG‘A
                        </span>
                        <span className="text-xl font-extrabold text-emerald-700">0 so‘m</span>
                      </div>
                      <h4 className="font-playfair text-lg font-bold text-[#231E1B]">
                        Birinchi taklifnomangiz mutlaqo bepul!
                      </h4>
                      <p className="text-xs text-[#5C4F48] leading-relaxed">
                        Siz ushbu hisobingizdan ilk taklifnomangizni hech qanday to‘lovsiz, to‘liq barcha imkoniyatlari bilan faollashtirishingiz mumkin.
                      </p>
                      <ul className="text-xs text-emerald-900 space-y-1 pt-1 border-t border-emerald-200/60">
                        <li className="flex items-center gap-1.5">✓ Cheksiz mehmonlar va jonli RSVP</li>
                        <li className="flex items-center gap-1.5">✓ Google Maps interaktiv navigatsiyasi</li>
                        <li className="flex items-center gap-1.5">✓ Siz tanlagan fon musiqasi</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="p-5 rounded-3xl border-2 border-[#D9658B] bg-white shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF5F8] text-[#D9658B] border border-[#D9658B]/30">
                          «{currentTemplate.name}» Shablon
                        </span>
                        <span className="text-2xl font-extrabold text-[#231E1B]">
                          {formatPriceUZS(templatePrice)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C4F48] leading-relaxed">
                        Tanlagan shabloningiz bo‘yicha to‘liq faollashtiriladi va mehmonlarga ulashish uchun tayyor bo‘ladi.
                      </p>
                      <ul className="text-xs text-[#4A3E39] space-y-1 pt-1 border-t border-black/5">
                        <li className="flex items-center gap-1.5">✓ Cheksiz mehmonlar va jonli RSVP</li>
                        <li className="flex items-center gap-1.5">✓ Google Maps interaktiv navigatsiyasi</li>
                        <li className="flex items-center gap-1.5">✓ Siz tanlagan fon musiqasi</li>
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isDemoSubmitting}
                    onClick={handleFinalCheckout}
                    className={`w-full mt-4 py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md duration-300 ${
                      isDemoSubmitting
                        ? 'opacity-80 cursor-wait bg-gray-200 text-gray-600'
                        : isFreeAvailable
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-200 hover:shadow-lg hover:scale-[1.01]'
                        : 'bg-gradient-to-r from-[#E27B9B] via-[#D9658B] to-[#B9DFFA] text-white shadow-[#E27B9B]/30 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                  >
                    {isDemoSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Faollashtirilmoqda...</span>
                      </>
                    ) : isFreeAvailable ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🎁 Bepul Faollashtirish (0 so‘m)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Taklifnomani Faollashtirish ({formatPriceUZS(templatePrice)})</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Navigation buttons: Prev / Next */}
            <div className="pt-6 border-t border-black/5 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C4F48] glass-panel hover:bg-white"
                >
                  {t.builder.prevStep}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 11 && (
                <button
                  onClick={() => {
                    setCurrentStep((p) => p + 1);
                    // Qadam o'zgarganda qoralamani zudlik bilan avto-sinxronizatsiya qilish
                    try {
                      localStorage.setItem('taklifim_builder_draft', JSON.stringify(invitationState));
                    } catch {}
                    api.saveInvitation({
                      ...invitationState,
                      ownerId: user?.id || 'anonymous',
                    }).catch(() => {});
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#231E1B] hover:bg-black transition-colors"
                >
                  <span>{t.builder.nextStep}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: LIVE REACTIVE PREVIEW ON DESKTOP & MOBILE */}
          {(() => {
            const previewTpl =
              availableTemplates.find(
                (t) =>
                  t.slug === invitationState.templateSlug ||
                  t.id === invitationState.templateId
              ) || mockTemplates[0];

            const isDarkPreview =
              invitationState.templateSlug === 'template-19' ||
              invitationState.templateSlug === 'template-10' ||
              invitationState.templateSlug === 'template-18' ||
              invitationState.templateSlug === 'template-3' ||
              invitationState.templateSlug === 'template-5' ||
              (invitationState.customColors?.background &&
                (invitationState.customColors.background.startsWith('#0') ||
                  invitationState.customColors.background.startsWith('#1') ||
                  invitationState.customColors.background.startsWith('#2')));

            const previewInnerContent = (
              <>
                <div className="space-y-4">
                  <TemplateThemeDecoration
                    templateSlug={invitationState.templateSlug}
                    primaryColor={invitationState.customColors?.primary}
                    secondaryColor={invitationState.customColors?.secondary}
                    accentColor={invitationState.customColors?.accent}
                    language={language}
                  />

                  <div
                    className="text-[10px] tracking-widest uppercase font-bold"
                    style={{
                      color: invitationState.customColors?.primary || '#B48B47',
                    }}
                  >
                    {invitationState.eventType.toUpperCase()}
                  </div>

                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      fontFamily:
                        invitationState.customFonts?.heading || 'Playfair Display',
                    }}
                  >
                    {invitationState.hostNames || 'Kelin & Kuyov'}
                  </h2>

                  <div
                    className="w-10 h-0.5 mx-auto opacity-50"
                    style={{
                      backgroundColor:
                        invitationState.customColors?.primary || '#B48B47',
                    }}
                  />

                  {/* 1. Cover Image (Bosh surat) */}
                  <div className="w-full h-44 rounded-2xl overflow-hidden shadow-xs border border-white my-2 relative group">
                    <img
                      src={invitationState.coverImage || invitationState.galleryImages[0]}
                      alt={invitationState.hostNames}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-white font-medium">
                      Asosiy muqova
                    </div>
                  </div>

                  {/* 2. Taklif matni */}
                  <p className="text-xs leading-relaxed italic px-2 opacity-85">
                    "{invitationState.invitationMessage}"
                  </p>

                  {/* Agar joylashuv 'after_message' bo'lsa: Fotosuratlar galereyasi shu yerda chiqadi */}
                  {(invitationState.galleryPosition || 'after_message') === 'after_message' && invitationState.galleryImages.length > 0 && (
                    <div className="py-2.5 px-2 rounded-2xl bg-white/60 border border-white shadow-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-playfair text-xs font-bold"
                          style={{ color: invitationState.customColors?.primary || '#B48B47' }}
                        >
                          {invitationState.galleryTitle || 'Bizning suratlarimiz'}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-[#7A6A63]">
                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, galleryPosition: 'after_date' }))}
                            className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 font-bold transition-all"
                            title="Bo‘limni pastga ko‘chirish"
                          >
                            ↓ Pastga
                          </button>
                        </div>
                      </div>

                      {/* Suratlar grid va siljitish */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {invitationState.galleryImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setInvitationState((p) => ({ ...p, coverImage: img }))}
                            className={`relative rounded-xl overflow-hidden h-16 border cursor-pointer group transition-all ${
                              (invitationState.coverImage || invitationState.galleryImages[0]) === img
                                ? 'ring-2 ring-[#D9658B] border-[#D9658B]'
                                : 'border-white hover:opacity-90'
                            }`}
                            title="Bosib muqova qiling yoki tahrirlang"
                          >
                            <img src={img} alt="Foto" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx - 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                  title="Chapga"
                                >
                                  ‹
                                </button>
                              )}
                              {idx < invitationState.galleryImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx + 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                  title="O‘ngga"
                                >
                                  ›
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Sana & Manzil */}
                  <div className="py-2 space-y-1 text-xs">
                    <div
                      className="font-bold flex items-center justify-center gap-1.5"
                      style={{
                        color:
                          invitationState.customColors?.primary || '#B48B47',
                      }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {invitationState.eventDate} • {invitationState.startTime}
                      </span>
                    </div>
                    <div className="text-[11px] flex items-center justify-center gap-1 opacity-75">
                      <MapPin className="w-3 h-3" />
                      <span>{invitationState.venueName}</span>
                    </div>
                  </div>

                  {/* Agar joylashuv 'after_date' bo'lsa: Fotosuratlar galereyasi shu yerda chiqadi */}
                  {invitationState.galleryPosition === 'after_date' && invitationState.galleryImages.length > 0 && (
                    <div className="py-2.5 px-2 rounded-2xl bg-white/60 border border-white shadow-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-playfair text-xs font-bold"
                          style={{ color: invitationState.customColors?.primary || '#B48B47' }}
                        >
                          {invitationState.galleryTitle || 'Bizning suratlarimiz'}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-[#7A6A63]">
                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, galleryPosition: 'after_message' }))}
                            className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 font-bold transition-all"
                            title="Yuqoriga ko‘chirish"
                          >
                            ↑ Yuqoriga
                          </button>
                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, galleryPosition: 'after_schedule' }))}
                            className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 font-bold transition-all"
                            title="Pastga ko‘chirish"
                          >
                            ↓ Pastga
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {invitationState.galleryImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setInvitationState((p) => ({ ...p, coverImage: img }))}
                            className={`relative rounded-xl overflow-hidden h-16 border cursor-pointer group transition-all ${
                              (invitationState.coverImage || invitationState.galleryImages[0]) === img
                                ? 'ring-2 ring-[#D9658B] border-[#D9658B]'
                                : 'border-white hover:opacity-90'
                            }`}
                          >
                            <img src={img} alt="Foto" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx - 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                >
                                  ‹
                                </button>
                              )}
                              {idx < invitationState.galleryImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx + 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                >
                                  ›
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Dastur jadvali */}
                  {invitationState.schedule.length > 0 && (
                    <div className="text-left p-3 rounded-xl bg-white/40 border border-black/5 text-[11px] space-y-1.5">
                      <div className="font-bold text-[10px] uppercase text-[#7A6A63]">
                        Dastur
                      </div>
                      {invitationState.schedule.map((s) => (
                        <div key={s.id} className="flex gap-2">
                          <span className="font-bold font-mono opacity-80">{s.time}</span>
                          <span className="truncate">
                            {typeof s.title === 'string' ? s.title : s.title.uz}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Google Maps va Manzil qismi preview */}
                  <div className="py-2.5 px-3 rounded-2xl bg-white/70 border border-black/5 text-[11px] text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1E1418] flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                        <span className="truncate">{invitationState.venueName}</span>
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#4285F4] bg-[#4285F4]/10 px-1.5 py-0.5 rounded shrink-0">
                        Google Maps
                      </span>
                    </div>
                    <p className="text-[10px] text-[#5C4F48] truncate">{invitationState.venueAddress}</p>
                    {invitationState.latitude && invitationState.longitude && (
                      <div className="text-[9px] text-emerald-700 font-mono">
                        📍 {invitationState.latitude}, {invitationState.longitude}
                      </div>
                    )}
                  </div>

                  {/* Fon musiqasi preview */}
                  {invitationState.musicEnabled && (
                    <div className="py-2 px-3 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#F0F8FF] border border-[#D9658B]/20 text-[10px] flex items-center justify-between text-[#D9658B] font-bold">
                      <span className="flex items-center gap-1.5 truncate">
                        <Music className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{invitationState.musicTitle || 'Nafis to‘y kuyi'}</span>
                      </span>
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded-full shadow-xs shrink-0 text-[#1E1418]">
                        5s autoplay
                      </span>
                    </div>
                  )}

                  {/* Agar joylashuv 'after_schedule' bo'lsa: Fotosuratlar galereyasi shu yerda chiqadi */}
                  {invitationState.galleryPosition === 'after_schedule' && invitationState.galleryImages.length > 0 && (
                    <div className="py-2.5 px-2 rounded-2xl bg-white/60 border border-white shadow-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-playfair text-xs font-bold"
                          style={{ color: invitationState.customColors?.primary || '#B48B47' }}
                        >
                          {invitationState.galleryTitle || 'Bizning suratlarimiz'}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-[#7A6A63]">
                          <button
                            type="button"
                            onClick={() => setInvitationState((p) => ({ ...p, galleryPosition: 'after_date' }))}
                            className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 font-bold transition-all"
                            title="Yuqoriga ko‘chirish"
                          >
                            ↑ Yuqoriga
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {invitationState.galleryImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setInvitationState((p) => ({ ...p, coverImage: img }))}
                            className={`relative rounded-xl overflow-hidden h-16 border cursor-pointer group transition-all ${
                              (invitationState.coverImage || invitationState.galleryImages[0]) === img
                                ? 'ring-2 ring-[#D9658B] border-[#D9658B]'
                                : 'border-white hover:opacity-90'
                            }`}
                          >
                            <img src={img} alt="Foto" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx - 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                >
                                  ‹
                                </button>
                              )}
                              {idx < invitationState.galleryImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, idx + 1);
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/90 text-black flex items-center justify-center text-[8px] font-bold"
                                >
                                  ›
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RSVP simulation button */}
                <div className="pt-4 border-t border-black/10">
                  <div
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
                    style={{
                      backgroundColor:
                        invitationState.customColors?.primary || '#B48B47',
                    }}
                  >
                    Tashrifingizni tasdiqlang
                  </div>
                  <div className="text-[10px] text-[#7A6A63] mt-1.5">
                    Muddati: {invitationState.rsvpDeadline}
                  </div>
                </div>

                {/* Social media icons simulation in Preview */}
                <div className="pt-3 border-t border-black/10 space-y-2 text-center">
                  <span className="text-[10px] font-semibold text-[#8A7C74] block">
                    Mezbonlar bilan bog‘lanish:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center shadow-xs">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-xs relative">
                      <Send className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-[6px] font-black text-black flex items-center justify-center">
                        📢
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Taklifim Platform Brand badge */}
                <div className="pt-2 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-black/5 text-[10px] text-[#8A7C74]">
                    <TaklifimLogo className="w-3.5 h-3.5" />
                    <span>Taklifim platformasida yaratildi</span>
                  </div>
                </div>
              </>
            );

            return (
              <div
                className={`lg:col-span-6 flex flex-col items-center sticky top-28 ${
                  activeTabMobile === 'settings' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* Device View Toggle: Telefon | Kompyuter */}
                <div className="mb-4 inline-flex items-center gap-1.5 p-1 rounded-2xl glass-panel-elevated border border-black/5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-[#231E1B] text-white shadow-xs'
                        : 'text-[#6E5D53] hover:text-[#231E1B]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Telefon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-[#231E1B] text-white shadow-xs'
                        : 'text-[#6E5D53] hover:text-[#231E1B]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Kompyuter</span>
                  </button>
                </div>

                {previewDevice === 'mobile' ? (
                  <div className="w-[320px] sm:w-[350px] rounded-[44px] p-4 bg-[#231E1B] shadow-2xl ring-1 ring-white/20 relative transition-all">
                    {/* Speaker Notch */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#151210] rounded-full z-30" />

                    <div
                      className="w-full h-[620px] rounded-[36px] overflow-y-auto overflow-x-hidden p-6 pt-9 text-center flex flex-col justify-between border border-black/10 select-none shadow-inner relative"
                      style={{
                        backgroundColor:
                          invitationState.customColors?.background ||
                          (isDarkPreview ? '#0B1522' : '#FAF6F0'),
                        color:
                          invitationState.customColors?.text ||
                          (isDarkPreview ? '#F8FAFC' : '#2A2420'),
                      }}
                    >
                      {/* Template Background Texture */}
                      {previewTpl.previewImage && (
                        <div
                          className="absolute inset-0 pointer-events-none -z-0 bg-cover bg-center transition-all duration-500"
                          style={{
                            backgroundImage: `url(${previewTpl.previewImage})`,
                            opacity: isDarkPreview ? 0.35 : 0.12,
                            filter: isDarkPreview
                              ? 'contrast(1.15) brightness(0.85)'
                              : 'contrast(1.05)',
                          }}
                        />
                      )}
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        {previewInnerContent}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[560px] rounded-2xl bg-[#231E1B] shadow-2xl ring-1 ring-white/20 overflow-hidden transition-all">
                    {/* Desktop Browser Window Header */}
                    <div className="px-4 py-2.5 bg-[#151210] flex items-center justify-between border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <div className="flex-1 mx-4 px-3 py-1 rounded-lg bg-black/40 text-[10px] text-gray-400 font-mono truncate text-center border border-white/5">
                        taklifim.uz/invitation/{invitationState.templateSlug}
                      </div>
                      <div className="w-8" />
                    </div>

                    <div
                      className="w-full h-[600px] overflow-y-auto overflow-x-hidden p-8 text-center flex flex-col justify-between select-none shadow-inner relative"
                      style={{
                        backgroundColor:
                          invitationState.customColors?.background ||
                          (isDarkPreview ? '#0B1522' : '#FAF6F0'),
                        color:
                          invitationState.customColors?.text ||
                          (isDarkPreview ? '#F8FAFC' : '#2A2420'),
                      }}
                    >
                      {/* Template Background Texture */}
                      {previewTpl.previewImage && (
                        <div
                          className="absolute inset-0 pointer-events-none -z-0 bg-cover bg-center transition-all duration-500"
                          style={{
                            backgroundImage: `url(${previewTpl.previewImage})`,
                            opacity: isDarkPreview ? 0.35 : 0.12,
                            filter: isDarkPreview
                              ? 'contrast(1.15) brightness(0.85)'
                              : 'contrast(1.05)',
                          }}
                        />
                      )}
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        {previewInnerContent}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
