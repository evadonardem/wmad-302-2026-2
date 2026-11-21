// Philippine festivals and events, with descriptions written in our own words.
// Compiled from public festival guides (for example Traveloka, Travellerspoint and Two Monkeys
// Travel). Dates change every year, so always check the Department of Tourism or the local
// tourism office before you travel.
export const FESTIVALS_SOURCE =
  'Compiled from public festival guides (Traveloka, Travellerspoint, Two Monkeys Travel). Dates change every year, so check the Department of Tourism or the local tourism office before you go.';

export type Festival = {
  name: string;
  place: string;      // name used for the photo search; empty when the event is nationwide
  location: string;   // shown on the card
  months: number[];   // 1 = January ... 12 = December
  when: string;       // short text about the date
  description: string;
};

export const FESTIVALS: Festival[] = [
  {
    name: 'Sinulog',
    place: 'Cebu City',
    location: 'Cebu City, Cebu',
    months: [1],
    when: 'Third Sunday of January',
    description:
      'A grand street parade and dance in honor of the Santo Niño, the Child Jesus, with thousands of dancers in bright costumes moving to drumbeats.',
  },
  {
    name: 'Ati-Atihan',
    place: 'Kalibo',
    location: 'Kalibo, Aklan',
    months: [1],
    when: 'Mid-January, ending on the third Sunday',
    description:
      'Often called the mother of Philippine festivals. Dancers with soot-blackened faces and tribal costumes fill the streets to honor the Santo Niño.',
  },
  {
    name: 'Dinagyang',
    place: 'Iloilo City',
    location: 'Iloilo City, Iloilo',
    months: [1],
    when: 'Fourth Sunday of January',
    description:
      'Tribe teams in warrior costumes compete in dance contests honoring the Santo Niño, with a colorful parade of lights at night.',
  },
  {
    name: 'Panagbenga',
    place: 'Baguio',
    location: 'Baguio City, Benguet',
    months: [2],
    when: 'All of February',
    description:
      'The flower festival of Baguio, with floats covered in blooms, street dancing, and cool mountain weather.',
  },
  {
    name: 'Moriones',
    place: 'Marinduque',
    location: 'Marinduque',
    months: [3, 4],
    when: 'Holy Week (March or April)',
    description:
      'Townspeople wear painted wooden masks and Roman soldier costumes and act out the story of the soldier Longinus during Holy Week.',
  },
  {
    name: 'Pahiyas',
    place: 'Lucban',
    location: 'Lucban, Quezon',
    months: [5],
    when: 'May 15',
    description:
      'Houses are covered with colorful rice wafers called kiping, fruits and vegetables to thank San Isidro Labrador for the harvest.',
  },
  {
    name: 'Kadayawan',
    place: 'Davao',
    location: 'Davao City, Davao del Sur',
    months: [8],
    when: 'August',
    description:
      'A thanksgiving festival for nature and for the many peoples of Davao, with tribal dances, flower floats and fruit displays.',
  },
  {
    name: 'Peñafrancia',
    place: 'Naga City',
    location: 'Naga City, Camarines Sur',
    months: [9],
    when: 'September',
    description:
      'The biggest religious festival in Bicol, with a river procession carrying the image of Our Lady of Peñafrancia.',
  },
  {
    name: 'MassKara',
    place: 'Bacolod',
    location: 'Bacolod City, Negros Occidental',
    months: [10],
    when: 'October',
    description:
      'Dancers in bright smiling masks fill the streets of the "City of Smiles", with parades, food fairs and music.',
  },
  {
    name: 'Undas',
    place: '',
    location: 'Nationwide',
    months: [11],
    when: 'November 1 to 2',
    description:
      'All Saints\u2019 Day and All Souls\u2019 Day. Families visit the graves of loved ones, clean and decorate the tombs, light candles and share food. In some provinces children go house to house singing for the souls of the dead, a tradition called Pangangaluluwa.',
  },
  {
    name: 'Higantes',
    place: 'Angono',
    location: 'Angono, Rizal',
    months: [11],
    when: 'Late November',
    description:
      'Giant papier-mâché puppets parade through the streets in honor of San Clemente, the patron saint of fishermen.',
  },
  {
    name: 'Giant Lantern Festival',
    place: 'San Fernando',
    location: 'San Fernando, Pampanga',
    months: [12],
    when: 'Saturday before Christmas Eve',
    description:
      'Huge, glittering lanterns with spinning lights compete in the "Christmas Capital of the Philippines".',
  },
];