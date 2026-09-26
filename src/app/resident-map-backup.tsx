import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function ResidentMap() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);
    } catch (error) {
      console.log('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Getting your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Unable to get your location.
        </Text>
      </View>
    );
  }

  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport"
content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link
rel="stylesheet"
href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<style>
html, body, #map {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
</head>

<body>

<div id="map"></div>

<script
src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<script>

const latitude = ${latitude};
const longitude = ${longitude};

const map = L.map('map').setView(
  [latitude, longitude],
  16
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

L.marker([latitude, longitude])
  .addTo(map)
  .bindPopup('Your current location')
  .openPopup();

</script>

</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    textAlign: 'center',
  },
});
