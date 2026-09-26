import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { supabase } from '../../lib/supabase';

type Incident = {
  id: string;
  incident_type: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
};

export default function ResidentMap() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      // Get resident location
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setLocation(currentLocation);
      }

      // Get incidents
      const { data, error } = await supabase
        .from('incidents')
        .select(
          'id, incident_type, description, latitude, longitude, status, created_at'
        )
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.log('Incident loading error:', error);
      } else {
        setIncidents(data || []);
      }
    } catch (error) {
      console.log('Map loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Location permission is required to show the map.
        </Text>
      </View>
    );
  }

  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;

  // Convert incidents to JavaScript objects
  const incidentMarkers = incidents
    .filter(
      (incident) =>
        incident.latitude !== null &&
        incident.longitude !== null
    )
    .map((incident) => ({
      id: incident.id,
      type: incident.incident_type,
      description: incident.description,
      latitude: incident.latitude,
      longitude: incident.longitude,
      status: incident.status,
    }));

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

.incident-marker {
  font-size: 30px;
}

.location-marker {
  font-size: 30px;
}

.legend {
  position: absolute;
  bottom: 20px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  z-index: 1000;
  font-family: Arial;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

</style>

</head>

<body>

<div id="map"></div>

<div class="legend">
  📍 You<br>
  🚨 Incident
</div>

<script
src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<script>

const residentLatitude = ${latitude};
const residentLongitude = ${longitude};

const incidents = ${JSON.stringify(incidentMarkers)};

const map = L.map('map').setView(
  [residentLatitude, residentLongitude],
  16
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);


// ==============================
// RESIDENT LOCATION
// ==============================

const residentIcon = L.divIcon({
  className: '',
  html: '<div class="location-marker">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

L.marker(
  [residentLatitude, residentLongitude],
  {
    icon: residentIcon
  }
)
.addTo(map)
.bindPopup(
  '<b>Your Location</b>'
);


// ==============================
// INCIDENT MARKERS
// ==============================

const incidentIcon = L.divIcon({
  className: '',
  html: '<div class="incident-marker">🚨</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

incidents.forEach((incident) => {

  const marker = L.marker(
    [
      incident.latitude,
      incident.longitude
    ],
    {
      icon: incidentIcon
    }
  ).addTo(map);

  marker.bindPopup(
    '<b>🚨 ' +
    incident.type +
    '</b><br><br>' +

    '<b>Status:</b> ' +
    incident.status +
    '<br><br>' +

    '<b>Description:</b><br>' +
    incident.description
  );

});

</script>

</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{
          html: mapHtml,
        }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
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
