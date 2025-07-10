
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { FaParking } from 'react-icons/fa';

const CustomPointsMapContainer = ({ parkingSpots, setSelectedArea, currentPosition ,zoom=12}) => {
  
  const VehicleIcon = () => (
    <div style={{ color: 'black', borderRadius: '50%', backgroundColor: 'white', padding: '5px' }}>
      <FaParking />
    </div>
  );
  const htmlString = ReactDOMServer.renderToString(<VehicleIcon />);


  const customIcon = L.divIcon({
    html: htmlString,
    className: 'custom-icon',
    iconSize: [25, 25],
    popupAnchor: [0, -10],
  });
  return (
    <>
      
      <MapContainer key={zoom} center={currentPosition} zoom={zoom} style={{ height: '100%', width: '100%', margin: 'auto' }}>

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parkingSpots.map((spot,index) => (
          <Marker key={spot.id} position={spot.coords} icon={customIcon} eventHandlers={{
            click: () => setSelectedArea(spot)
          }}>
            <Tooltip direction={index % 2 === 0 ? "top" : "right"}  opacity={1} interactive={true} permanent>

              <div onClick={() => setSelectedArea(spot)} className="text-xs h-4 w-8 bg-white  flex flex-col items-center justify-center hover:bg-gray-200">
                <div className="text-[10px] text-center">{spot.price}/hr</div>
                <div className="text-[10px] text-center font-bold mt-[-6px]">{spot?.rating?.toFixed(1) || "N/A"}</div>

              </div>

            </Tooltip>

          </Marker>

        ))}
        {currentPosition && (
          <Marker position={currentPosition} >
            <Tooltip direction="top"  opacity={1} interactive={true} permanent>
              <div className="text-sm leading-relaxed">
                <span className="text-xs">Current Location</span>
              </div>
            </Tooltip>
          </Marker>
        )}


      </MapContainer>
    </>
  )
}

export default CustomPointsMapContainer;