import * as Location from "expo-location";
import { useEffect, useState } from "react";

const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync({});

    if (coords) {
      const { longitude, latitude } = coords;
      console.log("Position:", longitude, latitude);
      setLatitude(latitude);
      setLongitude(longitude);

      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      console.log("Adresse:", response);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return { latitude, longitude, errorMsg };
};

export default useLocation;
