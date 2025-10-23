/**
 * Teaser Generator - Transforms activities, dining, and airlines into non-identifying teasers
 * Only activates when TEASER_MODE is explicitly included in the prompt
 */

export interface TeaserInput {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  hours?: string | null;
  seasonality?: string | null;
  notes?: string | null;
  rating?: number;
}

export interface TeaserOutput {
  id: string;
  title: string;
  headerEmoji: string;
  teaser: string;
  tone: string;
  tags: string[];
}

type ToneType = 'family_friendly' | 'adventure' | 'romantic' | 'luxury' | 'balanced' | 'culinary' | 'travel';

const categoryMappings: Record<string, { descriptor: string; emoji: string; tone: ToneType; baseTags: string[] }> = {
  'science_museum': {
    descriptor: 'interactive science center',
    emoji: '🌌',
    tone: 'family_friendly',
    baseTags: ['hands-on', 'indoors', 'educational']
  },
  'museum': {
    descriptor: 'cultural attraction',
    emoji: '🏛️',
    tone: 'balanced',
    baseTags: ['cultural', 'indoors', 'educational']
  },
  'zoo': {
    descriptor: 'urban wildlife haven',
    emoji: '🦁',
    tone: 'family_friendly',
    baseTags: ['wildlife', 'outdoors', 'family']
  },
  'aquarium': {
    descriptor: 'marine life experience',
    emoji: '🐠',
    tone: 'family_friendly',
    baseTags: ['marine', 'indoors', 'educational']
  },
  'park': {
    descriptor: 'scenic outdoor space',
    emoji: '🌳',
    tone: 'balanced',
    baseTags: ['nature', 'outdoors', 'relaxing']
  },
  'garden': {
    descriptor: 'serene botanical paradise',
    emoji: '🌸',
    tone: 'romantic',
    baseTags: ['nature', 'peaceful', 'beautiful']
  },
  'heritage_park': {
    descriptor: 'living history village',
    emoji: '🏘️',
    tone: 'family_friendly',
    baseTags: ['history', 'cultural', 'educational']
  },
  'farm': {
    descriptor: 'seasonal berry patch',
    emoji: '🍓',
    tone: 'family_friendly',
    baseTags: ['seasonal', 'outdoors', 'fresh']
  },
  'restaurant': {
    descriptor: 'hidden culinary gem',
    emoji: '🍽️',
    tone: 'culinary',
    baseTags: ['dining', 'local', 'flavors']
  },
  'cafe': {
    descriptor: 'cozy corner café',
    emoji: '☕',
    tone: 'balanced',
    baseTags: ['casual', 'coffee', 'cozy']
  },
  'fine_dining': {
    descriptor: 'elegant dining experience',
    emoji: '🍷',
    tone: 'luxury',
    baseTags: ['fine dining', 'evening', 'upscale']
  },
  'bistro': {
    descriptor: 'charming bistro',
    emoji: '🥖',
    tone: 'balanced',
    baseTags: ['casual', 'local', 'cozy']
  },
  'airline': {
    descriptor: 'premium air carrier',
    emoji: '✈️',
    tone: 'travel',
    baseTags: ['flight', 'comfortable', 'reliable']
  },
  'tourist_attraction': {
    descriptor: 'popular local landmark',
    emoji: '📍',
    tone: 'balanced',
    baseTags: ['sightseeing', 'memorable', 'popular']
  }
};

/**
 * Checks if the category should be transformed
 */
function isInScope(category?: string | null, type?: string | null): boolean {
  if (!category && !type) return false;

  const scopeKeywords = ['activity', 'activities', 'dining', 'restaurant', 'food', 'airline', 'flight'];
  const checkValue = (category || type || '').toLowerCase();

  return scopeKeywords.some(keyword => checkValue.includes(keyword));
}

/**
 * Determines the category key from input
 */
function getCategoryKey(input: TeaserInput): string {
  const { category, type, name, description } = input;
  const searchText = `${category} ${type} ${name} ${description}`.toLowerCase();

  // Check for specific matches
  for (const [key] of Object.entries(categoryMappings)) {
    if (searchText.includes(key.replace('_', ' '))) {
      return key;
    }
  }

  // Dining-specific checks
  if (searchText.includes('steak') || searchText.includes('fine')) return 'fine_dining';
  if (searchText.includes('cafe') || searchText.includes('coffee')) return 'cafe';
  if (searchText.includes('bistro')) return 'bistro';
  if (searchText.includes('restaurant') || searchText.includes('dining')) return 'restaurant';

  // Airline check
  if (searchText.includes('airline') || searchText.includes('flight') || searchText.includes('air')) return 'airline';

  // Activity checks
  if (searchText.includes('science') || searchText.includes('planetarium')) return 'science_museum';
  if (searchText.includes('zoo') || searchText.includes('wildlife')) return 'zoo';
  if (searchText.includes('garden') || searchText.includes('botanical')) return 'garden';
  if (searchText.includes('farm') || searchText.includes('berry')) return 'farm';
  if (searchText.includes('heritage') || searchText.includes('history')) return 'heritage_park';
  if (searchText.includes('park')) return 'park';
  if (searchText.includes('museum')) return 'museum';

  // Default
  return 'tourist_attraction';
}

/**
 * Generates a teaser description
 */
function generateTeaserText(input: TeaserInput, categoryKey: string): string {
  const mapping = categoryMappings[categoryKey];
  const { description, rating } = input;

  // Create teaser based on category and description
  const teasers: Record<string, string[]> = {
    'science_museum': [
      'Step into a world where curiosity comes alive — tinker with robotics, explore the marvels of the human body, and peer through telescopes that bring distant galaxies within reach. A fun, educational outing for families and explorers alike.',
      'Discover hands-on exhibits that make science exciting and accessible. From interactive displays to stargazing opportunities, this center sparks wonder in visitors of all ages.'
    ],
    'zoo': [
      'Meet incredible creatures from around the world in naturalistic habitats. Watch animals play, feed, and interact while learning about conservation efforts. Perfect for families seeking an unforgettable wildlife adventure.',
      'Wander through diverse exhibits showcasing exotic and local species. Educational programs and close encounters make this a memorable day out for animal lovers.'
    ],
    'garden': [
      'Stroll through meticulously curated landscapes where seasonal blooms create a peaceful escape. Whether you\'re seeking photography opportunities or quiet reflection, this botanical haven offers year-round beauty.',
      'Lose yourself in paths lined with rare plants and stunning seasonal displays. A tranquil retreat perfect for nature lovers and those seeking serenity.'
    ],
    'restaurant': [
      'Savor locally-inspired dishes crafted with care and creativity. From appetizers to desserts, every plate tells a story of regional flavors and culinary passion. Ideal for food enthusiasts.',
      'Experience a menu that celebrates fresh, seasonal ingredients. Whether it\'s a casual lunch or special dinner, expect memorable flavors in a welcoming atmosphere.'
    ],
    'cafe': [
      'Discover a cozy spot where expertly brewed coffee meets freshly baked treats. Perfect for a morning pick-me-up or afternoon break with friends.',
      'Unwind with aromatic beverages and homemade pastries in a warm, inviting setting. A favorite local haunt for coffee lovers and casual meetups.'
    ],
    'fine_dining': [
      'An upscale retreat where expertly prepared dishes meet impeccable service and ambiance. Expect refined flavors, elegant presentation, and a touch of indulgence — perfect for a memorable evening out.',
      'Indulge in a sophisticated dining experience featuring premium ingredients and masterful technique. Soft lighting and attentive service create an atmosphere of understated luxury.'
    ],
    'airline': [
      'Experience a smooth, well-connected journey with a trusted carrier known for comfort and reliability. From takeoff to landing, every detail is designed to make travel feel effortless.',
      'Enjoy a comfortable flight experience with modern amenities and professional service. Whether domestic or international, this carrier prioritizes passenger satisfaction.'
    ],
    'farm': [
      'Visit a working farm where seasonal produce is picked fresh from the fields. Families can enjoy hands-on experiences, from berry picking to learning about sustainable agriculture.',
      'Experience farm-fresh flavors and rural charm. Pick your own produce, meet friendly animals, and create lasting memories in the countryside.'
    ],
    'heritage_park': [
      'Step back in time to experience living history through authentic buildings, costumed interpreters, and interactive demonstrations. A captivating journey through the past for all ages.',
      'Explore recreated historical settings that bring bygone eras to life. From vintage shops to period homes, this immersive experience educates and entertains.'
    ],
    'park': [
      'Find your escape in expansive green spaces perfect for picnics, walks, or simply enjoying nature. Well-maintained trails and scenic vistas offer relaxation for visitors of all ages.',
      'Enjoy outdoor recreation in a beautiful natural setting. Whether you\'re jogging, playing, or unwinding, this park provides a peaceful urban oasis.'
    ],
    'museum': [
      'Journey through curated exhibits showcasing art, history, and culture. Thoughtful displays and knowledgeable guides enrich your understanding of the region\'s heritage.',
      'Discover fascinating collections that span centuries and cultures. Interactive exhibits and educational programs make this a rewarding visit for curious minds.'
    ],
    'tourist_attraction': [
      'Experience a must-see destination that captures the essence of the area. Whether it\'s stunning views, unique architecture, or cultural significance, this landmark leaves a lasting impression.',
      'Visit an iconic spot beloved by locals and travelers alike. Perfect for photos, exploration, and soaking in the atmosphere of this special place.'
    ]
  };

  const categoryTeasers = teasers[categoryKey] || teasers['tourist_attraction'];
  const teaser = categoryTeasers[Math.floor(Math.random() * categoryTeasers.length)];

  return teaser;
}

/**
 * Generates additional tags based on input
 */
function generateTags(input: TeaserInput, categoryKey: string): string[] {
  const mapping = categoryMappings[categoryKey];
  const tags = [...mapping.baseTags];

  const { description, hours, seasonality, rating } = input;

  // Add rating-based tag
  if (rating && rating >= 4.5) tags.push('highly rated');

  // Add time-based tags
  if (hours?.toLowerCase().includes('evening') || hours?.toLowerCase().includes('night')) {
    tags.push('evening');
  }

  // Add seasonality
  if (seasonality) {
    tags.push(seasonality.toLowerCase());
  }

  // Add description-based tags
  if (description) {
    const desc = description.toLowerCase();
    if (desc.includes('family')) tags.push('family-friendly');
    if (desc.includes('romantic')) tags.push('romantic');
    if (desc.includes('adventure')) tags.push('adventure');
    if (desc.includes('luxury') || desc.includes('upscale')) tags.push('upscale');
  }

  // Return unique tags, max 5
  return [...new Set(tags)].slice(0, 5);
}

/**
 * Transforms a single input into a teaser (TEASER_MODE only)
 */
export function transformToTeaser(input: TeaserInput): TeaserOutput | TeaserInput {
  // Only transform if in scope
  if (!isInScope(input.category, input.type)) {
    return input;
  }

  const categoryKey = getCategoryKey(input);
  const mapping = categoryMappings[categoryKey];

  // Generate title from descriptor
  const titleWords = mapping.descriptor.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  );
  const title = titleWords.join(' ');

  return {
    id: input.id,
    title,
    headerEmoji: mapping.emoji,
    teaser: generateTeaserText(input, categoryKey),
    tone: mapping.tone,
    tags: generateTags(input, categoryKey)
  };
}

/**
 * Transforms an array of inputs (TEASER_MODE only)
 */
export function transformBatch(inputs: TeaserInput[]): (TeaserOutput | TeaserInput)[] {
  return inputs.map(input => transformToTeaser(input));
}

/**
 * Main entry point - checks for TEASER_MODE activation
 */
export function processWithTeaserMode(
  inputs: TeaserInput[],
  prompt: string
): (TeaserOutput | TeaserInput)[] {
  // Only activate if TEASER_MODE is in the prompt
  if (!prompt.includes('TEASER_MODE')) {
    return inputs;
  }

  return transformBatch(inputs);
}
