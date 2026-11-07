import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// English / Filipino text for the app. Use t('key') anywhere, and t('key', { name: 'Baguio' })
// for texts with {name}-style blanks. The chosen language is saved on the device.
export type Language = 'en' | 'fil';

const STRINGS = {
  en: {
    tagline: 'Undas Edition',
    subtitle:
      'Misty mountains, moonlit beaches and old heritage towns: explore spooky and scenic spots across the Philippines',
    surprise: 'Surprise me',
    surpriseResult: 'Your surprise place',
    backToFeatured: 'Back to featured places',
    loadMore: 'Load more photos',
    topic_featured: 'Featured',
    topic_beaches: 'Beaches',
    topic_mountains: 'Mountains',
    topic_heritage: 'Heritage',
    topic_food: 'Food',
    placesHeading: 'Places to explore this Undas',
    recentHeading: 'Recently viewed',
    tab_featured: 'Featured',
    tab_beautiful: 'Most Beautiful',
    tab_visited: 'Most Visited',
    sourceLabel: 'Source:',
    noPhotoYet: 'No photo yet',
    aboutArea: 'About {name}',
    areaIs: '{name} is a {kind} in {where}.',
    kindCity: 'city',
    kindMunicipality: 'municipality',
    capitalNote: ' It is the provincial capital.',
    factsSource: 'Location facts: Philippine Standard Geographic Code (PSGC)',
    highlightsSource: '. Highlights: Department of Tourism news and travel guides.',
    openInMaps: 'Open in Maps',
    emptyArea: 'No photos of {place} were found yet.',
    emptyTopic: 'No {topic} photos were found for {place}.',
    loadError: 'Could not load photos. Check your connection and try again.',
    tryAgain: 'Try again',
    capturedByColon: '📸 Captured by:',
    capturedBy: 'Captured by',
    download: 'Download',
    favorite: 'Favorite',
    saved: 'Saved',
    share: 'Share',
    size_small: 'Small',
    size_medium: 'Medium',
    size_large: 'Large',
    size_large2x: 'HD',
    size_original: 'Original',
    dl_started: 'Download started.',
    dl_saved: 'Saved to your gallery.',
    dl_opened: 'Opened the image so you can save it from there.',
    dl_denied: 'Allow photo access to save images to your gallery.',
    dl_failed: 'Could not download this photo. Please try again.',
    photoTitle: 'By {name}',
    spotTitle: 'Tourist Spot',
    favoritesTitle: 'Favorites',
    favHint: 'Tap a photo to open it. Tap the heart to remove it from your favorites.',
    favEmpty: 'No favorites yet — tap the heart on a photo to save it here.',
    historyTitle: 'Recent Searches',
    histIntro: 'Tap a city to jump back into that search.',
    histEmpty: 'No searches yet — run a search on the Search tab first.',
    selectRegion: 'Select Region',
    selectCity: 'Select City / Municipality',
    searchBtn: 'Search',
    islandAll: 'All',
    tabSearch: 'Search',
    tabAbout: 'About',
    switchLanguage: 'Switch language',
    weatherTitle: 'Weather in {name}',
    weatherNow: 'Now',
    humidity: 'Humidity',
    wind: 'Wind',
    weatherSource: 'Weather: Open-Meteo',
    w_clear: 'Clear sky',
    w_cloudy: 'Partly cloudy',
    w_fog: 'Fog',
    w_drizzle: 'Drizzle',
    w_rain: 'Rain',
    w_storm: 'Thunderstorm',
    tripTitle: 'My Trip',
    tripEmpty: 'No places yet. Search a place and tap "Add to My Trip".',
    tripAdd: 'Add to My Trip',
    tripIn: 'In My Trip',
    tripNote: 'Notes (dates, who is coming, things to bring...)',
    tripView: 'View photos',
    tripRemove: 'Remove from trip',
    tripHint: 'Your trip list is saved on this device.',
    placeSearchLabel: 'Search a place (city, town or tourist spot)',
    placeSearchNone: 'No place found',
    nearMe: 'Near me',
    locDenied: 'Location permission was denied.',
    locUnavailable: 'Could not get your location.',
    locNoMatch: 'Could not match your location to a city or municipality.',
    festivalsButton: 'Festivals & events',
    festivalsTitle: 'Festivals & Events',
    festivalsIntro:
      'Sorted from this month onwards. Dates change every year, so check with the local tourism office before you go.',
    thisMonth: 'This month',
    seePhotos: 'See photos',
    folkloreButton: 'Folklore & haunted places',
    folkloreTitle: 'Folklore & Haunted Places',
    folkloreIntro:
      'Old stories and popular local legends, retold in our own words. They are tales, not facts. Please be respectful and stay safe when visiting these places.',
    typeCreature: 'Creature',
    typeLegend: 'Legend',
    typeHaunted: 'Haunted place',
    whereLabel: 'Where:',
  },
  fil: {
    tagline: 'Edisyong Undas',
    subtitle:
      'Mga mahamog na bundok, dalampasigang naliliwanagan ng buwan, at lumang bayang makasaysayan: tuklasin ang nakakatakot at magagandang lugar sa buong Pilipinas',
    surprise: 'Sorpresahin ako',
    surpriseResult: 'Ang sorpresang lugar mo',
    backToFeatured: 'Bumalik sa mga tampok na lugar',
    loadMore: 'Magpakita pa ng litrato',
    topic_featured: 'Tampok',
    topic_beaches: 'Dalampasigan',
    topic_mountains: 'Bundok',
    topic_heritage: 'Pamana',
    topic_food: 'Pagkain',
    placesHeading: 'Mga lugar na bibisitahin ngayong Undas',
    recentHeading: 'Kamakailang tiningnan',
    tab_featured: 'Tampok',
    tab_beautiful: 'Pinakamaganda',
    tab_visited: 'Pinakabinibisita',
    sourceLabel: 'Pinagmulan:',
    noPhotoYet: 'Wala pang litrato',
    aboutArea: 'Tungkol sa {name}',
    areaIs: 'Ang {name} ay isang {kind} sa {where}.',
    kindCity: 'lungsod',
    kindMunicipality: 'bayan',
    capitalNote: ' Ito ang kabisera ng lalawigan.',
    factsSource: 'Datos ng lokasyon: Philippine Standard Geographic Code (PSGC)',
    highlightsSource: '. Mga tampok: balita ng Department of Tourism at mga gabay sa paglalakbay.',
    openInMaps: 'Buksan sa Mapa',
    emptyArea: 'Wala pang nakitang litrato ng {place}.',
    emptyTopic: 'Walang nakitang litrato ng {topic} para sa {place}.',
    loadError: 'Hindi ma-load ang mga litrato. Suriin ang koneksyon at subukan muli.',
    tryAgain: 'Subukan muli',
    capturedByColon: '📸 Kuha ni:',
    capturedBy: 'Kuha ni',
    download: 'I-download',
    favorite: 'Paborito',
    saved: 'Nai-save',
    share: 'Ibahagi',
    size_small: 'Maliit',
    size_medium: 'Katamtaman',
    size_large: 'Malaki',
    size_large2x: 'HD',
    size_original: 'Orihinal',
    dl_started: 'Nagsimula na ang pag-download.',
    dl_saved: 'Nai-save sa iyong gallery.',
    dl_opened: 'Binuksan ang larawan para ma-save mo mula roon.',
    dl_denied: 'Payagan ang access sa mga larawan para ma-save sa gallery.',
    dl_failed: 'Hindi ma-download ang larawang ito. Subukan muli.',
    photoTitle: 'Kuha ni {name}',
    spotTitle: 'Lugar na Pasyalan',
    favoritesTitle: 'Mga Paborito',
    favHint: 'Pindutin ang litrato para buksan. Pindutin ang puso para alisin sa mga paborito.',
    favEmpty: 'Wala pang paborito — pindutin ang puso sa litrato para i-save dito.',
    historyTitle: 'Mga Kamakailang Hinanap',
    histIntro: 'Pindutin ang lungsod para ulitin ang paghahanap.',
    histEmpty: 'Wala pang paghahanap — maghanap muna sa Search tab.',
    selectRegion: 'Pumili ng Rehiyon',
    selectCity: 'Pumili ng Lungsod / Bayan',
    searchBtn: 'Hanapin',
    islandAll: 'Lahat',
    tabSearch: 'Hanapin',
    tabAbout: 'Tungkol',
    switchLanguage: 'Palitan ang wika',
    weatherTitle: 'Panahon sa {name}',
    weatherNow: 'Ngayon',
    humidity: 'Halumigmig',
    wind: 'Hangin',
    weatherSource: 'Panahon: Open-Meteo',
    w_clear: 'Maaliwalas',
    w_cloudy: 'Maulap-ulap',
    w_fog: 'Mahamog',
    w_drizzle: 'Ambon',
    w_rain: 'Maulan',
    w_storm: 'Kulog at kidlat',
    tripTitle: 'Aking Biyahe',
    tripEmpty: 'Wala pang lugar. Maghanap ng lugar at pindutin ang "Idagdag sa Aking Biyahe".',
    tripAdd: 'Idagdag sa Aking Biyahe',
    tripIn: 'Nasa Aking Biyahe',
    tripNote: 'Mga tala (petsa, kasama, dadalhin...)',
    tripView: 'Tingnan ang litrato',
    tripRemove: 'Alisin sa biyahe',
    tripHint: 'Naka-save sa device na ito ang listahan ng iyong biyahe.',
    placeSearchLabel: 'Maghanap ng lugar (lungsod, bayan o pasyalan)',
    placeSearchNone: 'Walang nahanap na lugar',
    nearMe: 'Malapit sa akin',
    locDenied: 'Hindi pinayagan ang access sa lokasyon.',
    locUnavailable: 'Hindi makuha ang iyong lokasyon.',
    locNoMatch: 'Hindi maitugma ang iyong lokasyon sa isang lungsod o bayan.',
    festivalsButton: 'Mga pista at kaganapan',
    festivalsTitle: 'Mga Pista at Kaganapan',
    festivalsIntro:
      'Nakaayos mula ngayong buwan. Nagbabago ang petsa taon-taon, kaya magtanong muna sa lokal na tanggapan ng turismo.',
    thisMonth: 'Ngayong buwan',
    seePhotos: 'Tingnan ang litrato',
    folkloreButton: 'Alamat at haunted na lugar',
    folkloreTitle: 'Alamat at mga Haunted na Lugar',
    folkloreIntro:
      'Mga lumang kuwento at tanyag na alamat, isinalaysay sa sarili naming salita. Mga kuwento lamang ito, hindi katotohanan. Maging magalang at mag-ingat kapag bumibisita sa mga lugar na ito.',
    typeCreature: 'Nilalang',
    typeLegend: 'Alamat',
    typeHaunted: 'Haunted na lugar',
    whereLabel: 'Saan:',
  },
} as const;

export type StringKey = keyof (typeof STRINGS)['en'];
type Vars = Record<string, string | number>;

type LanguageValue = {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: StringKey, vars?: Vars) => string;
};

const translate = (lang: Language, key: StringKey, vars?: Vars): string => {
  let text: string = STRINGS[lang][key];
  if (vars) {
    for (const name of Object.keys(vars)) {
      text = text.split(`{${name}}`).join(String(vars[name]));
    }
  }
  return text;
};

const STORAGE_KEY = 'lakbay_language';

const LanguageContext = createContext<LanguageValue>({
  lang: 'en',
  toggleLanguage: () => {},
  t: (key, vars) => translate('en', key, vars),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  // Load the saved language once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'fil') setLang(saved);
      })
      .catch(() => {
        // Nothing saved yet: stay on English.
      });
  }, []);

  const toggleLanguage = () => {
    const next: Language = lang === 'en' ? 'fil' : 'en';
    setLang(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // The language still changes for this session if saving fails.
    });
  };

  const t = (key: StringKey, vars?: Vars) => translate(lang, key, vars);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);