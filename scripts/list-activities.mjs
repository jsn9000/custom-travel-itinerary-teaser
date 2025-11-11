import fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/trip-activities.json', 'utf-8'));

const restaurants = new Set([
  'restaurant', 'comida', 'cocina', 'food', 'cafe', 'etnofood',
  'arugula', 'herbivora', 'viriditas', 'taniperla', 'muchitos'
]);

const activities = data.activities.filter(a => {
  const name = a.name.toLowerCase();
  return !Array.from(restaurants).some(term => name.includes(term));
});

console.log(`Total non-restaurant activities: ${activities.length}\n`);
console.log('First 20 activities:');
activities.slice(0, 20).forEach((a, i) => {
  console.log(`${i+1}. ${a.name}`);
});

// Save full list to file
fs.writeFileSync('/tmp/activities-to-scrape.json', JSON.stringify(activities, null, 2));
console.log('\nFull list saved to /tmp/activities-to-scrape.json');
