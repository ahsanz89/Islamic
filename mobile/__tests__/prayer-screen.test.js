import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { planPrayerNotifications } from '../src/lib/notify';

const mockUpdate = jest.fn();
let mockSettings;
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), t: (k) => k, uiRtl: false, settings: mockSettings, update: mockUpdate }) }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('../src/lib/audio', () => ({ useAudio: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }), SafeAreaView: require('react-native').View }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }) }));
jest.mock('../src/lib/notify', () => ({ ...jest.requireActual('../src/lib/notify'), rescheduleAll: jest.fn(() => Promise.resolve({ prayers: 0, daily: false })) }));
jest.mock('expo-sensors', () => ({ Magnetometer: { setUpdateInterval: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) } }));

const Prayer = require('../app/prayer').default;

beforeEach(() => { mockUpdate.mockClear(); });

test('without a place it asks the user to choose a city', async () => {
  mockSettings = { place: null, prayer: { method: 'mwl', asr: 'standard', use24: false }, adhan: { on: false, prayers: {} } };
  await render(<Prayer />);
  expect(screen.getByText(/Choose your city to see today/)).toBeTruthy();
});

test('with a place it lists all six times and the Qibla bearing', async () => {
  mockSettings = { place: { name: 'Karachi', lat: 24.86, lng: 67.01 }, prayer: { method: 'karachi', asr: 'hanafi', use24: true }, adhan: { on: false, prayers: {} } };
  await render(<Prayer />);
  for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) expect(screen.getAllByText(new RegExp(n)).length).toBeGreaterThan(0);
  expect(screen.getByText(/° from north/)).toBeTruthy();
  expect(screen.getByText(/Next prayer/)).toBeTruthy();
});

test('changing the method saves it', async () => {
  mockSettings = { place: { name: 'Karachi', lat: 24.86, lng: 67.01 }, prayer: { method: 'mwl', asr: 'standard', use24: false }, adhan: { on: false, prayers: {} } };
  await render(<Prayer />);
  await fireEvent.press(screen.getByText('Egyptian General Authority'));
  expect(mockUpdate).toHaveBeenCalledWith({ prayer: { method: 'egypt', asr: 'standard', use24: false } });
});

describe('notification plan', () => {
  // the place sits on the same meridian as the machine's clock, so the test gives the same answer in any time zone (CI runs in UTC)
  const base = { place: { name: 'Test city', lat: 30, lng: (-new Date(2026, 10, 20, 12).getTimezoneOffset() / 60) * 15 }, prayer: { method: 'karachi', asr: 'standard' } };
  test('off means nothing is planned', () => {
    expect(planPrayerNotifications({ ...base, adhan: { on: false } }, new Date(2026, 10, 20, 9, 0))).toEqual([]);
  });
  test('plans only future prayers, in order, for chosen prayers', () => {
    const plan = planPrayerNotifications({ ...base, adhan: { on: true, prayers: { fajr: false, dhuhr: true, asr: true, maghrib: true, isha: true } } }, new Date(2026, 10, 20, 9, 0), 2);
    expect(plan.length).toBe(4 + 4 + 0); // today dhuhr..isha (4) + tomorrow dhuhr..isha (4); fajr is switched off
    expect(plan.every((p) => p.at.getTime() > new Date(2026, 10, 20, 9, 0).getTime())).toBe(true);
    expect(plan.map((p) => p.at.getTime())).toEqual([...plan.map((p) => p.at.getTime())].sort((a, b) => a - b));
    expect(plan.some((p) => /Fajr/.test(p.title))).toBe(false);
  });
  test('prayers already passed today are skipped', () => {
    const plan = planPrayerNotifications({ ...base, adhan: { on: true, prayers: {} } }, new Date(2026, 10, 20, 23, 0), 1);
    expect(plan).toEqual([]);
  });
});
