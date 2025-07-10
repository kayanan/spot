import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup,Tooltip,useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const Routing = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
    }).addTo(map);

    return () => map.removeControl(routingControl); // Cleanup
  }, [from, to, map]);

  return null;
};


const MapComponent = () => {
    const start = [6.9271, 79.8612];
    const end = [6.9360, 79.8700];
  
    return (
      <MapContainer center={start} zoom={14} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
  
        <Marker position={start} />
        <Marker position={end} />
  
        {/* 🔽 Add Routing component here */}
        <Routing from={start} to={end} />
      </MapContainer>
    );
  };
  
  export default MapComponent;
