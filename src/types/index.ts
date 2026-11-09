export type Language = 'uz' | 'ru' | 'en';

export type EventCategory = 
  | 'all'
  | 'weddings'
  | 'engagements'
  | 'traditional'
  | 'birthdays'
  | 'women'
  | 'anniversaries'
  | 'baby_showers'
  | 'other';

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: EventCategory;
  price: number; // in UZS (e.g. 150000)
  isFree?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  previewImage: string;
  description: Record<Language, string>;
  features: Record<Language, string[]>;
  colorStyle: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  suitableFor: Record<Language, string[]>;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: Record<Language, string> | string;
  description?: Record<Language, string> | string;
}

export interface DressCodeColor {
  name: Record<Language, string> | string;
  hex: string;
}

export interface InvitationData {
  id: string;
  slug: string;
  templateId: string;
  templateSlug: string;
  language: Language; // Guest facing language
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  
  // Event details
  eventType: string;
  eventTitle: string;
  hostNames: string; // e.g. "Farhod & Shirin" or "Jasur & Shahlo"
  partner1Name?: string;
  partner2Name?: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  
  // Venue
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  
  // Invitation text
  invitationMessage: string;
  invitationQuote?: string;
  
  // Media
  coverImage?: string;
  galleryImages: string[];
  galleryTitle?: string;
  galleryPosition?: 'after_message' | 'after_date' | 'after_schedule';
  
  // Music
  musicEnabled: boolean;
  musicTitle?: string;
  musicUrl?: string;
  musicFileData?: string;
  musicTracks?: Array<{ id: string; title: string; url: string; fileData?: string }>;
  musicPlacement?: 'cover' | 'floating' | 'all';

  // Social Links
  socialLinks?: {
    instagram?: string;
    telegram?: string;
    telegramChannel?: string;
    phone?: string;
  };
  
  // Schedule
  schedule: ScheduleItem[];
  
  // Dress code
  dressCodeEnabled: boolean;
  dressCodeTitle?: string;
  dressCodeDescription?: string;
  dressCodeColors: DressCodeColor[];
  
  // RSVP
  rsvpEnabled: boolean;
  rsvpDeadline: string; // YYYY-MM-DD
  allowCompanion: boolean;
  maxCompanions?: number;
  askMealPreference?: boolean;
  
  // Styling overrides
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  customFonts?: {
    heading?: string;
    body?: string;
  };
  
  viewsCount?: number;
  ownerId?: string; // Firebase UID yoki local user ID
}

export interface GuestRSVP {
  id: string;
  invitationId: string;
  invitationSlug?: string;
  invitationOwnerId?: string; // Owner of the invitation
  fullName: string;
  phone?: string;
  attending: boolean;
  guestCount: number;
  mealPreference?: string;
  message?: string;
  submittedAt: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  serviceType: 'website_invitation' | 'video_invitation' | 'premium_custom';
  serviceName: string;
  planName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  price: number;
  status: 'pending' | 'confirmed' | 'demo' | 'completed';
  notes?: string;
  invitationId?: string;
}

export interface PricingPlan {
  id: string;
  slug: string;
  name: Record<Language, string>;
  price: number;
  isPopular?: boolean;
  description: Record<Language, string>;
  features: Record<Language, string[]>;
  buttonText: Record<Language, string>;
}

export interface FAQItem {
  id: string;
  category: 'general' | 'website' | 'video' | 'payment';
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export interface Testimonial {
  id: string;
  name: string;
  event: Record<Language, string> | string;
  text: Record<Language, string> | string;
  avatar: string;
  rating: number;
  createdAt?: string;
}


export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}
