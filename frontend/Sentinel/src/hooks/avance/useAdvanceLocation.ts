import { useEffect } from "react";
import { useGeolocation } from "./useGeolocation";

export function useAdvanceLocation(
  options: Parameters<typeof useGeolocation>[0]
) {
  const geo = useGeolocation(options);
  const { getCurrentLocation, errorMsg } = geo;

  useEffect(() => {
    if(errorMsg) {
      // Handle error globally or log it
      console.error("Error in useAdvanceLocation:", errorMsg);
      return;
    }

    const fetchLocation = async () => {
      try {
        await getCurrentLocation();
      } catch (error) {
        // Optionally handle error globally
        console.error("Error al obtener ubicación:", error);
      }
    };
    fetchLocation();
  }, [getCurrentLocation, errorMsg]);
    

  return geo;
}
