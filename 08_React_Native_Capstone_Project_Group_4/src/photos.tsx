import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Photo } from '@/services/geoPhotoService';

// Shared photo store used by the dashboard and the detail view without prop drilling.
type PhotosValue = {
  photos: Photo[];
  setPhotos: Dispatch<SetStateAction<Photo[]>>;
};

const PhotosContext = createContext<PhotosValue>({
  photos: [],
  setPhotos: () => {},
});

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  return <PhotosContext.Provider value={{ photos, setPhotos }}>{children}</PhotosContext.Provider>;
}

export const usePhotos = () => useContext(PhotosContext);
