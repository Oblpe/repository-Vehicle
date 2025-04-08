import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import vehicleIconUrl from '../assets/images/car.png'; // Adjust path as needed
import startIconUrl from '../assets/images/placeholder.png'; // Adjust path as needed
import endIconUrl from '../assets/images/destination.png'; // Adjust path as needed

// Component to fit the map to the route bounds
const FitBounds = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds);
    }
  }, [route, map]);
  return null;
};

const VehicleMap = () => {
  const route = [
    [31.537500, 104.699230],
    [31.537700, 104.699240],
    [31.537900, 104.699250],
    [31.538300, 104.699270],
    [31.538600, 104.699285],
    [31.538900, 104.699300],
    [31.539200, 104.699330],
    [31.539200, 104.699530],
    [31.539180, 104.699830],
    [31.539170, 104.700030],
    [31.539158, 104.700330],
    [31.539145, 104.700630],
    [31.539133, 104.700930],
    [31.539123, 104.701330],
    [31.539113, 104.701730],
    [31.539100, 104.702030],
    [31.539097, 104.702260],
    [31.538797, 104.702240],
    [31.538497, 104.702230],
    [31.538197, 104.702220],
    [31.537697, 104.702208],
  ];

  const [vehiclePosition, setVehiclePosition] = useState(route[0]);
  const [traveledPath, setTraveledPath] = useState([route[0]]);
  const [routeIndex, setRouteIndex] = useState(0);

  const calculateAngle = (start, end) => {
    const dx = end[1] - start[1];
    const dy = end[0] - start[0];
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  useEffect(() => {
    if (route.length === 0) return;

    const interval = setInterval(() => {
      setRouteIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= route.length) {
          clearInterval(interval);
          return prevIndex;
        }

        const newPosition = route[nextIndex];
        setVehiclePosition(newPosition);
        setTraveledPath((prevPath) => [...prevPath, newPosition]);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [route]);

  const startPoint = route[0];
  const endPoint = route[route.length - 1];
  const nextPoint = route[Math.min(routeIndex + 1, route.length - 1)];
  const angle = calculateAngle(vehiclePosition, nextPoint);

  // Function to create a rotated icon
  const createRotatedIcon = (iconUrl) => {
    return new L.Icon({
      iconUrl: iconUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      className: `leaflet-icon`,
    });
  };

  const vehicleIcon = createRotatedIcon(vehicleIconUrl);

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-200 p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Vehicle Movement Tracker</h1>
      <div className="relative w-full h-96 rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-300">
        <MapContainer center={vehiclePosition} zoom={14} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=''
          />
          <FitBounds route={route} />
          <Polyline positions={route} color="green" weight={4} />
          <Polyline positions={traveledPath} color="blue" weight={5} />
          {/* Car marker */}
          <Marker
            position={vehiclePosition}
            icon={vehicleIcon}
            iconOptions={{ style: { transform: `rotate(${angle}deg)`, transformOrigin: 'center center' } }}
          />
          {/* Starting point marker */}
          <Marker position={startPoint} icon={L.icon({ iconUrl: startIconUrl, iconSize: [30, 30] })} />
          {/* Destination point marker */}
          <Marker position={endPoint} icon={L.icon({ iconUrl: endIconUrl, iconSize: [30, 30] })} />
        </MapContainer>
      </div>
    </div>
  );
};

export default VehicleMap;
