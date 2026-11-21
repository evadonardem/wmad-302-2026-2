// Curated places shown on the start screen and used by the "Surprise me" button.
// None of this comes from Wikipedia. The descriptions are written in our own words, based on:
//  - Most Visited: Department of Tourism (DOT) holiday-season visitor counts (Dec 15-31, 2025),
//    as reported by The Philippine Star and the Philippine News Agency, plus the DOT's list of
//    top destinations (Vigan, Puerto Princesa / Palawan and Davao).
//  - Most Beautiful: places that appear again and again in travel guides (Culture Trip, Asia Tours,
//    Outlook Traveller and others). This is an editorial list, not an official ranking.
//  - Featured: highlights from DOT news, for example Camiguin, which the DOT pointed out as the only
//    Philippine entry in The New York Times' "52 Places to Go in 2026", plus popular heritage spots.

export type FeaturedPlace = {
  name: string;         // used as the search keyword and the card title
  location: string;     // shown under the title
  description: string;  // short description in our own words
  matchNames: string[]; // PSGC city/municipality names (lowercase) that should show this description
};

export type FeaturedCategory = {
  key: 'featured' | 'beautiful' | 'visited';
  label: string;
  source: string;
  places: FeaturedPlace[];
};

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    key: 'featured',
    label: 'Featured',
    source:
      'Highlights from Department of Tourism news (for example Camiguin, named in The New York Times\u2019 "52 Places to Go in 2026") and popular heritage and nature spots.',
    places: [
      {
        name: 'Camiguin',
        location: 'Camiguin, Northern Mindanao',
        description:
          'A small island province with volcanoes, waterfalls, hot and cold springs, and the White Island sandbar. The DOT highlighted it as the only Philippine entry in The New York Times\u2019 2026 places-to-go list.',
        matchNames: ['mambajao', 'mahinog', 'guinsiliban'],
      },
      {
        name: 'Intramuros',
        location: 'Manila, Metro Manila',
        description:
          'The old walled city of Manila from the Spanish era, with cobblestone streets, Fort Santiago, and San Agustin Church.',
        matchNames: ['city of manila'],
      },
      {
        name: 'Sagada',
        location: 'Sagada, Mountain Province',
        description:
          'A cool mountain town known for its hanging coffins, caves, rice terraces, and sunrise views above the clouds.',
        matchNames: ['sagada'],
      },
      {
        name: 'Hundred Islands',
        location: 'Alaminos, Pangasinan',
        description:
          'A national park of small, tree-covered limestone islands in Lingayen Gulf, great for island hopping, kayaking, and snorkeling.',
        matchNames: ['city of alaminos'],
      },
      {
        name: 'Tagaytay',
        location: 'Tagaytay, Cavite',
        description:
          'A cool ridge-top city with wide views over Taal Lake and Taal Volcano, popular for day trips from Manila.',
        matchNames: ['tagaytay'],
      },
      {
        name: 'Calbayog',
        location: 'Calbayog City, Samar',
        description:
          'A city on Samar island with waterfalls and beaches. The DOT counted Malajog Beach here as the most visited spot in Eastern Visayas over the 2025 holidays.',
        matchNames: ['city of calbayog'],
      },
    ],
  },
  {
    key: 'beautiful',
    label: 'Most Beautiful',
    source:
      'Compiled from places that appear again and again in travel guides (Culture Trip, Asia Tours, Outlook Traveller and others). It is an editorial list, not an official ranking.',
    places: [
      {
        name: 'El Nido',
        location: 'El Nido, Palawan',
        description:
          'Towering limestone cliffs, hidden lagoons, and clear water, best explored on an island-hopping boat tour or by kayak.',
        matchNames: ['el nido'],
      },
      {
        name: 'Coron',
        location: 'Coron, Palawan',
        description:
          'Famous for Kayangan Lake, the Twin Lagoon, and wreck diving, all surrounded by rugged limestone islands.',
        matchNames: ['coron'],
      },
      {
        name: 'Batanes',
        location: 'Batanes, Cagayan Valley',
        description:
          'The northernmost province, with rolling green hills, sea cliffs, lighthouses, and traditional stone houses.',
        matchNames: ['basco', 'itbayat', 'ivana', 'mahatao', 'sabtang', 'uyugan'],
      },
      {
        name: 'Chocolate Hills',
        location: 'Carmen, Bohol',
        description:
          'More than a thousand cone-shaped grass hills that turn chocolate brown in the dry season.',
        matchNames: [],
      },
      {
        name: 'Banaue',
        location: 'Banaue, Ifugao',
        description:
          'Centuries-old rice terraces carved into the mountainsides by the Ifugao people, among the best-known landscapes in the country.',
        matchNames: ['banaue'],
      },
      {
        name: 'Mayon Volcano',
        location: 'Albay, Bicol',
        description:
          'An active volcano with an almost perfect cone shape, best seen from Legazpi and Daraga, with the Cagsawa ruins in front.',
        matchNames: ['city of legazpi', 'daraga'],
      },
      {
        name: 'Siargao',
        location: 'Siargao Island, Surigao del Norte',
        description:
          'A laid-back island known for surfing at Cloud 9, palm-lined roads, tidal pools, and island hopping.',
        matchNames: [],
      },
      {
        name: 'Siquijor',
        location: 'Siquijor, Central Visayas',
        description:
          'A quiet island with white-sand beaches, Cambugahay Falls, and a mysterious reputation in local folklore.',
        matchNames: ['siquijor', 'larena', 'lazi'],
      },
    ],
  },
  {
    key: 'visited',
    label: 'Most Visited',
    source:
      'Department of Tourism holiday-season visitor counts (Dec 15-31, 2025), as reported by The Philippine Star and the Philippine News Agency. Vigan, Puerto Princesa and Davao come from the DOT\u2019s list of top destinations.',
    places: [
      {
        name: 'Boracay',
        location: 'Malay, Aklan',
        description:
          'The most visited destination over the 2025 holidays, with about 118,700 guests counted by the DOT. Known for the long white sand of White Beach and its sunsets.',
        matchNames: ['malay'],
      },
      {
        name: 'Baguio',
        location: 'Baguio City, Benguet',
        description:
          'The "Summer Capital" came second with about 117,100 guests. Cool weather, pine trees, Burnham Park, and Session Road draw the crowds.',
        matchNames: ['city of baguio'],
      },
      {
        name: 'Cebu City',
        location: 'Cebu City, Cebu',
        description:
          'Third with about 102,100 guests. The oldest city in the country, with Magellan\u2019s Cross, the Basilica del Santo Ni\u00f1o, and a lively food scene.',
        matchNames: ['city of cebu'],
      },
      {
        name: 'Panglao',
        location: 'Panglao Island, Bohol',
        description:
          'About 62,200 guests over the holidays. Alona Beach, diving spots, and easy day trips to the Chocolate Hills.',
        matchNames: ['panglao'],
      },
      {
        name: 'Puerto Princesa',
        location: 'Puerto Princesa, Palawan',
        description:
          'The gateway to Palawan and the home of the Puerto Princesa Underground River, one of the most visited natural sites in the country.',
        matchNames: ['city of puerto princesa'],
      },
      {
        name: 'Vigan',
        location: 'Vigan City, Ilocos Sur',
        description:
          'A Spanish-era town with cobblestone Calle Crisologo, ancestral houses, and horse-drawn kalesa rides, and a UNESCO World Heritage Site.',
        matchNames: ['city of vigan'],
      },
      {
        name: 'Davao',
        location: 'Davao City, Davao del Sur',
        description:
          'The largest city in Mindanao, close to Samal Island and the Philippine Eagle Center, and famous for its durian and fresh seafood.',
        matchNames: ['city of davao', 'davao city'],
      },
    ],
  },
];

// Every place from every category, without duplicates (used by the "Surprise me" button).
export const ALL_FEATURED_PLACES: FeaturedPlace[] = FEATURED_CATEGORIES.flatMap((c) => c.places).filter(
  (place, index, all) => all.findIndex((p) => p.name === place.name) === index,
);

// Finds the featured entry for a PSGC city/municipality name such as "City of Baguio".
export const findFeaturedByCityName = (cityName: string): FeaturedPlace | undefined => {
  const full = cityName.toLowerCase().trim();
  const short = full.replace(/^(city of|municipality of)\s+/, '').replace(/\s+city$/, '');
  return ALL_FEATURED_PLACES.find((place) =>
    place.matchNames.some((m) => m === full || m === short),
  );
};