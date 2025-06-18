import { useEffect } from "react";
import { usePhotoCapture } from "./usePhotoCapture";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  setCurrentAdvancePhotos,
  selectCurrentAdvance,
} from "../../redux/slices/advanceSlice";

export function useAdvancePhotoSync(
  options: Parameters<typeof usePhotoCapture>[0]
) {
  const dispatch = useAppDispatch();
  const currentAdvance = useAppSelector(selectCurrentAdvance);
  const photoCapture = usePhotoCapture(options);
  const { photos } = photoCapture;

  // Sync local photos with redux/global state
  useEffect(() => {
    if (currentAdvance.photos.length > 0) {
      // Prefer global state if present
      // Optionally, you could merge or handle conflicts here
    } else if (photos.length > 0) {
      dispatch(setCurrentAdvancePhotos(photos));
    }
  }, [photos, dispatch, currentAdvance.photos.length]);

  return photoCapture;
}
