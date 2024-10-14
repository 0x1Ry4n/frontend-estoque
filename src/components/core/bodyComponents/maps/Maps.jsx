import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { Button, Box, TextField, AppBar, Toolbar, Typography, Container } from '@mui/material';

const MapComponent = () => {
  const [markers, setMarkers] = useState([]);
  const [filter, setFilter] = useState('');
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    setMarkers(savedMarkers);
  }, []);

  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);

  const addMarker = (e) => {
    const { lat, lng } = e.latlng;
    setMarkers((prevMarkers) => [...prevMarkers, { lat, lng, note: '' }]);
  };

  const handleNoteChange = (index, value) => {
    const updatedMarkers = [...markers];
    updatedMarkers[index].note = value;
    setMarkers(updatedMarkers);
  };

  const deleteMarker = (index) => {
    const updatedMarkers = markers.filter((_, i) => i !== index);
    setMarkers(updatedMarkers);
  };

  const handlePolygonCreate = (e) => {
    const { layer } = e;
    const newPolygon = layer.getLatLngs();
    setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
  };

  const handleLineCreate = (e) => {
    const { layer } = e;
    const newLine = layer.getLatLngs();
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const searchLocation = async () => {
    const location = prompt('Digite o endereço:');
    if (!location) return;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      setMarkers((prevMarkers) => [...prevMarkers, { lat, lng: lon, note: '' }]);
    } else {
      alert('Localização não encontrada.');
    }
  };

  return (
    <Container sx={{ mt: 3, height: '800px', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mapa de Marcadores</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Filtrar Notas"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1, mr: 2 }}
        />
        <Button variant="contained" onClick={searchLocation}>
          Buscar Localização
        </Button>
      </Box>
      <MapContainer
        center={[-23.5505, -46.6333]} 
        zoom={13}
        onClick={addMarker}
        style={{ height: 'calc(100% - 80px)', width: '100%' }} 
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FeatureGroup>
          <EditControl
            position='topright'
            onCreated={(e) => {
              if (e.layerType === 'polygon') {
                handlePolygonCreate(e);
              } else if (e.layerType === 'polyline') {
                handleLineCreate(e);
              }
            }}
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              polygon: true,
              polyline: true,
              circlemarker: false,
            }}
            edit={{
              remove: true,
            }}
          />
        </FeatureGroup>
        {markers.filter(marker => marker.note.includes(filter)).map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              <TextField
                label="Nota"
                value={marker.note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
              <p>{`Latitude: ${marker.lat}, Longitude: ${marker.lng}`}</p>
              <Button variant="outlined" color="error" onClick={() => deleteMarker(index)}>
                Deletar
              </Button>
            </Popup>
          </Marker>
        ))}
        {polygons.map((polygon, index) => (
          <Polygon key={index} positions={polygon} color="blue" />
        ))}
        {lines.map((line, index) => (
          <Polyline key={index} positions={line} color="red" />
        ))}
      </MapContainer>
    </Container>
  );
};

export default MapComponent;
