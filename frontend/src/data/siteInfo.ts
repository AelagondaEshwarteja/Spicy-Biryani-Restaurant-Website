// Restaurant details shown on the website. Change them here and every page updates.

import type { Category } from '../types';

export const RESTAURANT = {
  name: 'Spicy Biryani',
  tagline: 'Hyderabadi Kitchen',
  phone: '+91 93904 92316',
  phoneLink: 'tel:+919390492316',
  email: 'orders@spicybiryani.com',
  address: 'Warangal, Telangana 506331',
  mapQuery: 'Warangal, Telangana',
  hours: [
    { days: 'Monday – Friday', time: '11:00 AM – 10:30 PM' },
    { days: 'Saturday – Sunday', time: '11:00 AM – 11:30 PM' },
  ],
  stats: [
    { value: '26', label: 'dishes on the menu' },
    { value: '35 min', label: 'average delivery' },
    { value: '4.8★', label: 'from 9,000+ ratings' },
  ],
  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    x: 'https://x.com/',
  },
};

// Photos from Wikimedia Commons (credited in the footer and README)
export const IMAGES = {
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/The_art_of_%22BIRYANI%22.jpg/1280px-The_art_of_%22BIRYANI%22.jpg',
  dumPot:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Biryani_-_sealed_with_dought.JPG/500px-Biryani_-_sealed_with_dought.JPG',
  spices:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Indian_Spices_%2849696133942%29.jpg/960px-Indian_Spices_%2849696133942%29.jpg',
};

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'biryani', label: 'Biryani' },
  { id: 'starters', label: 'Starters' },
  { id: 'curries', label: 'Curries' },
  { id: 'breads', label: 'Breads' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'beverages', label: 'Drinks' },
];

// Sample reviews for the demo - replace them with real customer reviews
export const TESTIMONIALS = [
  {
    name: 'Sai Kiran',
    area: 'Hanamkonda',
    dish: 'Mutton Dum Biryani',
    rating: 5,
    text: 'The mutton was so soft it came off the bone with a spoon. Rice was long and every grain separate. Tastes like the biryani we get at Hyderabad weddings.',
  },
  {
    name: 'Priya Reddy',
    area: 'Kazipet',
    dish: 'Veg Dum Biryani + Double ka Meetha',
    rating: 5,
    text: 'Finally a place that takes veg biryani seriously! Delivery came in 30 minutes and the food was still steaming. The double ka meetha is a must.',
  },
  {
    name: 'Mohammed Arif',
    area: 'Warangal Fort',
    dish: 'Family Pack Dum Handi',
    rating: 4,
    text: 'Ordered the family handi for 5 people and there was enough left over. Good spice level, proper dum flavour. Salan could be a little thicker.',
  },
];
