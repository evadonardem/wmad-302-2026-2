import React, { useEffect, useRef, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import { Search } from '@mui/icons-material';
import { getRegions, getProvincesOrCities, getTownsOfProvince } from '../services/geoPhotoService';

// "Ilocos Region" + "Region I" -> "Ilocos Region (Region I)"
const regionLabel = (r) => (r.regionName && !r.name.includes(r.regionName) ? `${r.name} (${r.regionName})` : r.name);

// Region (PSGC) -> Province (PSGC). Regions without provinces (NCR) list their cities instead.
export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [regionsLoaded, setRegionsLoaded] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provincesLoaded, setProvincesLoaded] = useState(false);
  const [region, setRegion] = useState(''); // region code
  const [province, setProvince] = useState(''); // province (or city) code
  const [towns, setTowns] = useState([]);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [town, setTown] = useState(''); // municipality / city code
  const requestRef = useRef(0);
  const townRequestRef = useRef(0);

  useEffect(() => {
    let ignore = false;
    getRegions().then((data) => {
      if (ignore) return;
      setRegions(data);
      setRegionsLoaded(true);
    });
    return () => { ignore = true; };
  }, []);

  const handleRegionChange = (e) => {
    const code = e.target.value;
    const id = ++requestRef.current;
    setRegion(code);
    setProvince('');
    setProvinces([]);
    setProvincesLoaded(false);
    townRequestRef.current += 1;
    setTown('');
    setTowns([]);
    setLoadingTowns(false);
    if (!code) return;
    setLoadingProvinces(true);
    getProvincesOrCities(code).then((list) => {
      if (id !== requestRef.current) return;
      setProvinces(list);
      setLoadingProvinces(false);
      setProvincesLoaded(true);
    });
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const chosen = provinces.find((p) => p.code === code);
    const id = ++townRequestRef.current;
    setProvince(code);
    setTown('');
    setTowns([]);
    if (!chosen || chosen.kind !== 'province') return; // NCR entries are already cities
    setLoadingTowns(true);
    getTownsOfProvince(code).then((list) => {
      if (id !== townRequestRef.current) return;
      setTowns(list);
      setLoadingTowns(false);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      region: regions.find((r) => r.code === region),
      province: provinces.find((p) => p.code === province) || null,
      municipality: towns.find((t) => t.code === town) || null,
    });
  };

  const isCityList = provinces[0]?.kind === 'city';
  const unit = isCityList ? 'City' : 'Province';
  const regionPlaceholder = regionsLoaded ? 'Select region' : 'Loading regions…';
  const provincePlaceholder = loadingProvinces ? 'Loading…' : `Select ${unit.toLowerCase()}`;
  const townPlaceholder = !province
    ? 'Choose a province first'
    : loadingTowns ? 'Loading…' : isCityList ? 'Not needed for cities' : 'Select municipality';
  const regionFailed = regionsLoaded && regions.length === 0;
  const provinceFailed = provincesLoaded && provinces.length === 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="sb">
        <Select
          className="sel"
          variant="standard"
          disableUnderline
          displayEmpty
          value={region}
          onChange={handleRegionChange}
          inputProps={{ 'aria-label': 'Region' }}
          renderValue={(v) => (v ? regionLabel(regions.find((r) => r.code === v) || { name: v }) : <span className="placeholder">{regionPlaceholder}</span>)}
        >
          {regions.map((r) => (
            <MenuItem key={r.code} value={r.code}>{regionLabel(r)}</MenuItem>
          ))}
        </Select>

        <Select
          className="sel"
          variant="standard"
          disableUnderline
          displayEmpty
          disabled={!region || loadingProvinces}
          value={province}
          onChange={handleProvinceChange}
          inputProps={{ 'aria-label': unit }}
          renderValue={(v) => (v ? provinces.find((p) => p.code === v)?.name : <span className="placeholder">{region ? provincePlaceholder : 'Choose a region first'}</span>)}
        >
          <MenuItem value="">{isCityList ? 'All cities' : 'All provinces'}</MenuItem>
          {provinces.map((p) => (
            <MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>
          ))}
        </Select>

        <Select
          className="sel"
          variant="standard"
          disableUnderline
          displayEmpty
          disabled={!province || loadingTowns || towns.length === 0}
          value={town}
          onChange={(e) => setTown(e.target.value)}
          inputProps={{ 'aria-label': 'Municipality' }}
          renderValue={(v) => (v ? towns.find((t) => t.code === v)?.name : <span className="placeholder">{townPlaceholder}</span>)}
        >
          <MenuItem value="">All municipalities / cities</MenuItem>
          {towns.map((t) => (
            <MenuItem key={t.code} value={t.code}>{t.name}</MenuItem>
          ))}
        </Select>

        <button type="submit" className="go" disabled={!region}>
          <Search fontSize="small" /> Search
        </button>
      </div>
      {regionFailed && <p className="form-note">Could not load regions. Check your connection and refresh.</p>}
      {provinceFailed && <p className="form-note">Could not load this list. Try another region.</p>}
    </form>
  );
}
