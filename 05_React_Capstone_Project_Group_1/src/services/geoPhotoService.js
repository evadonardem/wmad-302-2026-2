import axios from 'axios';

// TODO 1.1 [Base Configuration]: Use the fixed PSGC Gitlab API trailing-slash structure format
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

// Vite exposes environment variables on the import.meta.env object
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const getRegions = async () => {
  // TODO 1.2 [Regions Retrieval]: Fetch the full array of regions from the PSGC host.
  // Perform an asynchronous GET request using axios, catch errors smoothly, and return the dataset array.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/`
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/regions/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

// Remembers the cities/municipalities of the most recently loaded region, so the
// description lookup can find the province and type (city or municipality) by name
let cityIndex = {};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  // TODO 1.3 [Chained Location Population]: Complete the dynamic lookup using string interpolation.
  // Validate that a truthy regionCode parameter is provided prior to generating network requests.
  // Execute an async GET request hitting the exact trailing-slash path directory.
  // Targeted Path Format: `${PSGC_BASE_URL}/regions/{regionCode}/cities-municipalities/`
  if (!regionCode) return [];

  try {
    const response = await axios.get(
      `${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`
    );

    cityIndex = {};
    response.data.forEach((city) => {
      cityIndex[city.name] = city;
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching cities for region ${regionCode}:`, error);
    return [];
  }
};

// ---------- Helpers for matching photos to the chosen place ----------

// Strip "City of" / "Municipality of" / "City" so the name matches photo captions
const getShortName = (name) =>
  name
    .replace(/^(city of|municipality of)\s+/i, '')
    .replace(/\s+(city|municipality)$/i, '')
    .trim();

// Lowercase and remove accents (e.g. "Peñablanca" -> "penablanca")
const normalize = (text) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Turns a raw Pexels photo into the object used by the app:
// - imageUrl: "large" size, used in the enlarged view, favorites and sharing
// - thumbUrl: "medium" size, used on the cards so the grid loads much faster
// - width / height / sources: the original size and every available size (for the Download menu)
const mapPhoto = (photo, fallbackAlt) => ({
  id: photo.id,
  imageUrl: photo.src.large,
  thumbUrl: photo.src.medium,
  photographer: photo.photographer,
  photographerUrl: photo.photographer_url,
  altText: photo.alt || fallbackAlt,
  width: photo.width,
  height: photo.height,
  sources: {
    small: photo.src.small,
    medium: photo.src.medium,
    large: photo.src.large,
    hd: photo.src.large2x,
    original: photo.src.original,
  },
});

// Pexels allows up to 80 photos per request. We request several pages of results per query
// so the gallery can have more than one page of photos (50 per page) after filtering.
// Page 1 is loaded first so the first photos appear quickly, the other pages load in the background.
// Each new search makes up to (number of queries x PEXELS_PAGES) requests, so lower this if you hit the rate limit.
const PEXELS_PER_REQUEST = 80;
const PEXELS_PAGES = 3;

// Finished searches are remembered, so searching the same place again is instant and uses no requests
const searchCache = new Map();

// Fetches one page of one Pexels query. Never throws, a failed request just gives no photos.
const fetchPexelsPage = async (query, page) => {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: PEXELS_PER_REQUEST, page },
      headers: { Authorization: PEXELS_API_KEY },
    });
    return {
      ok: true,
      photos: response.data.photos,
      hasMore: Boolean(response.data.next_page),
    };
  } catch (error) {
    console.error(`Pexels request failed for "${query}" (page ${page}):`, error);
    return { ok: false, photos: [], hasMore: false };
  }
};

// onMoreResults(allResults) is called later with the full list when the background pages finish
// options.firstPageOnly: a quick check that only loads page 1 of the first query (used by "Surprise me")
export const searchPhotosByLocation = async (
  locationName,
  onMoreResults,
  { firstPageOnly = false } = {}
) => {
  // TODO 1.4 [Pexels Query Resolution]: Formulate the dynamic target endpoint string URL.
  // a. Create a combined query keyword string: "[locationName] tourist spot".
  // b. Query the structural Pexels endpoint path: 'https://pexels.com[keyword]&per_page=12'.
  // c. Ensure you inject your authentication token securely using an authorization header parameter configuration block.
  // d. Map through the resulting array and return streamlined objects styled exactly like: 
  //    { id, imageUrl: [large image src URL], photographer, photographerUrl, altText }
  // e. Provide a backup structural object array inside your catch layer shield to handle error edge cases.
  if (!locationName) return [];

  if (searchCache.has(locationName)) return searchCache.get(locationName);

  const shortName = getShortName(locationName);
  const matcher = new RegExp(`\\b${escapeRegex(normalize(shortName))}\\b`);

  const allQueries = [
    `${shortName} Philippines`,
    `${shortName} Philippines tourist spot`,
  ];
  const queries = firstPageOnly ? allQueries.slice(0, 1) : allQueries;

  // Merge the batches and remove duplicates. A photo is a duplicate if it has the same ID,
  // or the same photographer + caption + size (re-uploads of one photo).
  // Then keep only photos whose caption actually mentions the place
  // (the gallery splits the result into pages of 50)
  const buildResults = (batches) => {
    const seenIds = new Set();
    const seenSignatures = new Set();
    return batches
      .flatMap((batch) => batch.photos)
      .filter((photo) => {
        const signature = `${photo.photographer}|${normalize(photo.alt)}|${photo.width}x${photo.height}`;
        if (seenIds.has(photo.id) || seenSignatures.has(signature)) return false;
        seenIds.add(photo.id);
        seenSignatures.add(signature);
        return true;
      })
      .filter((photo) => matcher.test(normalize(photo.alt)))
      .map((photo) => mapPhoto(photo, `${locationName} tourist spot`));
  };

  try {
    // Step 1: page 1 of each query only, so the first photos show up quickly
    const firstBatches = await Promise.all(queries.map((query) => fetchPexelsPage(query, 1)));

    if (firstBatches.every((batch) => !batch.ok)) {
      throw new Error('All Pexels requests failed');
    }

    const firstResults = buildResults(firstBatches);

    // Quick check mode: stop here (these results are not cached because they are incomplete)
    if (firstPageOnly) return firstResults;

    // Step 2: the remaining pages (only for queries that have more results)
    const loadRemaining = async () => {
      const requests = [];
      queries.forEach((query, index) => {
        if (!firstBatches[index].hasMore) return;
        for (let page = 2; page <= PEXELS_PAGES; page += 1) {
          requests.push(fetchPexelsPage(query, page));
        }
      });

      const moreBatches = await Promise.all(requests);
      const allBatches = [...firstBatches, ...moreBatches];
      return {
        results: buildResults(allBatches),
        complete: allBatches.every((batch) => batch.ok), // failed requests are not cached
      };
    };

    // We already have photos: show them now and add the rest when it arrives
    if (firstResults.length > 0) {
      loadRemaining().then(({ results, complete }) => {
        if (complete) searchCache.set(locationName, results);
        if (results.length !== firstResults.length) onMoreResults?.(results);
      });
      return firstResults;
    }

    // Nothing matched yet: wait for the other pages before saying there are no photos
    const { results, complete } = await loadRemaining();
    if (complete) searchCache.set(locationName, results);
    return results;
  } catch (error) {
    console.error('Error fetching photos from Pexels:', error);
    return [];
  }
};

// ---------- Place description (Wikipedia first, PSGC-based fallback) ----------

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Removes bracketed parts like "National Capital Region (NCR)" -> "National Capital Region"
const cleanName = (name) => (name || '').replace(/\s*\(.*?\)\s*/g, ' ').trim() || null;

// Looks up a province or region name from PSGC (cached)
const psgcNameCache = {};
const getPsgcName = async (path) => {
  if (psgcNameCache[path]) return psgcNameCache[path];
  try {
    const response = await axios.get(`${PSGC_BASE_URL}/${path}/`);
    psgcNameCache[path] = response.data.name;
    return response.data.name;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
};

// Fetches Wikipedia page summaries (by exact title or by search)
const fetchWikiPages = async (params) => {
  const response = await axios.get(WIKI_API, {
    params: {
      action: 'query',
      prop: 'extracts|pageprops',
      ppprop: 'disambiguation',
      exintro: 1,
      explaintext: 1,
      exsentences: 4,
      exlimit: 'max',
      redirects: 1,
      format: 'json',
      origin: '*',
      ...params,
    },
  });
  return Object.values(response.data?.query?.pages || {});
};

// A page is usable if it exists, is not a disambiguation page, and is about the Philippines
const isUsablePage = (page, province) =>
  page &&
  !('missing' in page) &&
  page.extract &&
  !page.pageprops?.disambiguation &&
  (/philippines/i.test(page.extract) ||
    (province && normalize(page.extract).includes(normalize(province))));

const toDescription = (page) => ({
  title: page.title,
  text: page.extract,
  url: `https://en.wikipedia.org/?curid=${page.pageid}`,
});

const fetchPlaceDescription = async (locationName, place) => {
  const shortName = cleanName(getShortName(locationName)) || locationName;

  // Province (or region for NCR) from PSGC, used for exact Wikipedia titles
  let province = null;
  let regionName = null;
  if (place?.provinceCode) {
    province = cleanName(await getPsgcName(`provinces/${place.provinceCode}`));
  }
  if (!province && place?.regionCode) {
    regionName = cleanName(await getPsgcName(`regions/${place.regionCode}`));
  }

  // 1. Try exact Wikipedia titles ("Sablan, Benguet", "Baguio", "Cebu City")
  // All titles are requested at the same time, then the first usable one (in this order) wins
  const candidates = [
    province && `${shortName}, ${province}`,
    shortName,
    (!place || place.isCity) && `${shortName} City`,
  ].filter(Boolean);

  const candidatePages = await Promise.all(
    candidates.map((title) =>
      fetchWikiPages({ titles: title })
        .then(([page]) => page)
        .catch((error) => {
          console.error(`Wikipedia lookup failed for "${title}":`, error);
          return null;
        })
    )
  );
  const exactMatch = candidatePages.find((page) => isUsablePage(page, province));
  if (exactMatch) return toDescription(exactMatch);

  // 2. Search Wikipedia and pick the best matching result
  try {
    const searchText = `${shortName} ${province || ''} Philippines`.replace(/\s+/g, ' ').trim();
    const pages = await fetchWikiPages({
      generator: 'search',
      gsrsearch: searchText,
      gsrlimit: 5,
    });
    pages.sort((a, b) => a.index - b.index);
    const match = pages.find(
      (page) =>
        isUsablePage(page, province) &&
        normalize(page.title).startsWith(normalize(shortName))
    );
    if (match) return toDescription(match);
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
  }

  // 3. Fallback: build a short description from PSGC data
  const kind = place ? (place.isCity ? 'city' : 'municipality') : 'place';
  let where = 'in the Philippines';
  if (province) where = `in the province of ${province}, Philippines`;
  else if (regionName) where = `in the ${regionName}, Philippines`;

  return {
    title: shortName,
    text: `${shortName} is a ${kind} ${where}. A detailed history of this place is not available yet.`,
    url: null,
  };
};

// Descriptions are remembered too, so opening the same place again is instant
const descriptionCache = new Map();

// knownPlace (optional) is the PSGC record of the place. "Surprise me" passes it,
// the normal search finds it by name in the most recently loaded region.
export const getPlaceDescription = (locationName, knownPlace) => {
  if (!locationName) return Promise.resolve(null);

  const place = knownPlace || cityIndex[locationName]; // PSGC record of the selected place, if known
  const cacheKey = place ? place.code : locationName;

  if (!descriptionCache.has(cacheKey)) {
    descriptionCache.set(
      cacheKey,
      fetchPlaceDescription(locationName, place).catch((error) => {
        console.error('Error fetching place description:', error);
        descriptionCache.delete(cacheKey); // so it can retry next time
        return null;
      })
    );
  }
  return descriptionCache.get(cacheKey);
};

// ---------- Featured spot photos (one photo per spot, cached) ----------

const featuredPhotoCache = {};

// Featured photos are also saved in localStorage for a few days, so reloading the page
// shows them instantly without asking Pexels again
const FEATURED_STORE_KEY = 'lakbay-ph-featured-photos';
const FEATURED_STORE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const readFeaturedStore = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FEATURED_STORE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
};
const featuredStore = readFeaturedStore();

const saveFeaturedStore = () => {
  try {
    localStorage.setItem(FEATURED_STORE_KEY, JSON.stringify(featuredStore));
  } catch (error) {
    console.error('Could not save featured photos:', error);
  }
};

// Fetches the first Pexels photo for one query (throws on network errors)
const fetchFirstPhoto = async (query) => {
  const response = await axios.get('https://api.pexels.com/v1/search', {
    params: { query, per_page: 1 },
    headers: { Authorization: PEXELS_API_KEY },
  });
  const photo = response.data.photos[0];
  return photo ? mapPhoto(photo, '') : null;
};

export const getFeaturedPhoto = async (query, fallbackQuery) => {
  if (query in featuredPhotoCache) return featuredPhotoCache[query];

  // Saved from an earlier visit (and not too old)
  const saved = featuredStore[query];
  if (saved && Date.now() - saved.savedAt < FEATURED_STORE_MAX_AGE) {
    featuredPhotoCache[query] = saved.photo;
    return saved.photo;
  }

  try {
    // Try the exact query first, then the broader fallback if nothing was found
    const result =
      (await fetchFirstPhoto(query)) ||
      (fallbackQuery ? await fetchFirstPhoto(fallbackQuery) : null);

    featuredPhotoCache[query] = result;
    if (result) {
      featuredStore[query] = { photo: result, savedAt: Date.now() };
      saveFeaturedStore();
    }
    return result;
  } catch (error) {
    console.error(`Error fetching featured photo for "${query}":`, error);
    return null; // not cached, so it can retry later
  }
};

// ---------- Random "normal" place for the Surprise me button ----------

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

let allPlacesCache = null; // every city and municipality (loaded once)
const regionPlacesCache = {}; // backup plan: region code -> its cities and municipalities

// Picks a random city or municipality from PSGC.
// onlyCities = true skips the municipalities (cities usually have more photos).
const getRandomPlace = async (onlyCities) => {
  // Easiest way: one request that lists every city and municipality (uniform random pick)
  if (!allPlacesCache) {
    try {
      const response = await axios.get(`${PSGC_BASE_URL}/cities-municipalities/`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        allPlacesCache = response.data;
      }
    } catch (error) {
      console.error('Error fetching all cities and municipalities:', error);
    }
  }

  if (allPlacesCache) {
    const choices = onlyCities ? allPlacesCache.filter((place) => place.isCity) : allPlacesCache;
    return choices.length > 0 ? pickRandom(choices) : null;
  }

  // Backup plan: pick a random region first, then one of its cities or municipalities
  const regions = await getRegions();
  if (regions.length === 0) return null;
  const region = pickRandom(regions);

  if (!regionPlacesCache[region.code]) {
    try {
      const response = await axios.get(
        `${PSGC_BASE_URL}/regions/${region.code}/cities-municipalities/`
      );
      regionPlacesCache[region.code] = response.data;
    } catch (error) {
      console.error(`Error fetching cities for region ${region.code}:`, error);
      return null;
    }
  }

  const places = onlyCities
    ? regionPlacesCache[region.code].filter((place) => place.isCity)
    : regionPlacesCache[region.code];
  return places.length > 0 ? pickRandom(places) : null;
};

const SURPRISE_TRIES = 6; // how many random places to try before giving up

// Finds a random place that has at least one photo.
// Returns { place, location, photo } or null if nothing was found.
export const getSurprisePlace = async () => {
  for (let attempt = 0; attempt < SURPRISE_TRIES; attempt += 1) {
    // The first 2 tries can be any city or municipality, after that only cities
    const place = await getRandomPlace(attempt >= 2);
    if (!place) return null; // PSGC could not be reached

    // Quick check: page 1 of one Pexels query (the caption must mention the place)
    const photos = await searchPhotosByLocation(place.name, undefined, { firstPageOnly: true });
    if (photos.length === 0) continue;

    // Province for the label, or the region for places without a province (like Metro Manila)
    let location = null;
    if (place.provinceCode) {
      location = cleanName(await getPsgcName(`provinces/${place.provinceCode}`));
    }
    if (!location && place.regionCode) {
      location = cleanName(await getPsgcName(`regions/${place.regionCode}`));
    }

    return { place, location, photo: pickRandom(photos) };
  }

  return null;
};