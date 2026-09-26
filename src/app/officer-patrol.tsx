import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type RoutePoint = {
  latitude: number;
  longitude: number;
};

type PatrolRoute = {
  id: string;
  route_name: string;
  description: string | null;
  route_points: RoutePoint[] | null;
};

type Tanod = {
  id: string;
  full_name: string;
};

export default function OfficerPatrol() {
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [tanods, setTanods] = useState<Tanod[]>([]);
  const [selectedRoute, setSelectedRoute] =
    useState<PatrolRoute | null>(null);
  const [selectedTanod, setSelectedTanod] =
    useState<Tanod | null>(null);

  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const { data: routeData, error: routeError } =
        await supabase
          .from('patrol_routes')
          .select(
            'id, route_name, description, route_points'
          )
          .order('created_at', { ascending: false });

      if (routeError) {
        Alert.alert('Error', routeError.message);
        return;
      }

      const { data: tanodData, error: tanodError } =
        await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'tanod')
          .order('full_name');

      if (tanodError) {
        Alert.alert('Error', tanodError.message);
        return;
      }

      setRoutes(routeData || []);
      setTanods(tanodData || []);
    } catch {
      Alert.alert(
        'Error',
        'Something went wrong while loading patrol data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addPoint = (
    latitude: number,
    longitude: number
  ) => {
    setPoints((current) => [
      ...current,
      {
        latitude,
        longitude,
      },
    ]);
  };

  const saveRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert(
        'Missing Route Name',
        'Please enter a route name.'
      );
      return;
    }

    if (points.length < 2) {
      Alert.alert(
        'Route Incomplete',
        'Please tap at least 2 points on the map.'
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('patrol_routes')
        .insert({
          route_name: routeName.trim(),
          description: description.trim() || null,
          route_points: points,
        })
        .select(
          'id, route_name, description, route_points'
        )
        .single();

      if (error) {
        Alert.alert('Save Failed', error.message);
        return;
      }

      setRoutes((current) => [data, ...current]);
      setRouteName('');
      setDescription('');
      setPoints([]);

      Alert.alert(
        'Route Saved',
        'The patrol route has been saved successfully.'
      );
    } catch {
      Alert.alert(
        'Error',
        'Something went wrong while saving the route.'
      );
    } finally {
      setSaving(false);
    }
  };

  const assignRoute = async () => {
    if (!selectedRoute) {
      Alert.alert(
        'Select Route',
        'Please select a patrol route first.'
      );
      return;
    }

    if (!selectedTanod) {
      Alert.alert(
        'Select Tanod',
        'Please select a Tanod first.'
      );
      return;
    }

    const { error } = await supabase
      .from('patrol_assignments')
      .insert({
        tanod_id: selectedTanod.id,
        route_id: selectedRoute.id,
        assigned_date: new Date()
          .toISOString()
          .split('T')[0],
        status: 'assigned',
      });

    if (error) {
      Alert.alert(
        'Assignment Failed',
        error.message
      );
      return;
    }

    Alert.alert(
      'Patrol Assigned',
      `${selectedRoute.route_name} has been assigned to ${selectedTanod.full_name}.`
    );

    setSelectedTanod(null);
  };

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<style>
html, body, #map {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
}

#map {
  background: #eeeeee;
}
</style>
</head>

<body>

<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const map = L.map('map').setView(
  [7.1907, 125.4553],
  14
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

let points = [];
let markers = [];
let routeLine = null;

function redrawRoute() {
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  if (points.length >= 2) {
    routeLine = L.polyline(points, {
      color: '#6C3FC5',
      weight: 6,
      opacity: 0.85
    }).addTo(map);
  }
}

function updatePopup(index) {
  markers[index].bindPopup(
    '<b>Route Point ' + (index + 1) + '</b><br>' +
    '<button onclick="deletePoint(' + index + ')" ' +
    'style="margin-top:8px;padding:8px 12px;border:0;' +
    'border-radius:8px;background:#6C3FC5;color:white;">' +
    'Delete Point</button>'
  );
}

function addPoint(lat, lng) {
  points.push([lat, lng]);

  const marker = L.marker([lat, lng]).addTo(map);

  markers.push(marker);

  updatePopup(markers.length - 1);

  marker.on('click', function() {
    marker.openPopup();
  });

  redrawRoute();

  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'point',
      latitude: lat,
      longitude: lng
    })
  );
}

function deletePoint(index) {
  if (index < 0 || index >= points.length) {
    return;
  }

  points.splice(index, 1);

  const marker = markers.splice(index, 1)[0];

  if (marker) {
    map.removeLayer(marker);
  }

  markers.forEach(function(marker, i) {
    updatePopup(i);
  });

  redrawRoute();

  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'pointsUpdated',
      points: points
    })
  );
}

map.on('click', function(e) {
  addPoint(
    e.latlng.lat,
    e.latlng.lng
  );
});

window.ReactNativeWebView.postMessage(
  JSON.stringify({
    type: 'ready'
  })
);
</script>

</body>
</html>
`;

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(
        event.nativeEvent.data
      );

      if (data.type === 'point') {
        addPoint(
          Number(data.latitude),
          Number(data.longitude)
        );
      }

      if (data.type === 'pointsUpdated') {
        const updatedPoints =
          Array.isArray(data.points)
            ? data.points.map((point: number[]) => ({
                latitude: Number(point[0]),
                longitude: Number(point[1]),
              }))
            : [];

        setPoints(updatedPoints);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            Patrol Routes
          </Text>

          <Text style={styles.subtitle}>
            Create and assign patrol routes
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          onMessage={handleMapMessage}
          javaScriptEnabled
          domStorageEnabled
          style={styles.map}
        />

        <View style={styles.mapHint}>
          <Text style={styles.mapHintText}>
            Tap map to add a point • Tap pin to delete
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.bottom}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>
          Create Patrol Route
        </Text>

        <Text style={styles.label}>
          Route Name
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Barangay Main Road"
          placeholderTextColor="#999"
          value={routeName}
          onChangeText={setRouteName}
        />

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.description,
          ]}
          placeholder="Optional route description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.pointsText}>
          Route Points: {points.length}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveRoute}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>
              SAVE PATROL ROUTE
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Saved Routes
        </Text>

        {loading ? (
          <ActivityIndicator
            color="#6C3FC5"
            style={{ marginTop: 20 }}
          />
        ) : routes.length === 0 ? (
          <Text style={styles.emptyText}>
            No patrol routes yet.
          </Text>
        ) : (
          routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                selectedRoute?.id === route.id &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setSelectedRoute(route)
              }
            >
              <Text style={styles.routeName}>
                {route.route_name}
              </Text>

              {route.description ? (
                <Text style={styles.routeDescription}>
                  {route.description}
                </Text>
              ) : null}

              <Text style={styles.routePoints}>
                {route.route_points?.length || 0}{' '}
                map points
              </Text>

              {selectedRoute?.id === route.id && (
                <Text style={styles.selectedText}>
                  Selected
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitle}>
          Assign Route
        </Text>

        <Text style={styles.label}>
          Selected Route
        </Text>

        <View style={styles.selectionBox}>
          <Text style={styles.selectionText}>
            {selectedRoute
              ? selectedRoute.route_name
              : 'No route selected'}
          </Text>
        </View>

        <Text style={styles.label}>
          Select Tanod
        </Text>

        {tanods.length === 0 ? (
          <Text style={styles.emptyText}>
            No Tanods available.
          </Text>
        ) : (
          tanods.map((tanod) => (
            <TouchableOpacity
              key={tanod.id}
              style={[
                styles.tanodCard,
                selectedTanod?.id === tanod.id &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                setSelectedTanod(tanod)
              }
            >
              <Text style={styles.tanodName}>
                {tanod.full_name}
              </Text>

              {selectedTanod?.id === tanod.id && (
                <Text style={styles.selectedText}>
                  Selected
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.assignButton}
          onPress={assignRoute}
        >
          <Text style={styles.primaryText}>
            ASSIGN PATROL ROUTE
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  header: {
    height: 78,
    backgroundColor: '#6C3FC5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginRight: 8,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 40,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  subtitle: {
    color: '#E9DFFF',
    fontSize: 12,
    marginTop: 2,
  },

  mapContainer: {
    height: 330,
    position: 'relative',
  },

  map: {
    flex: 1,
  },

  mapHint: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    elevation: 4,
  },

  mapHintText: {
    textAlign: 'center',
    color: '#292133',
    fontSize: 13,
    fontWeight: '700',
  },

  bottom: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  sectionTitle: {
    color: '#292133',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 14,
  },

  label: {
    color: '#292133',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DDED',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 14,
    color: '#292133',
    fontSize: 14,
    marginBottom: 14,
  },

  description: {
    height: 75,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  pointsText: {
    color: '#6C3FC5',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },

  primaryButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: '#6C3FC5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E0ED',
  },

  selectedCard: {
    borderColor: '#6C3FC5',
    borderWidth: 2,
  },

  routeName: {
    color: '#292133',
    fontSize: 16,
    fontWeight: '800',
  },

  routeDescription: {
    color: '#777',
    fontSize: 13,
    marginTop: 5,
  },

  routePoints: {
    color: '#6C3FC5',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
  },

  selectedText: {
    color: '#6C3FC5',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },

  selectionBox: {
    backgroundColor: '#EDE7FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  selectionText: {
    color: '#6C3FC5',
    fontWeight: '800',
  },

  tanodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E0ED',
  },

  tanodName: {
    color: '#292133',
    fontSize: 15,
    fontWeight: '700',
  },

  assignButton: {
    height: 52,
    backgroundColor: '#4E2A91',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 15,
  },
});
