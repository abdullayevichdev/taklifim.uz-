/**
 * Yengil, mustahkam va xavfsiz Audio Storage (IndexedDB)
 * Brauzerda har qanday hajmdagi MP3/WAV/OGG fayllarni 100% CORS xatoliksiz
 * va bevosita tezkor xotirada saqlash uchun.
 */

const DB_NAME = 'TaklifimAudioDB';
const STORE_NAME = 'user_audio_files';
const DB_VERSION = 2;

// Xotirada tezkor Blob URL keshi (sahifani qayta yuklaguncha bir zumda ochish uchun)
const memoryCache = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB bu brauzerda qo‘llab-quvvatlanmaydi'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export const audioStorage = {
  /**
   * Audio faylni xavfsiz IndexedDB'ga saqlash (Hech qanday CORS va tarmoq xatolarisiz)
   * @param id Taklifnoma identifikatori yoki audio kaliti
   * @param file Yuklangan audio fayl (Blob yoki File)
   * @returns `idb://...` havolasi
   */
  async saveAudioFile(id: string, file: Blob | File): Promise<string> {
    const key = `idb://${id}`;

    // 1. Tezkor xotirada Object URL yaratish
    try {
      const blobUrl = URL.createObjectURL(file);
      memoryCache.set(key, blobUrl);
      memoryCache.set(id, blobUrl);
    } catch {
      // ignore
    }

    // 2. IndexedDB da doimiy saqlash
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(file, id);
        req.onsuccess = () => resolve(key);
        req.onerror = () => resolve(key); // Xatolik bo'lsa ham memoryCache orqali ishlaydi
      });
    } catch (err) {
      console.warn('IndexedDB saqlashda ogohlantirish:', err);
      return key;
    }
  },

  /**
   * Audio URL ni audio element o'ynay oladigan URL ga aylantirish:
   * - Agar oddiy /audio/ yoki http bo'lsa -> o'zini qaytaradi
   * - Agar idb:// bo'lsa -> Blob Object URL qaytaradi
   * - Agar fayl topilmasa -> standart to'y kuyi bilan xatoliksiz ta'minlaydi
   */
  async getAudioUrl(idOrUrl: string): Promise<string> {
    if (!idOrUrl) return '/audio/wedding_vals.mp3';

    // Oddiy HTTP yoki lokal fayl bo'lsa
    if (!idOrUrl.startsWith('idb://')) {
      return idOrUrl;
    }

    // 1. Xotira keshidan tekshirish
    if (memoryCache.has(idOrUrl)) {
      return memoryCache.get(idOrUrl)!;
    }

    const id = idOrUrl.replace('idb://', '');
    if (memoryCache.has(id)) {
      return memoryCache.get(id)!;
    }

    // 2. IndexedDB dan olish
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          if (req.result && (req.result instanceof Blob || req.result instanceof File)) {
            const blobUrl = URL.createObjectURL(req.result);
            memoryCache.set(idOrUrl, blobUrl);
            memoryCache.set(id, blobUrl);
            resolve(blobUrl);
          } else {
            // Agar boshqa qurilma yoki topilmasa, jim qolmasdan chiroyli to'y valsi yangraydi
            resolve('/audio/wedding_vals.mp3');
          }
        };

        req.onerror = () => resolve('/audio/wedding_vals.mp3');
      });
    } catch {
      return '/audio/wedding_vals.mp3';
    }
  },

  /**
   * Audio faylni xotiradan tozalash
   */
  async removeAudio(idOrUrl: string): Promise<void> {
    if (!idOrUrl) return;
    const id = idOrUrl.replace('idb://', '');
    memoryCache.delete(idOrUrl);
    memoryCache.delete(id);

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    } catch {
      // ignore
    }
  },
};
