import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { Button, Box, TextField, AppBar, Toolbar, Typography, Container } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const MapComponent = () => {
  const [markers, setMarkers] = useState([]);
  const [filter, setFilter] = useState('');
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [distanceLine, setDistanceLine] = useState(null);

  useEffect(() => {
    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    const savedPolygons = JSON.parse(localStorage.getItem('polygons')) || [];
    const savedLines = JSON.parse(localStorage.getItem('lines')) || [];
    setMarkers(savedMarkers);
    setPolygons(savedPolygons);
    setLines(savedLines);
  }, []);

  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
    localStorage.setItem('polygons', JSON.stringify(polygons));
    localStorage.setItem('lines', JSON.stringify(lines));
  }, [markers, polygons, lines]);

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
    setDistanceLine(null);
  };

  const clearMarkers = () => {
    setMarkers([]);
    setDistanceLine(null);
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

  const restoreDefaultMarkers = () => {
    const defaultMarkers = [
      { lat: -23.5505, lng: -46.6333, note: 'São Paulo' },
      { lat: -22.9068, lng: -43.1729, note: 'Rio de Janeiro' },
      { lat: -19.9167, lng: -43.9345, note: 'Belo Horizonte' }
    ];
    setMarkers(defaultMarkers);
  };

  const calculateDistance = () => {
    if (selectedMarkers.length === 2) {
      const [marker1, marker2] = selectedMarkers;
      const latLng1 = L.latLng(marker1.lat, marker1.lng);
      const latLng2 = L.latLng(marker2.lat, marker2.lng);
      const distance = latLng1.distanceTo(latLng2) / 1000; // Distância em km
      alert(`A distância entre os dois marcadores é de ${distance.toFixed(2)} km.`);

      // Define a linha entre os dois marcadores
      setDistanceLine([marker1, marker2]);

      setSelectedMarkers([]); // Limpa a seleção após calcular a distância
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarkers((prev) => {
      if (prev.includes(marker)) {
        return prev.filter(m => m !== marker);
      } else {
        if (prev.length < 2) {
          return [...prev, marker];
        }
        return prev; // Não permite mais de 2 seleções
      }
    });
  };

  const handleExport = () => {
    const sessionData = {
      markers,
      polygons,
      lines,
    };
    const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session.json';
    a.click();
    URL.revokeObjectURL(url); // Libera o URL
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setMarkers(data.markers || []);
      setPolygons(data.polygons || []);
      setLines(data.lines || []);
    };
    reader.readAsText(file);
  };

  const MapZoomToShapes = () => {
    const map = useMap();
    useEffect(() => {
      if (polygons.length > 0 || lines.length > 0) {
        const group = new L.featureGroup([
          ...polygons.map((polygon) => L.polygon(polygon)),
          ...lines.map((line) => L.polyline(line)),
        ]);
        map.fitBounds(group.getBounds());
      }
    }, [polygons, lines, map]);
    return null;
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

      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => setShowPolygons(!showPolygons)}>
          {showPolygons ? 'Esconder Polígonos' : 'Mostrar Polígonos'}
        </Button>
        <Button variant="outlined" onClick={() => setShowLines(!showLines)}>
          {showLines ? 'Esconder Linhas' : 'Mostrar Linhas'}
        </Button>
        <Button variant="outlined" color="warning" onClick={clearMarkers}>
          Limpar Marcadores
        </Button>
        <Button variant="outlined" color="secondary" onClick={restoreDefaultMarkers}>
          Restaurar Marcadores Padrão
        </Button>
        <Button variant="outlined" onClick={calculateDistance} disabled={selectedMarkers.length !== 2}>
          Calcular Distância
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          Exportar Sessão
        </Button>
        <input
          accept="application/json"
          style={{ display: 'none' }}
          id="import-file"
          type="file"
          onChange={handleImport}
        />
        <label htmlFor="import-file">
          <Button variant="outlined" component="span">
            Importar Sessão
          </Button>
        </label>
      </Box>

      <MapContainer center={[-23.5505, -46.6333]} zoom={13} onClick={addMarker} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handlePolygonCreate}
            draw={{
              rectangle: false,
              circle: false,
              polyline: {
                allowIntersection: false,
                shapeOptions: {
                  color: '#f357a1',
                  weight: 10,
                },
              },
              marker: false,
              polygon: {
                allowIntersection: false,
              },
            }}
          />
        </FeatureGroup>
        
        {markers.filter(marker => marker.note.includes(filter)).map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
          >
            <Popup>
              <TextField
                label="Nota"
                value={marker.note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                variant="outlined"
                fullWidth
              />
              <Button variant="outlined" color="error" onClick={() => deleteMarker(index)}>
                Deletar Marcador
              </Button>
            </Popup>
          </Marker>
        ))}

        {showPolygons && polygons.map((polygon, index) => (
          <Polygon key={index} positions={polygon} />
        ))}

        {showLines && lines.map((line, index) => (
          <Polyline key={index} positions={line} />
        ))}

        {distanceLine && ( // Desenha a linha entre os dois marcadores selecionados
          <Polyline positions={distanceLine.map(marker => [marker.lat, marker.lng])} color="red" />
        )}

        <MapZoomToShapes />
      </MapContainer>
    </Container>
  );
};

export default MapComponent;
