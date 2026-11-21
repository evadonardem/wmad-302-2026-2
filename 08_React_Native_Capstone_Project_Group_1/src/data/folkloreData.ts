// Philippine folklore and popular local legends for the Halloween theme.
// The stories are retold in our own words. They are tales passed down by storytellers, so versions
// differ from town to town, and the haunted-place stories are popular legends, not facts.
export const FOLKLORE_SOURCE =
  'Retold from traditional Philippine folklore and popular local legends. Versions vary by region and storyteller.';

export type FolkloreStory = {
  name: string;
  emoji: string;
  type: 'creature' | 'legend' | 'haunted';
  where: string;
  story: string;
  place: string; // name used for the photo search; empty when the tale is not tied to one place
};

export const FOLKLORE: FolkloreStory[] = [
  {
    name: 'Manananggal',
    emoji: '🦇',
    type: 'creature',
    where: 'Visayas (tales are often set in Capiz)',
    story:
      'A creature said to split her body at night. Her upper body grows wings and flies off to hunt while the lower half stays hidden. In the stories, salt or garlic sprinkled on the hidden half stops her from joining it again.',
    place: 'Capiz',
  },
  {
    name: 'Tikbalang',
    emoji: '🐴',
    type: 'creature',
    where: 'Forests and mountain trails, mostly in Luzon',
    story:
      'A tall, horse-headed creature that leads travelers astray on forest paths. Storytellers say wearing your shirt inside out, or asking permission with "tabi-tabi po", keeps you safe.',
    place: '',
  },
  {
    name: 'Kapre',
    emoji: '🌳',
    type: 'creature',
    where: 'Old balete and acacia trees, across the country',
    story:
      'A giant who lives in big old trees and smokes an enormous cigar. The smell of cigar smoke at night is a sign he is near. Depending on the tale, he is a friendly giant or a trickster.',
    place: '',
  },
  {
    name: 'Maria Makiling',
    emoji: '🧚',
    type: 'legend',
    where: 'Mount Makiling, Los Baños, Laguna',
    story:
      'The diwata, or guardian spirit, of Mount Makiling. Tales tell of her kindness to farmers who respect the mountain, and of her sadness and anger when people harm the forest.',
    place: 'Los Baños',
  },
  {
    name: 'The White Lady of Balete Drive',
    emoji: '👻',
    type: 'haunted',
    where: 'Balete Drive, Quezon City, Metro Manila',
    story:
      'One of the best-known urban legends in the country. Drivers swap stories of a woman in white seen along the dark, tree-lined road at night, sometimes in the rear-view mirror.',
    place: 'Quezon City',
  },
  {
    name: 'Diplomat Hotel',
    emoji: '🏚️',
    type: 'haunted',
    where: 'Dominican Hill, Baguio City, Benguet',
    story:
      'An abandoned hilltop building, once a retreat house and a hotel, that locals and visitors say is haunted by strange sounds and shadows.',
    place: 'Baguio',
  },
  {
    name: 'Fort Santiago',
    emoji: '🕯️',
    type: 'haunted',
    where: 'Intramuros, Manila',
    story:
      'The old fort\u2019s dungeons held prisoners in the Spanish and Japanese eras. Guides and visitors share stories of footsteps and whispers after dark.',
    place: 'Intramuros',
  },
  {
    name: 'Malinta Tunnel',
    emoji: '🔦',
    type: 'haunted',
    where: 'Corregidor Island, Cavite',
    story:
      'A World War II tunnel where soldiers once sheltered. Visitors on night tours tell of lights and voices from the past.',
    place: 'Corregidor',
  },
];