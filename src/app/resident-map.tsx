import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
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

type PatrolLocation = {
  id: string;
  patrol_session_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

type PatrolSession = {
  id: string;
  tanod_id: string;
  route_id: string | null;
  status: string;
};

export default function ResidentMap() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [incidents, setIncidents] =
    useState<Incident[]>([]);

  const [patrolLocations, setPatrolLocations] =
    useState<PatrolLocation[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadInitialData();

    const interval = setInterval(() => {
      loadPatrolData();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setLocation(currentLocation);
      }

      await loadIncidentData();
      await loadPatrolData();
    } catch (error) {
      console.log('Map loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncidentData = async () => {
    const { data, error } =
      await supabase
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
      console.log(
        'Incident loading error:',
        error
      );
      return;
    }

    setIncidents(data || []);
  };

  const loadPatrolData = async () => {
    const {
      data: sessionData,
      error: sessionError,
    } = await supabase
      .from('patrol_sessions')
      .select(
        'id, tanod_id, route_id, status'
      )
      .eq('status', 'active');

    if (sessionError) {
      console.log(
        'Patrol session loading error:',
        sessionError
      );
      setPatrolLocations([]);
      return;
    }

    const activeSessions: PatrolSession[] =
      sessionData || [];

    if (activeSessions.length === 0) {
      setPatrolLocations([]);
      return;
    }

    const sessionIds =
      activeSessions.map(
        session => session.id
      );

    const {
      data: locationData,
      error: locationError,
    } = await supabase
      .from('patrol_locations')
      .select(
        'id, patrol_session_id, latitude, longitude, recorded_at'
      )
      .in(
        'patrol_session_id',
        sessionIds
      )
      .order('recorded_at', {
        ascending: false,
      });

    if (locationError) {
      console.log(
        'Patrol location error:',
        locationError
      );
      setPatrolLocations([]);
      return;
    }

    const allLocations: PatrolLocation[] =
      locationData || [];

    const latestLocations: PatrolLocation[] = [];

    for (const session of activeSessions) {
      const latest =
        allLocations.find(
          item =>
            item.patrol_session_id ===
            session.id
        );

      if (latest) {
        latestLocations.push(latest);
      }
    }

    setPatrolLocations(
      latestLocations
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

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
          Location permission is required
          to show the map.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const latitude =
    location.coords.latitude;

  const longitude =
    location.coords.longitude;

  const incidentMarkers =
    incidents
      .filter(
        incident =>
          incident.latitude !== null &&
          incident.longitude !== null
      )
      .map(incident => ({
        id: incident.id,
        type: incident.incident_type,
        description: incident.description,
        latitude:
          incident.latitude as number,
        longitude:
          incident.longitude as number,
        status: incident.status,
      }));

  const patrolMarkers =
    patrolLocations.map(patrol => ({
      id: patrol.id,
      sessionId:
        patrol.patrol_session_id,
      latitude: patrol.latitude,
      longitude: patrol.longitude,
      recordedAt:
        patrol.recorded_at,
    }));

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>
html,
body,
#map {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
}

.location-marker {
  font-size: 32px;
}

.incident-marker {
  font-size: 32px;
}

.patrol-marker {
  font-size: 36px;
}

.legend {
  position: absolute;
  bottom: 20px;
  left: 10px;
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  z-index: 1000;
  font-family: Arial, sans-serif;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  line-height: 24px;
}

.custom-zoom {
  position: absolute;
  right: 15px;
  bottom: 95px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zoom-button {
  width: 52px;
  height: 52px;
  background: white;
  border: none;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
  font-size: 30px;
  font-weight: bold;
  color: #30305F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.zoom-button:active {
  background: #E9E8F8;
}
</style>
</head>

<body>

<div id="map"></div>

<div class="custom-zoom">
  <button
    id="zoomIn"
    class="zoom-button"
    type="button"
  >
    +
  </button>

  <button
    id="zoomOut"
    class="zoom-button"
    type="button"
  >
    −
  </button>
</div>

<div class="legend">
📍 You<br>
🚨 Incident<br>
👮 Active Patrol
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>

const residentLatitude = ${latitude};
const residentLongitude = ${longitude};

const incidents = ${JSON.stringify(
    incidentMarkers
  )};

const patrols = ${JSON.stringify(
    patrolMarkers
  )};

const map = L.map(
  'map',
  {
    zoomControl: false,
    tap: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true
  }
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);

const bounds = [];

const residentIcon =
  L.divIcon({
    className: '',
    html:
      '<div class="location-marker">📍</div>',
    iconSize: [35, 35],
    iconAnchor: [17, 35]
  });

L.marker(
  [
    residentLatitude,
    residentLongitude
  ],
  {
    icon: residentIcon
  }
)
.addTo(map)
.bindPopup(
  '<b>📍 Your Location</b>'
);

bounds.push([
  residentLatitude,
  residentLongitude
]);

const incidentIcon =
  L.divIcon({
    className: '',
    html:
      '<div class="incident-marker">🚨</div>',
    iconSize: [35, 35],
    iconAnchor: [17, 35]
  });

incidents.forEach(
  incident => {

    L.marker(
      [
        incident.latitude,
        incident.longitude
      ],
      {
        icon: incidentIcon
      }
    )
    .addTo(map)
    .bindPopup(
      '<b>🚨 ' +
      incident.type +
      '</b>' +
      '<br><br>' +
      '<b>Status:</b> ' +
      incident.status +
      '<br><br>' +
      '<b>Description:</b><br>' +
      incident.description
    );

    bounds.push([
      incident.latitude,
      incident.longitude
    ]);
  }
);

const patrolIcon =
  L.divIcon({
    className: '',
    html:
      '<div class="patrol-marker">👮</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });

patrols.forEach(
  patrol => {

    const marker =
      L.marker(
        [
          patrol.latitude,
          patrol.longitude
        ],
        {
          icon: patrolIcon
        }
      )
      .addTo(map);

    const recordedTime =
      new Date(
        patrol.recordedAt
      ).toLocaleString();

    marker.bindPopup(
      '<b>👮 Active Tanod Patrol</b>' +
      '<br><br>' +
      '<b>Status:</b> Active' +
      '<br><br>' +
      '<b>Last GPS update:</b><br>' +
      recordedTime +
      '<br><br>' +
      '<b>GPS:</b><br>' +
      patrol.latitude +
      ', ' +
      patrol.longitude
    );

    bounds.push([
      patrol.latitude,
      patrol.longitude
    ]);
  }
);

if (bounds.length > 1) {
  map.fitBounds(
    bounds,
    {
      padding: [50, 50],
      maxZoom: 16
    }
  );
} else {
  map.setView(
    [
      residentLatitude,
      residentLongitude
    ],
    16
  );
}

document
  .getElementById('zoomIn')
  .addEventListener(
    'click',
    function(event) {
      event.preventDefault();
      event.stopPropagation();
      map.zoomIn();
    }
  );

document
  .getElementById('zoomOut')
  .addEventListener(
    'click',
    function(event) {
      event.preventDefault();
      event.stopPropagation();
      map.zoomOut();
    }
  );

setTimeout(
  () => {
    map.invalidateSize();
  },
  500
);

</script>

</body>
</html>
`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Barangay Map
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <WebView
        originWhitelist={['*']}
        source={{
          html: mapHtml,
        }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: '#F5F5FA',
    },

    header: {
      height: 65,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
      elevation: 3,
      zIndex: 10,
    },

    backButton: {
      minWidth: 75,
      paddingVertical: 10,
      paddingHorizontal: 5,
    },

    backButtonText: {
      color: '#7777B8',
      fontSize: 16,
      fontWeight: 'bold',
    },

    headerTitle: {
      color: '#30305F',
      fontSize: 19,
      fontWeight: 'bold',
    },

    headerSpace: {
      width: 75,
    },

    map: {
      flex: 1,
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#F5F5FA',
    },

    text: {
      marginTop: 10,
      textAlign: 'center',
      color: '#555',
    },

  });
