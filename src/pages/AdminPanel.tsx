import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../locales';
import { api } from '../services/api';
import { mockTemplates } from '../data/mockTemplates';
import { mockOrders } from '../data/mockOrders';
import { mockPlans } from '../data/mockPlans';
import { mockFaq } from '../data/mockFaq';
import { Template, OrderItem, PricingPlan, FAQItem, ContactMessage } from '../types';
import { formatPriceUZS } from '../utils/logic';
import { AdminPasscodeModal } from '../components/AdminPasscodeModal';
import {
  Shield,
  Lock,
  Unlock,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  X,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { path, navigate } = useRouter();
  const { isAdminUnlocked, lockAdmin, showToast } = useAuth();
  const { language, t } = useLanguage();

  // If locked, render the passcode screen (Passcode: 3580)
  if (!isAdminUnlocked) {
    return <AdminPasscodeModal />;
  }

  // Active sub-route tab
  const activeTab = useMemo(() => {
    if (path.includes('/admin/templates')) return 'templates';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/customers')) return 'customers';
    if (path.includes('/admin/plans')) return 'plans';
    if (path.includes('/admin/payments')) return 'payments';
    if (path.includes('/admin/content')) return 'content';
    return 'overview';
  }, [path]);

  // Data states
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);
  const [plans, setPlans] = useState<PricingPlan[]>(mockPlans);
  const [faqList, setFaqList] = useState<FAQItem[]>(mockFaq);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Real-time synchronization
  useEffect(() => {
    async function loadAdminData() {
      const [tList, oList, mList] = await Promise.all([
        api.getTemplates(),
        api.getOrders(),
        api.getContactMessages(),
      ]);
      setTemplates(tList);
      setOrders(oList);
      setMessages(mList);
    }
    loadAdminData();

    const unsubTpl = api.subscribe<Template[]>('templates', (data) => setTemplates(data));
    const unsubOrd = api.subscribe<OrderItem[]>('orders', (data) => setOrders(data));
    const unsubMsg = api.subscribe<ContactMessage[]>('messages', (data) => setMessages(data));

    return () => {
      unsubTpl();
      unsubOrd();
      unsubMsg();
    };
  }, []);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Add Template Modal State
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCategory, setNewTplCategory] = useState<any>('weddings');
  const [newTplPrice, setNewTplPrice] = useState(160000);
  const [newTplImage, setNewTplImage] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  );

  // Content CMS States
  const [cmsHeroTitle, setCmsHeroTitle] = useState('Har bir lahzaga o‘zgacha taklif.');
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState(
    'To‘y, fotixa to‘yi, beshik to‘y, yubiley va boshqa barcha bayramlaringiz uchun mehmonlaringizni lol qoldiradigan interaktiv taklifnoma yarating.'
  );

  // Order status update
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderItem['status']) => {
    await api.updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Buyurtma holati «${newStatus}» ga yangilandi`, 'success');
  };

  // Add template handler
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;

    const newTpl: Template = {
      id: `tpl-${Date.now()}`,
      slug: newTplName.toLowerCase().replace(/\s+/g, '-'),
      name: newTplName,
      category: newTplCategory,
      price: newTplPrice,
      previewImage: newTplImage,
      description: {
        uz: `${newTplName} yangi shabloni`,
        ru: `Новый шаблон ${newTplName}`,
        en: `New template ${newTplName}`,
      },
      features: {
        uz: ['Zarhal muqova', 'Interaktiv xarita', 'Fotoalbom'],
        ru: ['Золотая обложка', 'Карта', 'Фотоальбом'],
        en: ['Gold cover', 'Map', 'Photo gallery'],
      },
      colorStyle: {
        primary: '#B48B47',
        secondary: '#F5EBDD',
        accent: '#B9DFFA',
        background: '#FAF6F0',
        text: '#231E1B',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Plus Jakarta Sans',
      },
      suitableFor: {
        uz: ['To‘y', 'Marosim'],
        ru: ['Свадьба'],
        en: ['Wedding'],
      },
      isNew: true,
    };

    await api.addTemplate(newTpl);
    setShowAddTemplateModal(false);
    setNewTplName('');
    showToast(`«${newTpl.name}» shabloni muvaffaqiyatli saqlandi!`, 'success');
  };

  // Delete template
  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Ushbu shablonni o‘chirishni xohlaysizmi?')) {
      await api.deleteTemplate(id);
      showToast('Shablon o‘chirildi', 'info');
    }
  };

  const handleMessageStatusChange = async (msgId: string, newStatus: ContactMessage['status']) => {
    await api.updateContactMessageStatus(msgId, newStatus);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: newStatus } : m))
    );
    showToast('Xabar holati yangilandi', 'success');
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchQuery =
        ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.serviceName.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus =
        orderStatusFilter === 'all' || ord.status === orderStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Mock customers list derived from orders
  const mockCustomers = [
    { id: 'c1', name: 'Nodirbek Salimov', phone: '+998 90 987 65 43', ordersCount: 2, totalSpent: 390000, status: 'Faol' },
    { id: 'c2', name: 'Nilufar Usmonova', phone: '+998 97 123 45 67', ordersCount: 1, totalSpent: 450000, status: 'Faol' },
    { id: 'c3', name: 'Jasur To‘xtayev', phone: '+998 93 111 22 33', ordersCount: 1, totalSpent: 150000, status: 'Faol' },
    { id: 'c4', name: 'Bekzod & Madina', phone: '+998 99 444 55 66', ordersCount: 1, totalSpent: 590000, status: 'Yangi' },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F4F1EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Bar */}
        <div className="glass-panel-elevated rounded-3xl p-5 border border-white/95 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#231E1B] to-[#3A2D28] flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold text-[#231E1B]">
                Taklifim Admin Paneli
              </h1>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Himoyalangan tizim (Admin sessiyasi faol)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={lockAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Qulflash"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Chiqish / Qulflash</span>
            </button>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3E39] glass-panel hover:bg-white"
            >
              Saytga o‘tish
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-black/5">
          {[
            { id: 'overview', path: '/admin', label: 'Boshqaruv (Overview)' },
            { id: 'templates', path: '/admin/templates', label: `Shablonlar (${templates.length})` },
            { id: 'orders', path: '/admin/orders', label: `Buyurtmalar (${orders.length})` },
            { id: 'customers', path: '/admin/customers', label: `Mijozlar (${mockCustomers.length})` },
            { id: 'plans', path: '/admin/plans', label: 'Tariflar (Plans)' },
            { id: 'payments', path: '/admin/payments', label: 'To‘lovlar (Demo)' },
            { id: 'content', path: '/admin/content', label: 'Sayt matnlari (CMS)' },
          ].map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#231E1B] text-white shadow-xs'
                  : 'glass-panel text-[#5C4F48] hover:bg-white border border-black/5'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Faol Shablonlar</span>
                <div className="font-playfair text-3xl font-extrabold text-[#231E1B] mt-1">
                  {templates.length} ta
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Barchasi ko‘rinmoqda</span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Jami Buyurtmalar</span>
                <div className="font-playfair text-3xl font-extrabold text-[#D9658B] mt-1">
                  {orders.length} ta
                </div>
                <span className="text-[11px] text-sky-600 font-medium">Demo buyurtmalar</span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Mijozlar Soni</span>
                <div className="font-playfair text-3xl font-extrabold text-[#3B6B88] mt-1">
                  {mockCustomers.length}
                </div>
                <span className="text-[11px] text-[#7A6A63]">Faol akkauntlar</span>
              </div>

              <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#8A7C74]">Jami Tushum</span>
                <div className="font-playfair text-2xl font-extrabold text-[#B48B47] mt-1">
                  {formatPriceUZS(orders.reduce((sum, o) => sum + (o.price || 0), 0))}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Haqiqiy buyurtmalar hisobida</span>
              </div>
            </div>

            {/* Mock Chart & Recent Orders Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Mock Bar Chart */}
              <div className="lg:col-span-7 glass-panel-elevated rounded-3xl p-6 border border-white/95 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                      Haftalik Tashriflar va RSVP Dinamikasi
                    </h3>
                    <p className="text-[11px] text-[#7A6A63]">Ko‘rishlar soni o‘sish ko‘rsatkichi</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-[#8A7C74]" />
                </div>

                {/* Simulated SVG Bar chart */}
                <div className="pt-4 flex items-end justify-between h-44 border-b border-black/10 px-2">
                  {[
                    { day: 'Dush', h: '65%' },
                    { day: 'Sesh', h: '80%' },
                    { day: 'Chor', h: '50%' },
                    { day: 'Pay', h: '95%' },
                    { day: 'Juma', h: '88%' },
                    { day: 'Shan', h: '100%' },
                    { day: 'Yak', h: '92%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 sm:w-10 rounded-t-xl bg-gradient-to-t from-[#B48B47] to-[#F5C9D8] transition-all hover:opacity-80"
                        style={{ height: bar.h }}
                      />
                      <span className="text-[10px] font-bold text-[#8A7C74]">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="lg:col-span-5 glass-panel-elevated rounded-3xl p-6 border border-white/95 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                    So‘nggi Buyurtmalar
                  </h3>
                  <Link to="/admin/orders" className="text-xs font-semibold text-[#D9658B] hover:underline">
                    Barchasi →
                  </Link>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="p-3 rounded-2xl bg-white/70 border border-black/5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#231E1B] block">{ord.customerName}</strong>
                        <span className="text-[10px] text-[#8A7C74]">{ord.serviceName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#231E1B] block">{formatPriceUZS(ord.price)}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATES MANAGEMENT */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                  Shablonlar Boshqaruvi
                </h2>
                <p className="text-xs text-[#7A6A63]">
                  Yangi shablonlar qo‘shish, tahrirlash va narxlarni boshqarish
                </p>
              </div>

              <button
                onClick={() => setShowAddTemplateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#231E1B] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi shablon qo‘shish</span>
              </button>
            </div>

            {/* Templates Table */}
            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                    <th className="py-3 px-4 font-bold text-[#231E1B]">Shablon</th>
                    <th className="py-3 px-4 font-bold">Toifa</th>
                    <th className="py-3 px-4 font-bold">Narxi</th>
                    <th className="py-3 px-4 font-bold">Holat</th>
                    <th className="py-3 px-4 text-right font-bold">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-white/40">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={tpl.previewImage}
                          alt={tpl.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <strong className="text-[#231E1B] block">{tpl.name}</strong>
                          <span className="text-[10px] text-[#8A7C74]">/{tpl.slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase text-[#5C4F48] font-semibold">{tpl.category}</td>
                      <td className="py-3 px-4 font-bold text-[#231E1B]">{formatPriceUZS(tpl.price)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Faol
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/templates/${tpl.slug}`}
                            className="px-2.5 py-1 rounded-lg bg-[#231E1B] text-white font-semibold"
                          >
                            Ko‘rish
                          </Link>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
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
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                  Buyurtmalar Boshqaruvi
                </h2>
                <p className="text-xs text-[#7A6A63]">
                  Barcha mijoz buyurtmalari va holatlarini boshqarish
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    orderStatusFilter === 'all' ? 'bg-[#231E1B] text-white' : 'glass-panel text-[#5C4F48]'
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setOrderStatusFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    orderStatusFilter === 'confirmed' ? 'bg-emerald-700 text-white' : 'glass-panel text-emerald-800'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setOrderStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    orderStatusFilter === 'pending' ? 'bg-amber-700 text-white' : 'glass-panel text-amber-800'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                      <th className="py-3 px-4 font-bold text-[#231E1B]">№ Buyurtma</th>
                      <th className="py-3 px-4 font-bold">Mijoz</th>
                      <th className="py-3 px-4 font-bold">Xizmat turi</th>
                      <th className="py-3 px-4 font-bold">Sana</th>
                      <th className="py-3 px-4 font-bold">Narxi</th>
                      <th className="py-3 px-4 font-bold">Holat</th>
                      <th className="py-3 px-4 text-right font-bold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/40">
                        <td className="py-3 px-4 font-mono font-bold text-[#231E1B]">{ord.orderNumber}</td>
                        <td className="py-3 px-4">
                          <strong className="text-[#231E1B] block">{ord.customerName}</strong>
                          <span className="text-[10px] text-[#7A6A63]">{ord.customerPhone}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#231E1B]">{ord.serviceName}</td>
                        <td className="py-3 px-4 text-[#7A6A63]">{ord.date}</td>
                        <td className="py-3 px-4 font-bold text-[#231E1B]">{formatPriceUZS(ord.price)}</td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as any)}
                            className="bg-white border border-black/10 rounded-lg px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                          >
                            <option value="pending">pending</option>
                            <option value="confirmed">confirmed</option>
                            <option value="demo">demo</option>
                            <option value="completed">completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => showToast(`Buyurtma ma’lumoti: ${ord.serviceName} (${ord.customerName})`, 'info')}
                            className="text-xs font-semibold text-[#D9658B] hover:underline"
                          >
                            Batafsil
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

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                Mijozlar Ro‘yxati
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Platformadan ro‘yxatdan o‘tgan barcha mijozlar statistikasi
              </p>
            </div>

            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                    <th className="py-3 px-4 font-bold text-[#231E1B]">Mijoz</th>
                    <th className="py-3 px-4 font-bold">Telefon</th>
                    <th className="py-3 px-4 font-bold">Buyurtmalar</th>
                    <th className="py-3 px-4 font-bold">Jami tushum</th>
                    <th className="py-3 px-4 font-bold">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {mockCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-white/40">
                      <td className="py-3 px-4 font-bold text-[#231E1B]">{cust.name}</td>
                      <td className="py-3 px-4 text-[#5C4F48]">{cust.phone}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#231E1B]">{cust.ordersCount} ta</td>
                      <td className="py-3 px-4 font-bold text-[#231E1B]">{formatPriceUZS(cust.totalSpent)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {cust.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Customer Inquiries / Messages from Contact page */}
            <div className="pt-6 space-y-4">
              <div>
                <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                  Kelib tushgan murojaatlar va savollar
                </h3>
                <p className="text-xs text-[#7A6A63]">
                  Aloqa sahifasidan foydalanuvchilar tomonidan yuborilgan real vaqtdagi xabarlar
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="p-8 text-center glass-panel rounded-2xl text-xs text-[#7A6A63]">
                  Hozircha yangi murojaatlar yo‘q
                </div>
              ) : (
                <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                        <th className="py-3 px-4 font-bold text-[#231E1B]">Mijoz</th>
                        <th className="py-3 px-4 font-bold">Aloqa (Tel/Email)</th>
                        <th className="py-3 px-4 font-bold">Mavzu</th>
                        <th className="py-3 px-4 font-bold">Xabar</th>
                        <th className="py-3 px-4 font-bold">Vaqti</th>
                        <th className="py-3 px-4 font-bold">Holat</th>
                        <th className="py-3 px-4 font-bold text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-white/40">
                          <td className="py-3 px-4 font-bold text-[#231E1B]">{msg.name}</td>
                          <td className="py-3 px-4 text-[#5C4F48]">{msg.contact}</td>
                          <td className="py-3 px-4 font-semibold text-[#231E1B]">{msg.subject || 'Umumiy'}</td>
                          <td className="py-3 px-4 text-[#5C4F48] max-w-xs">{msg.message}</td>
                          <td className="py-3 px-4 text-[11px] text-[#7A6A63]">{msg.createdAt}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                msg.status === 'new'
                                  ? 'bg-amber-100 text-amber-800'
                                  : msg.status === 'read'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {msg.status === 'new' ? 'Yangi' : msg.status === 'read' ? 'O‘qildi' : 'Javob berildi'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() =>
                                handleMessageStatusChange(
                                  msg.id,
                                  msg.status === 'new' ? 'read' : msg.status === 'read' ? 'replied' : 'new'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg glass-panel hover:bg-white text-[11px] font-semibold text-[#231E1B]"
                            >
                              Holatni o‘zgartirish
                            </button>
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

        {/* TAB 5: PLANS & PRICING */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                Tariflar Boshqaruvi
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Narxlarni va tarif imkoniyatlarini tahrirlash
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((pl) => (
                <div key={pl.id} className="glass-panel-elevated rounded-3xl p-6 border border-white/95 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-playfair text-lg font-bold text-[#231E1B]">{pl.name.uz}</h3>
                    {pl.isPopular && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F5C9D8] text-[10px] font-bold">
                        Ommabop
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8A7C74] uppercase block mb-1">
                      Narxi (UZS)
                    </label>
                    <input
                      type="number"
                      value={pl.price}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPlans((prev) => prev.map((p) => (p.id === pl.id ? { ...p, price: val } : p)));
                      }}
                      className="w-full p-2 rounded-xl glass-panel text-sm font-bold border border-black/10"
                    />
                  </div>
                  <button
                    onClick={() => showToast(`«${pl.name.uz}» tarifi narxi saqlandi`, 'success')}
                    className="w-full py-2 rounded-xl bg-[#231E1B] text-white text-xs font-bold hover:bg-black"
                  >
                    Saqlash
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                To‘lovlar Tarixi (Demonstratsiya)
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Platformadagi simulyatsiya qilingan to‘lov operatsiyalari ro‘yxati
              </p>
            </div>

            <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/95 shadow-md">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-black/10 text-[#7A6A63] bg-black/5">
                    <th className="py-3 px-4 font-bold text-[#231E1B]">Tranzaksiya №</th>
                    <th className="py-3 px-4 font-bold">Mijoz</th>
                    <th className="py-3 px-4 font-bold">Sana</th>
                    <th className="py-3 px-4 font-bold">Qiymat</th>
                    <th className="py-3 px-4 font-bold">Usul</th>
                    <th className="py-3 px-4 font-bold">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {[
                    { id: 'tx-1', no: 'TXN-94821', name: 'Nodirbek Salimov', date: '2026-06-15', amount: 240000, method: 'Payme (Demo)', status: 'Muvaffaqiyatli' },
                    { id: 'tx-2', no: 'TXN-94822', name: 'Nilufar Usmonova', date: '2026-07-02', amount: 450000, method: 'Click (Demo)', status: 'Muvaffaqiyatli' },
                    { id: 'tx-3', no: 'TXN-94823', name: 'Jasur To‘xtayev', date: '2026-07-01', amount: 150000, method: 'Uzum Bank (Demo)', status: 'Muvaffaqiyatli' },
                  ].map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#231E1B]">{tx.no}</td>
                      <td className="py-3 px-4 font-semibold text-[#231E1B]">{tx.name}</td>
                      <td className="py-3 px-4 text-[#7A6A63]">{tx.date}</td>
                      <td className="py-3 px-4 font-bold text-[#231E1B]">{formatPriceUZS(tx.amount)}</td>
                      <td className="py-3 px-4 text-[#5C4F48]">{tx.method}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CONTENT MANAGEMENT (CMS) */}
        {activeTab === 'content' && (
          <div className="max-w-2xl mx-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-md space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#231E1B]">
                Sayt Matnlari (CMS)
              </h2>
              <p className="text-xs text-[#7A6A63]">
                Bosh sahifa shiori va sarlavhalarini tahrirlash
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">
                  Bosh sahifa asosiy sarlavhasi
                </label>
                <input
                  type="text"
                  value={cmsHeroTitle}
                  onChange={(e) => setCmsHeroTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3A2D28] block mb-1">
                  Bosh sahifa matni (Subtitle)
                </label>
                <textarea
                  rows={3}
                  value={cmsHeroSubtitle}
                  onChange={(e) => setCmsHeroSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel border border-black/10 outline-none text-[#231E1B]"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast('CMS matnlari muvaffaqiyatli saqlandi!', 'success')}
                className="w-full py-3 rounded-2xl bg-[#231E1B] text-white font-bold text-xs hover:bg-black transition-colors"
              >
                O‘zgarishlarni saqlash
              </button>
            </div>
          </div>
        )}

        {/* ADD TEMPLATE MODAL */}
        {showAddTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 shadow-2xl border border-white/95 relative space-y-4">
              <button
                onClick={() => setShowAddTemplateModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-black/5 text-[#7A6A63]"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
                Yangi Shablon Qo‘shish
              </h3>

              <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">Shablon nomi</label>
                  <input
                    type="text"
                    required
                    value={newTplName}
                    onChange={(e) => setNewTplName(e.target.value)}
                    placeholder="Masalan: Magnolia Elegance"
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">Toifasi</label>
                  <select
                    value={newTplCategory}
                    onChange={(e) => setNewTplCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10"
                  >
                    <option value="weddings">To‘y va Nikoh</option>
                    <option value="engagements">Fotixa / Unashtiruv</option>
                    <option value="birthdays">Tug‘ilgan kun / Yubiley</option>
                    <option value="traditional">Milliy marosimlar</option>
                    <option value="baby_showers">Beshik to‘y</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">Narxi (UZS)</label>
                  <input
                    type="number"
                    value={newTplPrice}
                    onChange={(e) => setNewTplPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#3A2D28] block mb-1">Rasm URL</label>
                  <input
                    type="text"
                    value={newTplImage}
                    onChange={(e) => setNewTplImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-panel border border-black/10"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#231E1B] text-white font-bold hover:bg-black"
                  >
                    Shablonni Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
