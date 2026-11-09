import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCountdown,
  validateRSVPForm,
  formatPriceUZS,
  filterTemplates,
  calculateRSVPStats,
} from './logic';
import { Template, GuestRSVP } from '../types';

test('calculateCountdown returns remaining time accurately', () => {
  const baseNow = new Date('2026-06-01T12:00:00Z');
  const targetDate = '2026-06-02';
  const targetTime = '12:00';
  
  // 24 hours ahead
  const res = calculateCountdown(targetDate, targetTime, baseNow);
  assert.equal(res.isPassed, false);
  assert.equal(res.days >= 0, true);
});

test('calculateCountdown marks past events as isPassed with 0s', () => {
  const baseNow = new Date('2026-06-10T12:00:00Z');
  const targetDate = '2026-06-01';
  const res = calculateCountdown(targetDate, '10:00', baseNow);
  assert.equal(res.isPassed, true);
  assert.equal(res.days, 0);
  assert.equal(res.hours, 0);
});

test('validateRSVPForm validates full name and guest count', () => {
  const invalid = validateRSVPForm({ fullName: '', attending: true, guestCount: 0 });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.guestCount);

  const valid = validateRSVPForm({ fullName: 'Anvar Alimov', attending: true, guestCount: 2 });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('formatPriceUZS formats prices with Uzbek So‘m', () => {
  assert.equal(formatPriceUZS(0), 'Bepul');
  assert.equal(formatPriceUZS(150000).includes('150 000'), true);
  assert.equal(formatPriceUZS(150000).includes('so‘m'), true);
});

test('filterTemplates filters by category and search term', () => {
  const mockList: Template[] = [
    {
      id: '1',
      slug: 'aurelia',
      name: 'Aurelia Royal',
      category: 'weddings',
      price: 150000,
      previewImage: '',
      description: { uz: 'Nafis to‘y taklifnomasi', ru: 'Свадьба', en: 'Wedding' },
      features: { uz: [], ru: [], en: [] },
      colorStyle: { primary: '#000', secondary: '#fff', accent: '#ccc', background: '#eee', text: '#111' },
      typography: { headingFont: 'serif', bodyFont: 'sans' },
      suitableFor: { uz: [], ru: [], en: [] },
      isPopular: true,
    },
    {
      id: '2',
      slug: 'bloom',
      name: 'Bloom Pastel',
      category: 'birthdays',
      price: 90000,
      previewImage: '',
      description: { uz: 'Tug‘ilgan kun bayrami', ru: 'День рождения', en: 'Birthday' },
      features: { uz: [], ru: [], en: [] },
      colorStyle: { primary: '#000', secondary: '#fff', accent: '#ccc', background: '#eee', text: '#111' },
      typography: { headingFont: 'serif', bodyFont: 'sans' },
      suitableFor: { uz: [], ru: [], en: [] },
      isNew: true,
    },
  ];

  const weddings = filterTemplates(mockList, { category: 'weddings' });
  assert.equal(weddings.length, 1);
  assert.equal(weddings[0].slug, 'aurelia');

  const searched = filterTemplates(mockList, { query: 'bloom' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].name, 'Bloom Pastel');
});

test('calculateRSVPStats calculates counts and attendance percentage correctly', () => {
  const sampleRSVPs: GuestRSVP[] = [
    { id: '1', invitationId: 'inv-1', fullName: 'Ali', attending: true, guestCount: 2, submittedAt: '2026-05-01' },
    { id: '2', invitationId: 'inv-1', fullName: 'Vali', attending: true, guestCount: 1, submittedAt: '2026-05-02' },
    { id: '3', invitationId: 'inv-1', fullName: 'Gani', attending: false, guestCount: 0, submittedAt: '2026-05-03' },
  ];

  const stats = calculateRSVPStats(sampleRSVPs);
  assert.equal(stats.total, 3);
  assert.equal(stats.attendingCount, 2);
  assert.equal(stats.declinedCount, 1);
  assert.equal(stats.totalGuests, 3);
  assert.equal(stats.acceptanceRate, 67);
});
