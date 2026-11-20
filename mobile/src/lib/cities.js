// A small built-in list so prayer times work without sharing location. Name, country, latitude, longitude.
export const CITIES = [
  ['Karachi', 'Pakistan', 24.8607, 67.0011], ['Lahore', 'Pakistan', 31.5497, 74.3436], ['Islamabad', 'Pakistan', 33.6844, 73.0479],
  ['Peshawar', 'Pakistan', 34.0151, 71.5249], ['Quetta', 'Pakistan', 30.1798, 66.975], ['Faisalabad', 'Pakistan', 31.4504, 73.135],
  ['Delhi', 'India', 28.6139, 77.209], ['Mumbai', 'India', 19.076, 72.8777], ['Hyderabad', 'India', 17.385, 78.4867], ['Kolkata', 'India', 22.5726, 88.3639],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125], ['Kabul', 'Afghanistan', 34.5553, 69.2075],
  ['Makkah', 'Saudi Arabia', 21.3891, 39.8579], ['Madinah', 'Saudi Arabia', 24.5247, 39.5692], ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753], ['Jeddah', 'Saudi Arabia', 21.4858, 39.1925],
  ['Dubai', 'UAE', 25.2048, 55.2708], ['Abu Dhabi', 'UAE', 24.4539, 54.3773], ['Doha', 'Qatar', 25.2854, 51.531], ['Kuwait City', 'Kuwait', 29.3759, 47.9774],
  ['Istanbul', 'Turkey', 41.0082, 28.9784], ['Ankara', 'Turkey', 39.9334, 32.8597], ['Tehran', 'Iran', 35.6892, 51.389], ['Baghdad', 'Iraq', 33.3152, 44.3661],
  ['Cairo', 'Egypt', 30.0444, 31.2357], ['Amman', 'Jordan', 31.9454, 35.9284], ['Jerusalem', 'Palestine', 31.7683, 35.2137], ['Beirut', 'Lebanon', 33.8938, 35.5018],
  ['Casablanca', 'Morocco', 33.5731, -7.5898], ['Algiers', 'Algeria', 36.7538, 3.0588], ['Tunis', 'Tunisia', 36.8065, 10.1815], ['Khartoum', 'Sudan', 15.5007, 32.5599],
  ['Lagos', 'Nigeria', 6.5244, 3.3792], ['Nairobi', 'Kenya', -1.2921, 36.8219], ['Johannesburg', 'South Africa', -26.2041, 28.0473], ['Dakar', 'Senegal', 14.7167, -17.4677],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456], ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869], ['Singapore', 'Singapore', 1.3521, 103.8198],
  ['London', 'United Kingdom', 51.5074, -0.1278], ['Birmingham', 'United Kingdom', 52.4862, -1.8904], ['Manchester', 'United Kingdom', 53.4808, -2.2426],
  ['Paris', 'France', 48.8566, 2.3522], ['Berlin', 'Germany', 52.52, 13.405], ['Amsterdam', 'Netherlands', 52.3676, 4.9041],
  ['New York', 'USA', 40.7128, -74.006], ['Chicago', 'USA', 41.8781, -87.6298], ['Houston', 'USA', 29.7604, -95.3698], ['Los Angeles', 'USA', 34.0522, -118.2437],
  ['Toronto', 'Canada', 43.6532, -79.3832], ['Sydney', 'Australia', -33.8688, 151.2093], ['Melbourne', 'Australia', -37.8136, 144.9631],
].map(([name, country, lat, lng]) => ({ name, country, lat, lng }));

/** Match a typed query to cities (name or country, case-insensitive). */
export const searchCities = (q) => {
  const s = (q || '').trim().toLowerCase();
  return s ? CITIES.filter((c) => c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s)) : CITIES;
};
