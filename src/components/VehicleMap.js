import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import vehicleIconUrl from '../assets/images/car.png';
import startIconUrl from '../assets/images/placeholder.png';
import endIconUrl from '../assets/images/destination.png';

const calculateAngle = (start, end) => {
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const radians = Math.atan2(dy, dx);
  const degrees = radians * (180 / Math.PI);
  return (90 - degrees + 360) % 360;
};

const createRotatedVehicleIcon = (iconUrl, angle) => {
  return L.divIcon({
    html: `<div style="width: 40px; height: 40px; transform: rotate(${angle}deg); transition: transform 0.5s linear;">
      <img src="${iconUrl}" style="width: 100%; height: 100%;" />
    </div>`,
    iconSize: [40, 40],
    className: '',
  });
};

// ✅ 组件：允许点击地图添加路线点
const RouteBuilder = ({ onAddPoint }) => {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const VehicleMap = () => {
  const [route, setRoute] = useState([]);
  const [vehiclePosition, setVehiclePosition] = useState(null);
  const [vehicleAngle, setVehicleAngle] = useState(0);
  const [traveledPath, setTraveledPath] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const handleAddPoint = (point) => {
    setRoute((prev) => [...prev, point]);
  };

  const startSimulation = () => {
    if (route.length < 2) return;

    setVehiclePosition(route[0]);
    setTraveledPath([route[0]]);
    setRouteIndex(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setRouteIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= route.length) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return prevIndex;
        }
        const newPosition = route[nextIndex];
        const angle = calculateAngle(route[prevIndex], newPosition);
        setVehiclePosition(newPosition);
        setTraveledPath((prevPath) => [...prevPath, newPosition]);
        setVehicleAngle(angle);
        return nextIndex;
      });
    }, 2000);
  };

  const vehicleIcon = createRotatedVehicleIcon(vehicleIconUrl, vehicleAngle);
  const startIcon = L.icon({ iconUrl: startIconUrl, iconSize: [30, 30] });
  const endIcon = L.icon({ iconUrl: endIconUrl, iconSize: [30, 30] });

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Click to Set Route</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={startSimulation}
        disabled={isRunning || route.length < 2}
      >
        {isRunning ? 'Running...' : 'Start Simulation'}
      </button>

      <div className="w-full h-96 rounded shadow overflow-hidden">
        <MapContainer center={[31.538, 104.7]} zoom={15} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RouteBuilder onAddPoint={handleAddPoint} />
          <Polyline positions={route} color="green" weight={4} />
          <Polyline positions={traveledPath} color="blue" weight={5} />
          {route.map((point, index) => (
            <Marker key={index} position={point} icon={L.divIcon({ html: `<div style="width:8px;height:8px;background:red;border-radius:50%;"></div>` })} />
          ))}
          {vehiclePosition && <Marker position={vehiclePosition} icon={vehicleIcon} />}
          {route.length > 0 && <Marker position={route[0]} icon={startIcon} />}
          {route.length > 1 && <Marker position={route[route.length - 1]} icon={endIcon} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default VehicleMap;
