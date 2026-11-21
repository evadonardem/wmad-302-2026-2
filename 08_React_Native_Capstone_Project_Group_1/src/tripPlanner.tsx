import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// "My Trip": places the user wants to visit, each with a note. Saved on the device.
export type TripPlace = {
  name: string; // the place name used for the photo search, e.g. "City of Baguio" or "Boracay"
  note: string;
};

const STORAGE_KEY = 'lakbay_trip';

type TripValue = {
  places: TripPlace[];
  isInTrip: (name: string) => boolean;
  addPlace: (name: string) => void;
  removePlace: (name: string) => void;
  setNote: (name: string, note: string) => void;
};

const TripContext = createContext<TripValue>({
  places: [],
  isInTrip: () => false,
  addPlace: () => {},
  removePlace: () => {},
  setNote: () => {},
});

export function TripProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<TripPlace[]>([]);

  // Load the saved trip once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPlaces(JSON.parse(raw));
      })
      .catch(() => {
        // Nothing saved yet: start with an empty trip.
      });
  }, []);

  const update = (next: TripPlace[]) => {
    setPlaces(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // The trip still works in memory if saving fails.
    });
  };

  const isInTrip = (name: string) => places.some((p) => p.name === name);

  const addPlace = (name: string) => {
    if (!name || isInTrip(name)) return;
    update([{ name, note: '' }, ...places]);
  };

  const removePlace = (name: string) => update(places.filter((p) => p.name !== name));

  const setNote = (name: string, note: string) =>
    update(places.map((p) => (p.name === name ? { ...p, note } : p)));

  return (
    <TripContext.Provider value={{ places, isInTrip, addPlace, removePlace, setNote }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrip = () => useContext(TripContext);