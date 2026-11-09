import {
  Template,
  InvitationData,
  GuestRSVP,
  OrderItem,
  ContactMessage,
  Testimonial,
} from '../types';
import { mockTemplates } from '../data/mockTemplates';
import { mockInvitations } from '../data/mockInvitations';
import { mockGuests } from '../data/mockGuests';
import { mockOrders } from '../data/mockOrders';
import { mockTestimonials } from '../data/mockFaq';
import { isFirebaseConfigured, db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

// Storage keys
const STORAGE_KEY_INVITATIONS = 'taklifim_demo_invitations';
const STORAGE_KEY_GUESTS = 'taklifim_demo_guests';
const STORAGE_KEY_ORDERS = 'taklifim_demo_orders';
const STORAGE_KEY_TEMPLATES = 'taklifim_demo_templates';
const STORAGE_KEY_MESSAGES = 'taklifim_demo_messages';
const STORAGE_KEY_TESTIMONIALS = 'taklifim_demo_testimonials';

// Initial contact messages
const initialMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Dilshod Raxmatov',
    contact: '+998 90 777 88 99',
    subject: 'Maxsus dizayn taklifnomasi',
    message: 'Assalomu alaykum! Bizga alohida monogrammali maxsus to‘y taklifnomasi kerak edi. Qanday bog‘lansak bo‘ladi?',
    status: 'new',
    createdAt: '2026-10-26 15:30',
  },
  {
    id: 'msg-2',
    name: 'Madina Alimova',
    contact: 'madina.alimova@gmail.com',
    subject: 'Video taklifnoma buyurtmasi',
    message: 'Beshik to‘yi uchun 4K video rolik tayyorlash muddatlari qanday?',
    status: 'read',
    createdAt: '2026-10-25 11:20',
  },
];

// Helper functions for Local Storage
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return fallback;
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Strip undefined fields and oversized payload for Firestore (Firestore crashes on undefined values and >1MB payload)
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const cloned = JSON.parse(JSON.stringify(data));
  // If base64 music is huge (>500KB), don't break Firestore doc limit
  if (cloned.musicFileData && typeof cloned.musicFileData === 'string' && cloned.musicFileData.length > 500000) {
    delete cloned.musicFileData;
  }
  return cloned;
}

// Timeout wrapper so network/offline Firestore never blocks UI completely, but with sufficient 8s budget
async function safeFirestore<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T | null> {
  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    console.warn('Firestore safe operation caught error or timed out:', err);
    return null;
  }
}

// REAL-TIME BROADCAST CHANNEL & EVENT BUS
type EventType = 'invitations' | 'guests' | 'orders' | 'templates' | 'messages' | 'testimonials';
type Listener<T = any> = (data: T) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<EventType, Set<Listener>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('taklifim_realtime_hub');
        this.channel.onmessage = (event) => {
          const { type, payload } = event.data;
          this.notifyLocally(type, payload);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted:', e);
      }
    }

    // Storage fallback for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (!e.key) return;
        if (e.key === STORAGE_KEY_INVITATIONS) this.notifyLocally('invitations', getStored(STORAGE_KEY_INVITATIONS, []));
        if (e.key === STORAGE_KEY_GUESTS) this.notifyLocally('guests', getStored(STORAGE_KEY_GUESTS, []));
        if (e.key === STORAGE_KEY_ORDERS) this.notifyLocally('orders', getStored(STORAGE_KEY_ORDERS, mockOrders));
        if (e.key === STORAGE_KEY_TEMPLATES) this.notifyLocally('templates', getStored(STORAGE_KEY_TEMPLATES, mockTemplates));
        if (e.key === STORAGE_KEY_MESSAGES) this.notifyLocally('messages', getStored(STORAGE_KEY_MESSAGES, initialMessages));
        if (e.key === STORAGE_KEY_TESTIMONIALS) this.notifyLocally('testimonials', getStored(STORAGE_KEY_TESTIMONIALS, mockTestimonials));
      });
    }
  }

  public subscribe<T = any>(type: EventType, listener: Listener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  public emit(type: EventType, payload: any): void {
    this.notifyLocally(type, payload);
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {
        // ignore
      }
    }
  }

  private notifyLocally(type: EventType, payload: any): void {
    const list = this.listeners.get(type);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error('Error in realtime listener:', err);
        }
      });
    }
  }
}

export const realtimeHub = new RealtimeHub();

// UNIFIED API IMPLEMENTATION
export const api = {
  // Realtime subscription helper
  subscribe<T = any>(type: EventType, callback: (data: T) => void): () => void {
    // If Firebase is active and Firestore is connected
    if (isFirebaseConfigured() && db) {
      try {
        const q = collection(db, type);
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const list: any[] = [];
              snapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
              });
              callback(list as unknown as T);
            }
          },
          (err) => {
            console.warn('Firestore snapshot subscription note:', err.message);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn('Firestore subscription failed, falling back to local realtime hub:', err);
      }
    }

    // Default: in-browser Real-Time Hub (Cross-tab broadcast)
    return realtimeHub.subscribe<T>(type, callback);
  },

  // -------------------------------------------------------------
  // TEMPLATES
  // -------------------------------------------------------------
  async getTemplates(): Promise<Template[]> {
    if (isFirebaseConfigured() && db) {
      const snap = await safeFirestore(getDocs(collection(db, 'templates')), 1500);
      if (snap && !snap.empty) {
        const list: Template[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Template));
        return list;
      }
    }
    return getStored<Template[]>(STORAGE_KEY_TEMPLATES, mockTemplates);
  },

  async getTemplateBySlug(slug: string): Promise<Template | null> {
    const list = await this.getTemplates();
    return list.find((t) => t.slug === slug) || null;
  },

  async addTemplate(template: Template): Promise<Template> {
    const templates = await this.getTemplates();
    const updated = [template, ...templates.filter((t) => t.id !== template.id)];
    setStored(STORAGE_KEY_TEMPLATES, updated);
    realtimeHub.emit('templates', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(setDoc(doc(db, 'templates', template.id), sanitizeForFirestore(template)), 2000);
    }
    return template;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.getTemplates();
    const updated = templates.filter((t) => t.id !== id);
    setStored(STORAGE_KEY_TEMPLATES, updated);
    realtimeHub.emit('templates', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(deleteDoc(doc(db, 'templates', id)), 2000);
    }
    return true;
  },

  // -------------------------------------------------------------
  // INVITATIONS
  // -------------------------------------------------------------
  async getInvitations(userId?: string): Promise<InvitationData[]> {
    if (isFirebaseConfigured() && db) {
      try {
        // Agar userId berilsa, faqat shu userId ga tegishli taklifnomalarni olish
        const col = collection(db, 'invitations');
        const q = userId ? query(col, where('ownerId', '==', userId)) : col;
        const snap = await safeFirestore(getDocs(q as any), 1500);
        if (snap && !snap.empty) {
          const list: InvitationData[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Record<string, any>) } as InvitationData));
          return list;
        }
      } catch (err) {
        console.warn('Firestore getInvitations error, falling back to local storage:', err);
      }
    }
    // Local storage dan olish
    const list = getStored<InvitationData[]>(STORAGE_KEY_INVITATIONS, []);
    // userId berilsa, faqat shu userId ga tegishli taklifnomalarni qaytarish (mock ko'rsatmaslik)
    if (userId) {
      return list.filter((inv) => inv.ownerId === userId);
    }
    return list;
  },

  async getInvitationBySlug(slug: string): Promise<InvitationData | null> {
    // 1. First check local storage for instantaneous load
    const list = getStored<InvitationData[]>(STORAGE_KEY_INVITATIONS, []);
    const localMatch = list.find((inv) => inv.slug === slug || inv.id === slug);
    if (localMatch) {
      return localMatch;
    }

    // 2. Public lookup from Firestore (when opened on another device/browser)
    if (isFirebaseConfigured() && db) {
      try {
        const col = collection(db, 'invitations');
        const q = query(col, where('slug', '==', slug));
        const snap = await safeFirestore(getDocs(q as any), 8000);
        if (snap && !snap.empty) {
          const d = snap.docs[0];
          const found = { id: d.id, ...(d.data() as Record<string, any>) } as InvitationData;
          // Cache locally for faster repeat views
          const updated = [found, ...list.filter((i) => i.id !== found.id)];
          setStored(STORAGE_KEY_INVITATIONS, updated);
          return found;
        }

        // Also fallback lookup by document ID
        const docRef = doc(db, 'invitations', slug);
        const docSnap = await safeFirestore(getDocs(query(col, where('id', '==', slug))), 4000);
        if (docSnap && !docSnap.empty) {
          const d = docSnap.docs[0];
          const found = { id: d.id, ...(d.data() as Record<string, any>) } as InvitationData;
          return found;
        }
      } catch (err) {
        console.warn('Firestore getInvitationBySlug error:', err);
      }
    }
    return null;
  },

  async saveInvitation(data: InvitationData): Promise<InvitationData> {
    const now = new Date().toISOString();
    const preparedData: InvitationData = {
      ...data,
      updatedAt: now,
      createdAt: data.createdAt || now,
    };

    // Update local storage immediately for zero latency
    const localList = getStored<InvitationData[]>(STORAGE_KEY_INVITATIONS, []);
    const index = localList.findIndex((inv) => inv.id === preparedData.id || inv.slug === preparedData.slug);
    let updated: InvitationData[];
    if (index >= 0) {
      updated = [...localList];
      updated[index] = preparedData;
    } else {
      updated = [preparedData, ...localList];
    }
    setStored(STORAGE_KEY_INVITATIONS, updated);
    realtimeHub.emit('invitations', updated);

    // Sync to Firestore with sanitized data (removes undefined and oversized items)
    if (isFirebaseConfigured() && db) {
      const sanitized = sanitizeForFirestore(preparedData);
      await safeFirestore(setDoc(doc(db, 'invitations', preparedData.id), sanitized), 8000);
    }

    return preparedData;
  },

  async incrementViews(slug: string): Promise<void> {
    const list = getStored<InvitationData[]>(STORAGE_KEY_INVITATIONS, []);
    const target = list.find((inv) => inv.slug === slug);
    if (target) {
      target.viewsCount = (target.viewsCount || 0) + 1;
      await this.saveInvitation(target);
    }
  },

  async deleteInvitation(id: string): Promise<boolean> {
    const list = getStored<InvitationData[]>(STORAGE_KEY_INVITATIONS, []);
    const updated = list.filter((inv) => inv.id !== id);
    setStored(STORAGE_KEY_INVITATIONS, updated);
    realtimeHub.emit('invitations', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(deleteDoc(doc(db, 'invitations', id)), 2000);
    }
    return true;
  },

  // -------------------------------------------------------------
  // RSVP / GUESTS
  // -------------------------------------------------------------
  async getGuests(invitationSlug?: string, ownerId?: string): Promise<GuestRSVP[]> {
    let all: GuestRSVP[] = [];
    if (isFirebaseConfigured() && db) {
      const snap = await safeFirestore(getDocs(collection(db, 'guests')), 1500);
      if (snap && !snap.empty) {
        snap.forEach((d) => all.push({ id: d.id, ...d.data() } as GuestRSVP));
      }
    }

    if (all.length === 0) {
      all = getStored<GuestRSVP[]>(STORAGE_KEY_GUESTS, []);
    }

    // invitationSlug bo'yicha filter
    if (invitationSlug) {
      all = all.filter((g) => g.invitationSlug === invitationSlug);
    }

    // ownerId bo'yicha filter — faqat shu foydalanuvchi taklifnomalariga tegishli mehmonlar
    if (ownerId) {
      all = all.filter((g) => g.invitationOwnerId === ownerId);
    }

    return all;
  },

  async submitRSVP(payload: Omit<GuestRSVP, 'id' | 'submittedAt'>): Promise<GuestRSVP> {
    const newGuest: GuestRSVP = {
      ...payload,
      id: `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' }),
    };

    // Save locally first
    const all = getStored<GuestRSVP[]>(STORAGE_KEY_GUESTS, []);
    const updated = [newGuest, ...all];
    setStored(STORAGE_KEY_GUESTS, updated);
    realtimeHub.emit('guests', updated);

    // Sync to Firestore
    if (isFirebaseConfigured() && db) {
      safeFirestore(setDoc(doc(db, 'guests', newGuest.id), sanitizeForFirestore(newGuest)), 2000);
    }

    return newGuest;
  },

  async deleteGuest(id: string): Promise<boolean> {
    const all = getStored<GuestRSVP[]>(STORAGE_KEY_GUESTS, []);
    const updated = all.filter((g) => g.id !== id);
    setStored(STORAGE_KEY_GUESTS, updated);
    realtimeHub.emit('guests', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(deleteDoc(doc(db, 'guests', id)), 2000);
    }
    return true;
  },

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  async getOrders(): Promise<OrderItem[]> {
    if (isFirebaseConfigured() && db) {
      const snap = await safeFirestore(getDocs(collection(db, 'orders')), 1500);
      if (snap && !snap.empty) {
        const list: OrderItem[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as OrderItem));
        return list;
      }
    }
    return getStored<OrderItem[]>(STORAGE_KEY_ORDERS, mockOrders);
  },

  async createOrder(payload: Partial<OrderItem>): Promise<OrderItem> {
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceType: payload.serviceType || 'website_invitation',
      serviceName: payload.serviceName || 'Taklifnoma Xizmati',
      planName: payload.planName || 'Standard Plan',
      customerName: payload.customerName || 'Hurmatli Mijoz',
      customerPhone: payload.customerPhone || '+998 90 000 00 00',
      customerEmail: payload.customerEmail || 'mijoz@taklifim.uz',
      date: new Date().toISOString().split('T')[0],
      price: payload.price !== undefined ? payload.price : 150000,
      status: payload.price === 0 ? 'confirmed' : 'pending',
      notes: payload.notes || '',
      invitationId: payload.invitationId,
    };

    // Save locally first
    const all = getStored<OrderItem[]>(STORAGE_KEY_ORDERS, mockOrders);
    const updated = [newOrder, ...all];
    setStored(STORAGE_KEY_ORDERS, updated);
    realtimeHub.emit('orders', updated);

    // Sync to Firestore
    if (isFirebaseConfigured() && db) {
      safeFirestore(setDoc(doc(db, 'orders', newOrder.id), sanitizeForFirestore(newOrder)), 2000);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderItem['status']): Promise<boolean> {
    const all = getStored<OrderItem[]>(STORAGE_KEY_ORDERS, mockOrders);
    const updated = all.map((o) => (o.id === orderId ? { ...o, status } : o));
    setStored(STORAGE_KEY_ORDERS, updated);
    realtimeHub.emit('orders', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(updateDoc(doc(db, 'orders', orderId), { status }), 2000);
    }
    return true;
  },

  // -------------------------------------------------------------
  // CONTACT MESSAGES / INQUIRIES
  // -------------------------------------------------------------
  async getContactMessages(): Promise<ContactMessage[]> {
    if (isFirebaseConfigured() && db) {
      const snap = await safeFirestore(getDocs(collection(db, 'messages')), 1500);
      if (snap && !snap.empty) {
        const list: ContactMessage[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ContactMessage));
        return list;
      }
    }
    return getStored<ContactMessage[]>(STORAGE_KEY_MESSAGES, initialMessages);
  },

  async submitContactMessage(payload: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      ...payload,
      id: `msg-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' }),
    };

    const all = getStored<ContactMessage[]>(STORAGE_KEY_MESSAGES, initialMessages);
    const updated = [newMessage, ...all];
    setStored(STORAGE_KEY_MESSAGES, updated);
    realtimeHub.emit('messages', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(setDoc(doc(db, 'messages', newMessage.id), sanitizeForFirestore(newMessage)), 2000);
    }

    return newMessage;
  },

  async updateContactMessageStatus(id: string, status: ContactMessage['status']): Promise<boolean> {
    const all = getStored<ContactMessage[]>(STORAGE_KEY_MESSAGES, initialMessages);
    const updated = all.map((m) => (m.id === id ? { ...m, status } : m));
    setStored(STORAGE_KEY_MESSAGES, updated);
    realtimeHub.emit('messages', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(updateDoc(doc(db, 'messages', id), { status }), 2000);
    }
    return true;
  },

  // -------------------------------------------------------------
  // TESTIMONIALS / REVIEWS (REAL-TIME FIREBASE)
  // -------------------------------------------------------------
  async getTestimonials(): Promise<Testimonial[]> {
    if (isFirebaseConfigured() && db) {
      const snap = await safeFirestore(getDocs(collection(db, 'testimonials')), 1500);
      if (snap && !snap.empty) {
        const list: Testimonial[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Testimonial));
        return list;
      }
    }
    return getStored<Testimonial[]>(STORAGE_KEY_TESTIMONIALS, mockTestimonials);
  },

  async addTestimonial(payload: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const newTestimonial: Testimonial = {
      ...payload,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const all = await this.getTestimonials();
    const updated = [newTestimonial, ...all];
    setStored(STORAGE_KEY_TESTIMONIALS, updated);
    realtimeHub.emit('testimonials', updated);

    if (isFirebaseConfigured() && db) {
      safeFirestore(setDoc(doc(db, 'testimonials', newTestimonial.id), sanitizeForFirestore(newTestimonial)), 2000);
    }

    return newTestimonial;
  },
};
