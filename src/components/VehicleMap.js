import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import vehicleIconUrl from '../assets/images/car.png';
import startIconUrl from '../assets/images/placeholder.png';
import endIconUrl from '../assets/images/destination.png';

// 地图自动适应轨迹范围组件
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

// 计算角度：将正东为0°转换为正北为0°，并使旋转方向为顺时针
const calculateAngle = (start, end) => {
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const radians = Math.atan2(dy, dx);
  const degrees = radians * (180 / Math.PI);
  const adjusted = (90 - degrees + 360) % 360; // 转换为以北为0° 顺时针方向
  return adjusted;
};

// 创建带旋转角度的图标
const createRotatedVehicleIcon = (iconUrl, angle) => {
  return L.divIcon({
    html: `
      <div style="width: 40px; height: 40px; transform: rotate(${angle}deg); transition: transform 0.5s linear;">
        <img src="${iconUrl}" style="width: 100%; height: 100%;" />
      </div>
    `,
    iconSize: [40, 40],
    className: '',
  });
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

  const initialAngle = calculateAngle(route[0], route[1]);
  const [vehiclePosition, setVehiclePosition] = useState(route[0]);
  const [vehicleAngle, setVehicleAngle] = useState(initialAngle);
  const [traveledPath, setTraveledPath] = useState([route[0]]);
  const [routeIndex, setRouteIndex] = useState(0);

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
        const nextTarget = route[nextIndex + 1] || newPosition;
        const newAngle = calculateAngle(newPosition, nextTarget);

        setVehiclePosition(newPosition);
        setTraveledPath((prevPath) => [...prevPath, newPosition]);
        setVehicleAngle(newAngle);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [route]);

  const startPoint = route[0];
  const endPoint = route[route.length - 1];
  const vehicleIcon = createRotatedVehicleIcon(vehicleIconUrl, vehicleAngle);

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-200 p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Vehicle Movement Tracker</h1>
      <div className="relative w-full h-96 rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-300">
        <MapContainer center={vehiclePosition} zoom={14} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
          <FitBounds route={route} />
          <Polyline positions={route} color="green" weight={4} />
          <Polyline positions={traveledPath} color="blue" weight={5} />
          <Marker position={vehiclePosition} icon={vehicleIcon} />
          <Marker position={startPoint} icon={L.icon({ iconUrl: startIconUrl, iconSize: [30, 30] })} />
          <Marker position={endPoint} icon={L.icon({ iconUrl: endIconUrl, iconSize: [30, 30] })} />
        </MapContainer>
      </div>
    </div>
  );
};

export default VehicleMap;
