import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { TYPE_STYLE, findCurated, cleanPlaceName } from '../data/places';
import { mapSearchUrl, mapDirectionsUrl } from '../utils/links';

const TOWN_LIMIT = 24;

function Links({ query, onPhotos, photoTarget }) {
  return (
    <div className="loc2 spot-links">
      <button type="button" onClick={() => onPhotos(photoTarget)}>📷 Photos</button>
      <a href={mapSearchUrl(query)} target="_blank" rel="noopener noreferrer">📍 View on map</a>
      <a href={mapDirectionsUrl(query)} target="_blank" rel="noopener noreferrer">Directions ↗</a>
    </div>
  );
}

// A hand-picked tourist spot (data/places.js)
function SpotCard({ spot, placeName, onPhotos }) {
  const style = TYPE_STYLE[spot.type] || TYPE_STYLE.Nature;
  const area = spot.area || placeName;
  return (
    <article className="sc">
      <div className="sph" style={{ background: style.bg }}>
        <span aria-hidden="true">{style.emoji}</span>
        <b className="rg2">{area}</b>
      </div>
      <div className="cb">
        <h3 className="st">{spot.name}</h3>
        <div className="tg"><span>{spot.type}</span></div>
        <p className="ds">{spot.desc}</p>
        <Links
          query={`${spot.name}, ${area}, Philippines`}
          onPhotos={onPhotos}
          photoTarget={{ title: spot.name, query: `${spot.name} ${area} Philippines` }}
        />
      </div>
    </article>
  );
}

// A city / municipality from the PSGC API
function TownCard({ town, placeName, onPhotos }) {
  const name = cleanPlaceName(town.name);
  return (
    <article className="sc">
      <div className="sph" style={{ background: 'linear-gradient(180deg,#c9d8e6,#6b8f71 50%,#2f4a3a)' }}>
        <span aria-hidden="true">{town.isCity ? '🏙️' : '🏘️'}</span>
        <b className="rg2">{placeName}</b>
      </div>
      <div className="cb">
        <h3 className="st">{town.name}</h3>
        <div className="tg"><span>{town.isCity ? 'City' : 'Municipality'}</span></div>
        <Links
          query={`${name}, ${placeName}, Philippines`}
          onPhotos={onPhotos}
          photoTarget={{ title: name, query: `${name} ${placeName} Philippines` }}
        />
      </div>
    </article>
  );
}

function SpotGrid({ spots, placeName, onPhotos }) {
  return (
    <div className="spg">
      {spots.map((spot) => (
        <SpotCard key={`${placeName}-${spot.name}`} spot={spot} placeName={placeName} onPhotos={onPhotos} />
      ))}
    </div>
  );
}

// Region search: every PSGC province (or NCR city) with its tourist spots
function RegionBlock({ item, onPhotos }) {
  const spots = findCurated(item)?.spots || [];
  const name = cleanPlaceName(item.name);
  return (
    <div>
      <h3 className="province-title">
        {item.name}{' '}
        <span className="muted">· {spots.length ? `${spots.length} spot${spots.length === 1 ? '' : 's'}` : 'no spots listed yet'}</span>
      </h3>
      <div className="block-links">
        <Links
          query={`${name}, Philippines`}
          onPhotos={onPhotos}
          photoTarget={{ title: name, query: `${name} Philippines tourist spots` }}
        />
      </div>
      {spots.length > 0 && <SpotGrid spots={spots} placeName={name} onPhotos={onPhotos} />}
    </div>
  );
}

// Give this component a `key` that changes with the search so "show all" resets.
export default function SpotList({ selection, places, onPickPhotos }) {
  const [showAll, setShowAll] = useState(false);
  const { region, province, municipality } = selection;
  const curated = findCurated(province);
  const spots = curated?.spots || [];
  const towns = places.towns;
  const shownTowns = showAll ? towns : towns.slice(0, TOWN_LIMIT);

  return (
    <section>
      <div className="mh">
        <div>
          <h2>
            {municipality
              ? `${municipality.name}, ${province.name}`
              : province ? `Tourist spots in ${province.name}` : `Provinces in ${region.name}`}
          </h2>
        </div>
        {places.loading && <CircularProgress size={22} />}
      </div>

      {municipality ? (
        <>
          <div className="spg">
            <TownCard town={municipality} placeName={province.name} onPhotos={onPickPhotos} />
          </div>
        </>
      ) : province ? (
        <>
          {spots.length > 0 && <SpotGrid spots={spots} placeName={province.name} onPhotos={onPickPhotos} />}

          {towns.length > 0 && (
            <>
              <h3 className="province-title">
                Cities &amp; municipalities in {province.name} <span className="muted">· {towns.length}</span>
              </h3>
              <div className="spg">
                {shownTowns.map((town) => (
                  <TownCard key={town.code} town={town} placeName={province.name} onPhotos={onPickPhotos} />
                ))}
              </div>
              {towns.length > TOWN_LIMIT && (
                <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => setShowAll((v) => !v)}>
                  {showAll ? 'Show fewer' : `Show all ${towns.length}`}
                </button>
              )}
            </>
          )}

          {!places.loading && spots.length === 0 && towns.length === 0 && (
            <div className="empty">No places listed for {province.name} yet. The photos below still show the area.</div>
          )}
        </>
      ) : (
        places.provinces.map((item) => <RegionBlock key={item.code} item={item} onPhotos={onPickPhotos} />)
      )}
    </section>
  );
}
