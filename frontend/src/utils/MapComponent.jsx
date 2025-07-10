// MapComponent.js
import React, { useState, useEffect,useImperativeHandle,forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents ,useMap} from 'react-leaflet';
import { toast } from 'react-toastify';

import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS for map styles
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true
    })
      .on('markgeocode', function (e) {
        const bbox = e.geocode.bbox;
        const center = e.geocode.center;
        map.fitBounds(bbox); // or map.setView(center, zoom)
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
};

const MapComponent = forwardRef(({ setPosition, position, zoom=15, width="100%", height="500px",message="Select the Parking Spot Location on the map" },ref) => {
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        error: null,
    });
   
    useImperativeHandle(ref, () => ({
        getLocation: getLocation
    }));

    // Custom hook to handle map events
    function MapEvents() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng); // Set position when the map is clicked
            }
        });
        return null;
    }
 

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude, error: null });
                    setPosition({ lat: latitude, lng: longitude });
                   
                },
                (error) => {
                    toast.error(error.message);
                    setLocation({ ...location, error: error.message });
                   
                    
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser.');
            setLocation({ ...location, error: 'Geolocation is not supported by this browser.' });
            
        }
    };

    // Fetch location on component mount
    useEffect(() => {
        getLocation();
    }, []);
    

    return (
        location.latitude && location.longitude && (
            <>
                <label className="block font-bold text-gray-800 mb-2 text-center text-lg">{message.toUpperCase()}</label>
                <div style={{ height, width }} >
                    <MapContainer 
                        center={[location.latitude, location.longitude]} 
                        zoom={zoom} 
                        style={{ width: '100%', height: '100%' }}
                    >
                        {/* TileLayer for OpenStreetMap */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <SearchControl />

                        {/* Add custom event handler */}
                        <MapEvents />
                        
                        {/* If a position is selected, show a marker on the map */}
                        {position && (
                            <Marker position={position}>
                                <Popup>
                                    Latitude: {position.lat} <br /> Longitude: {position.lng}
                                </Popup>
                            </Marker>
                            
                           
                            
                            

                        )}
                        
                    </MapContainer>
                </div>
            </>
        )
    );
});

export default MapComponent;
