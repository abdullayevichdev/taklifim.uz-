import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../locales';
import { api } from '../services/api';
import { InvitationData, GuestRSVP, OrderItem, Language } from '../types';
import { calculateRSVPStats, formatPriceUZS } from '../utils/logic';
import { ShareModal } from '../components/ShareModal';
import { PhoneInput } from '../components/PhoneInput';
import {
  Users,
  Calendar,
  Sparkles,
  PlusCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  SlidersHorizontal,
  Settings as SettingsIcon,
  CreditCard,
  FileText,
  LayoutGrid,
  List as ListIcon,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, login, showToast } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Active sub-tab based on URL path
  const activeTab = useMemo(() => {
    if (path.includes('/dashboard/invitations')) return 'invitations';
    if (path.includes('/dashboard/guests')) return 'guests';
    if (path.includes('/dashboard/orders')) return 'orders';
    if (path.includes('/dashboard/settings')) return 'settings';
    return 'overview';
  }, [path]);

  // Data states
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [guests, setGuests] = useState<GuestRSVP[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitations view mode: grid or list
  const [invitationViewMode, setInvitationViewMode] = useState<'grid' | 'list'>('grid');

  // Deletion modal
  const [invitationToDelete, setInvitationToDelete] = useState<InvitationData | null>(null);

  // Share modal
  const [shareData, setShareData] = useState<{ url: string; title: string } | null>(null);

  // Guest search and filters
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilterStatus, setGuestFilterStatus] = useState<'all' | 'attending' | 'declined'>('all');

  // Settings form
  const [profileName, setProfileName] = useState(user?.name || 'Nodirbek Salimov');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+998 90 987 65 43');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'nodir.salimov@gmail.com');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [invList, guestList, orderList] = await Promise.all([
        api.getInvitations(),
        api.getGuests(),
        api.getOrders(),
      ]);
      setInvitations(invList);
      setGuests(guestList);
      setOrders(orderList);
      setLoading(false);
    }
    loadData();

    // Real-time synchronization
    const unsubInv = api.subscribe<InvitationData[]>('invitations', (data) => {
      setInvitations(data);
    });
    const unsubGuests = api.subscribe<GuestRSVP[]>('guests', (data) => {
      setGuests(data);
    });
    const unsubOrders = api.subscribe<OrderItem[]>('orders', (data) => {
      setOrders(data);
    });

    return () => {
      unsubInv();
      unsubGuests();
      unsubOrders();
    };
  }, []);

  const handleExportCSV = () => {
    if (filteredGuests.length === 0) {
      showToast('Eksport qilish uchun mehmonlar mavjud emas', 'info');
      return;
    }
    const headers = ['F.I.Sh.', 'Telefon', 'Holat', 'Kishi soni', 'Taom afzalligi', 'Tilak va tabrik', 'Sana'];
    const rows = filteredGuests.map((g) => [
      `"${g.fullName.replace(/"/g, '""')}"`,
      `"${(g.phone || '').replace(/"/g, '""')}"`,
      g.attending ? 'Keladi' : 'Kela olmaydi',
      g.guestCount,
      `"${(g.mealPreference || '').replace(/"/g, '""')}"`,
      `"${(g.message || '').replace(/"/g, '""')}"`,
      `"${g.submittedAt || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mehmonlar_royxati_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Mehmonlar ro‘yxati Excel (CSV) formatida muvaffaqiyatli yuklab olindi!', 'success');
  };

  const handleDeleteGuest = async (id: string) => {
    if (confirm('Ushbu mehmonni ro‘yxatdan o‘chirishni tasdiqlaysizmi?')) {
      await api.deleteGuest(id);
      showToast('Mehmon ro‘yxatdan o‘chirildi', 'info');
    }
  };

  // Aggregated RSVP stats
  const rsvpStats = useMemo(() => calculateRSVPStats(guests), [guests]);

  // Duplicate invitation action
  const handleDuplicate = async (inv: InvitationData) => {
    const duplicated: InvitationData = {
      ...inv,
      id: `inv-${Date.now()}`,
      slug: `${inv.slug}-nusxa-${Math.floor(100 + Math.random() * 900)}`,
      eventTitle: `${inv.eventTitle} (Nusxa)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await api.saveInvitation(duplicated);
    setInvitations((prev) => [duplicated, ...prev]);
    showToast('Taklifnoma muvaffaqiyatli nusxalandi!', 'success');
  };

  // Confirm delete invitation
  const handleDeleteConfirm = async () => {
    if (!invitationToDelete) return;
    await api.deleteInvitation(invitationToDelete.id);
    setInvitations((prev) => prev.filter((i) => i.id !== invitationToDelete.id));
    setInvitationToDelete(null);
    showToast('Taklifnoma o‘chirildi', 'info');
  };

  // Filtered guests
  const filteredGuests = useMemo(() => {
    let result = [...guests];
    if (guestFilterStatus === 'attending') {
      result = result.filter((g) => g.attending);
    } else if (guestFilterStatus === 'declined') {
      result = result.filter((g) => !g.attending);
    }
    if (guestSearch.trim()) {
      const q = guestSearch.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.fullName.toLowerCase().includes(q) ||
          (g.phone && g.phone.includes(q)) ||
          (g.message && g.message.toLowerCase().includes(q))
      );
    }
    return result;
  }, [guests, guestFilterStatus, guestSearch]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login(profileEmail, profileName);
    showToast('Profil ma’lumotlari muvaffaqiyatli yangilandi!', 'success');
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dashboard Top Header */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-[#D9658B]">
              {t.dashboard.title}
            </span>
            <h1 className="font-playfair text-3xl font-extrabold text-[#231E1B]">
              {t.dashboard.welcome}, {user?.name || 'Hurmatli Mijoz'}!
            </h1>
            <p className="text-xs text-[#7A6A63]">
              Barcha raqamli taklifnomalaringiz va mehmonlaringiz ro‘yxatini bir joyda boshqaring.
            </p>
          </div>

          <Link
            to="/templates"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-[#231E1B] bg-gradient-to-r from-[#F5C9D8] to-[#F5EBDD] hover:shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.createBtn}</span>
          </Link>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-black/5">
          {[
            { id: 'overview', path: '/dashboard', label: t.dashboard.tabs.overview },
            { id: 'invitations', path: '/dashboard/invitations', label: t.dashboard.tabs.invitations },
            { id: 'guests', path: '/dashboard/guests', label: `${t.dashboard.tabs.guests} (${guests.length})` },
            { id: 'orders', path: '/dashboard/orders', label: t.dashboard.tabs.orders },
            { id: 'settings', path: '/dashboard/settings', label: t.dashboard.tabs.settings },
          ].map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#231E1B] text-white shadow-xs'
                  : 'glass-panel text-[#5C4F48] hover:bg-white hover:text-[#231E1B] border border-black/5'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">
                  {t.dashboard.totalInvitations}
                </span>
                <div className="font-playfair text-3xl font-extrabold text-[#231E1B] mt-1">
                  {invitations.length}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Faol loyihalar</span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">
                  {t.dashboard.totalGuests}
                </span>
                <div className="font-playfair text-3xl font-extrabold text-[#D9658B] mt-1">
                  {rsvpStats.totalGuests}
                </div>
                <span className="text-[11px] text-[#7A6A63]">Tasdiqlangan mehmonlar</span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">
                  {t.dashboard.rsvpResponses}
                </span>
                <div className="font-playfair text-3xl font-extrabold text-[#3B6B88] mt-1">
                  {rsvpStats.total}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {rsvpStats.acceptanceRate}% qatnashish darajasi
                </span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">
                  {t.dashboard.drafts}
                </span>
                <div className="font-playfair text-3xl font-extrabold text-[#B48B47] mt-1">
                  {invitations.filter((i) => i.status === 'draft').length}
                </div>
                <span className="text-[11px] text-[#7A6A63]">Tahrir kutilayotgan</span>
              </div>
            </div>

            {/* Quick Invitation Preview Row */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/95 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  Mening so‘nggi taklifnomalarim
                </h3>
                <Link
                  to="/dashboard/invitations"
                  className="text-xs font-semibold text-[#D9658B] hover:underline"
                >
                  Barchasini ko‘rish →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitations.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-white/70 border border-black/5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="uppercase text-[#8A7C74]">{inv.eventType}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            inv.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {inv.status === 'published' ? 'Faol' : 'Qoralama'}
                        </span>
                      </div>
                      <h4 className="font-playfair text-base font-bold text-[#231E1B] mt-1">
                        {inv.hostNames}
                      </h4>
                      <p className="text-[11px] text-[#5C4F48] mt-0.5">
                        {inv.eventDate} • {inv.venueName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-black/5 text-xs">
                      <Link
                        to={`/i/${inv.slug}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[#231E1B] text-white text-center font-semibold hover:bg-black transition-colors"
                      >
                        Ochish
                      </Link>
                      <button
                        onClick={() =>
                          setShareData({
                            url: `/i/${inv.slug}`,
                            title: `${inv.hostNames} — ${inv.eventType}`,
                          })
                        }
                        className="p-1.5 rounded-xl glass-panel hover:bg-white text-[#5C4F48]"
                        title="Ulashish"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY INVITATIONS */}
        {activeTab === 'invitations' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                  Mening Taklifnomalarim
                </h2>
                <p className="text-xs text-[#7A6A63]">
                  Jami {invitations.length} ta yaratilgan taklifnoma
                </p>
              </div>

              {/* View Switcher: Grid / List */}
              <div className="flex items-center gap-1 glass-panel p-1 rounded-xl border border-black/5">
                <button
                  onClick={() => setInvitationViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    invitationViewMode === 'grid' ? 'bg-white shadow-xs text-[#231E1B]' : 'text-[#7A6A63]'
                  }`}
                  aria-label="Katak ko‘rinishi"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInvitationViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    invitationViewMode === 'list' ? 'bg-white shadow-xs text-[#231E1B]' : 'text-[#7A6A63]'
                  }`}
                  aria-label="Ro‘yxat ko‘rinishi"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {invitations.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                <Calendar className="w-10 h-10 text-[#8A7C74] mx-auto" />
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  {t.dashboard.emptyInvitations}
                </h3>
                <Link
                  to="/templates"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#231E1B] text-white text-xs font-semibold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Taklifnoma yaratish</span>
                </Link>
              </div>
            ) : invitationViewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {inv.coverImage && (
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={inv.coverImage}
                            alt={inv.hostNames}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                              inv.status === 'published'
                                ? 'bg-emerald-600/90 text-white'
                                : 'bg-amber-500/90 text-white'
                            }`}
                          >
                            {inv.status === 'published' ? 'Faol' : 'Qoralama'}
                          </span>
                        </div>
                      )}

                      <div className="p-5 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-[#8A7C74]">
                          {inv.eventType}
                        </span>
                        <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                          {inv.hostNames}
                        </h3>
                        <p className="text-xs text-[#5C4F48]">
                          {inv.eventDate} ({inv.startTime}) • {inv.venueName}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-black/5 mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/i/${inv.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-[#231E1B] text-white font-semibold hover:bg-black transition-colors"
                        >
                          Ko‘rish
                        </Link>
                        <Link
                          to={`/create/${inv.templateSlug}`}
                          className="p-2 rounded-xl glass-panel hover:bg-white text-[#5C4F48]"
                          title="Tahrirlash"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(inv)}
                          className="p-2 rounded-xl glass-panel hover:bg-white text-[#5C4F48]"
                          title="Nusxa olish"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setShareData({
                              url: `/i/${inv.slug}`,
                              title: `${inv.hostNames} — ${inv.eventType}`,
                            })
                          }
                          className="p-2 rounded-xl glass-panel hover:bg-white text-[#5C4F48]"
                          title="Ulashish / QR kod"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setInvitationToDelete(inv)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                      <th className="py-3 px-4 font-bold text-[#231E1B]">Taklifnoma</th>
                      <th className="py-3 px-4 font-bold">Sana</th>
                      <th className="py-3 px-4 font-bold">Holat</th>
                      <th className="py-3 px-4 text-right font-bold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/40">
                        <td className="py-3 px-4">
                          <strong className="text-[#231E1B] block">{inv.hostNames}</strong>
                          <span className="text-[11px] text-[#8A7C74]">{inv.eventType}</span>
                        </td>
                        <td className="py-3 px-4 text-[#5C4F48]">{inv.eventDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status === 'published' ? 'Faol' : 'Qoralama'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/i/${inv.slug}`}
                              className="px-2.5 py-1 rounded-lg bg-[#231E1B] text-white font-semibold"
                            >
                              Ko‘rish
                            </Link>
                            <Link
                              to={`/create/${inv.templateSlug}`}
                              className="p-1.5 rounded-lg glass-panel hover:bg-white"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDuplicate(inv)}
                              className="p-1.5 rounded-lg glass-panel hover:bg-white"
                              title="Nusxa olish"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInvitationToDelete(inv)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* TAB 3: GUESTS (RSVP RESPONSES) */}
        {activeTab === 'guests' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                  Mehmonlar Ro‘yxati (RSVP)
                </h2>
                <p className="text-xs text-[#7A6A63]">
                  Mehmonlarning qatnashish tasdig‘i va ezgu tilaklari
                </p>
              </div>

              {/* Status Filter & CSV Export */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setGuestFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      guestFilterStatus === 'all'
                        ? 'bg-[#231E1B] text-white'
                        : 'glass-panel text-[#5C4F48]'
                    }`}
                  >
                    Barchasi ({guests.length})
                  </button>
                  <button
                    onClick={() => setGuestFilterStatus('attending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      guestFilterStatus === 'attending'
                        ? 'bg-emerald-700 text-white'
                        : 'glass-panel text-emerald-800'
                    }`}
                  >
                    Keladi ({rsvpStats.attendingCount})
                  </button>
                  <button
                    onClick={() => setGuestFilterStatus('declined')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      guestFilterStatus === 'declined'
                        ? 'bg-rose-700 text-white'
                        : 'glass-panel text-rose-800'
                    }`}
                  >
                    Kela olmaydi ({rsvpStats.declinedCount})
                  </button>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/90 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs transition-colors"
                  title="Excel (CSV) formatida yuklab olish"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel (CSV)</span>
                </button>
              </div>
            </div>

            {/* Guest Search bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[#8A7C74] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Mehmon ismi yoki telefoni bo‘yicha qidirish..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5"
              />
            </div>

            {/* Guests Table */}
            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                      <th className="py-3 px-4 font-bold text-[#231E1B]">Mehmon</th>
                      <th className="py-3 px-4 font-bold">Telefon</th>
                      <th className="py-3 px-4 font-bold">Holat</th>
                      <th className="py-3 px-4 font-bold">Kishi soni</th>
                      <th className="py-3 px-4 font-bold">Taom afzalligi</th>
                      <th className="py-3 px-4 font-bold">Tilak va tabrik</th>
                      <th className="py-3 px-4 font-bold text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredGuests.map((g) => (
                      <tr key={g.id} className="hover:bg-white/40">
                        <td className="py-3 px-4 font-bold text-[#231E1B]">
                          {g.fullName}
                        </td>
                        <td className="py-3 px-4 text-[#5C4F48]">{g.phone || '—'}</td>
                        <td className="py-3 px-4">
                          {g.attending ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Keladi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>Kela olmaydi</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#231E1B]">
                          {g.attending ? `${g.guestCount} kishi` : '0'}
                        </td>
                        <td className="py-3 px-4 text-[#5C4F48]">
                          {g.mealPreference || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#5C4F48] max-w-xs truncate italic">
                          {g.message ? `"${g.message}"` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                Buyurtmalar Tarixi
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Xarid qilingan xizmatlar va demo to‘lov yozuvlari
              </p>
            </div>

            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                      <th className="py-3 px-4 font-bold text-[#231E1B]">Buyurtma №</th>
                      <th className="py-3 px-4 font-bold">Xizmat</th>
                      <th className="py-3 px-4 font-bold">Tarif</th>
                      <th className="py-3 px-4 font-bold">Sana</th>
                      <th className="py-3 px-4 font-bold">Qiymat</th>
                      <th className="py-3 px-4 font-bold">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/40">
                        <td className="py-3 px-4 font-mono font-bold text-[#231E1B]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#231E1B]">
                          {ord.serviceName}
                        </td>
                        <td className="py-3 px-4 text-[#5C4F48]">{ord.planName}</td>
                        <td className="py-3 px-4 text-[#7A6A63]">{ord.date}</td>
                        <td className="py-3 px-4 font-bold text-[#231E1B]">
                          {formatPriceUZS(ord.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'demo'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-md space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                Kabinet Sozlamalari
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Shaxsiy profil va interfeys parametrlarini sozlang
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">Ism va familiya</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">Telefon raqam</label>
                <PhoneInput
                  value={profilePhone}
                  onChange={(fullVal) => setProfilePhone(fullVal)}
                />
              </div>

              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">Elektron pochta</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">Asosiy til</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                >
                  <option value="uz">O‘zbekcha (Lotin)</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#231E1B] text-white font-bold text-xs hover:bg-black transition-colors"
                >
                  O‘zgarishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {invitationToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-6 shadow-2xl border border-white/95 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 mx-auto flex items-center justify-center text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                Taklifnomani o‘chirasizmi?
              </h3>
              <p className="text-xs text-[#7A6A63]">
                «{invitationToDelete.hostNames}» taklifnomasi butunlay o‘chiriladi va uning havolasi ishlamay qoladi.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setInvitationToDelete(null)}
                  className="py-2.5 px-3 rounded-xl glass-panel text-xs font-semibold text-[#5C4F48] hover:bg-white"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  O‘chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {shareData && (
          <ShareModal
            url={shareData.url}
            title={shareData.title}
            onClose={() => setShareData(null)}
          />
        )}
      </div>
    </div>
  );
};
