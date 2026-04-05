import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// This component listens for map clicks
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

function MapPicker({ label, lat, lng, onLocationSelect }) {
  // Default center is Accra, Ghana
  const defaultCenter = [5.6037, -0.1870];

  return (
    <div style={styles.container}>
      <p style={styles.label}>{label} — Click on the map to select location</p>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationPicker onLocationSelect={onLocationSelect} />
        {lat && lng && (
          <Marker position={[lat, lng]} />
        )}
      </MapContainer>
      {lat && lng && (
        <p style={styles.coords}>
          Selected: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
  },
  map: {
    height: '250px',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  coords: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
};

export default MapPicker;