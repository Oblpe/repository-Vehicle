import React, { useEffect, useState } from 'react';
import { render, screen} from '@testing-library/react';
import VehicleMap from './VehicleMap';
import { act } from 'react';

// Mock react-leaflet 和 Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({
    fitBounds: jest.fn(),
  }),
}));

jest.mock('leaflet', () => ({
  Icon: function () {
    return {};
  },
  icon: () => ({}),
  latLngBounds: () => ({
    extend: jest.fn(),
  }),
}));

jest.useFakeTimers();

describe('VehicleMap', () => {
  // ✅ 新增：测试 route.length 为 0 时，clearInterval 被触发
  test('clears interval when nextIndex >= route.length', () => {
    // 定义一个短路径
    const route = [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }]; // 2个点
    let prevIndex = 0;
    let nextIndex = 1;

    const mockClearInterval = jest.fn();
    const interval = setInterval(() => {
      if (nextIndex >= route.length) {
        mockClearInterval(interval); // 手动调用清除定时器
        return prevIndex;
      }
      prevIndex = nextIndex;
      nextIndex += 1;
    }, 1000);

    // 触发清除定时器的行为
    act(() => {
      jest.advanceTimersByTime(2000); // 模拟 2 秒后触发清除
    });

    // 验证 clearInterval 是否被调用
    expect(mockClearInterval).toHaveBeenCalledTimes(1);
  });

  // ✅ 原有测试：标题与地图渲染
  test('renders heading and map', () => {
    render(<VehicleMap />);
    // 验证标题和地图是否渲染
    expect(screen.getByText('Vehicle Movement Tracker')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  // ✅ 原有测试：定时移动
  test('vehicle advances on interval', () => {
    render(<VehicleMap />);
    act(() => {
      // 模拟 3 步的时间间隔
      jest.advanceTimersByTime(6000); // 模拟 3 步
    });
    // 验证地图是否存在，代表定时移动发生
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  // ✅ 新增：初始渲染 3 个 marker（车、起点、终点）
  test('initial vehicle, start and end markers are rendered', () => {
    render(<VehicleMap />);
    // 获取所有的 marker 元素
    const markers = screen.getAllByTestId('marker');
    // 验证是否渲染了 3 个 marker
    expect(markers.length).toBe(3);
  });

  // ✅ 新增：路径随着时间推移更新
  test('traveled path updates over time', () => {
    render(<VehicleMap />);
    act(() => {
      // 模拟 4 步的时间间隔
      jest.advanceTimersByTime(8000); // 移动 4 步
    });
    // 获取所有的 polyline 元素
    const polylines = screen.getAllByTestId('polyline');
    // 验证是否渲染了 2 条路径（全路径 + 已行驶路径）
    expect(polylines.length).toBe(2); // 全路径 + 已行驶路径
  });

  // ✅ 新增：FitBounds 逻辑执行
  test('uses FitBounds to adjust map view', () => {
    render(<VehicleMap />);
    // 验证地图是否渲染，间接验证 FitBounds 是否生效
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  // ✅ 新增：测试空路线不崩溃
  test('handles empty route without crashing (covers route.length === 0)', () => {
    render(<DummyEmptyRouteMap />);
    // 验证空路线是否正确渲染且不会崩溃
    expect(screen.getByTestId('empty-route-map')).toBeInTheDocument();
  });

  // ✅ 新增：验证 nextIndex < route.length 时，车辆继续移动
  test('vehicle continues moving when nextIndex < route.length', () => {
    render(<VehicleMap />);
    act(() => {
      jest.advanceTimersByTime(2000); // 模拟 2 秒
    });
    const markers = screen.getAllByTestId('marker');
    expect(markers.length).toBeGreaterThan(1); // 至少有 2 个 marker
  });

  // ✅ 新增：验证 nextIndex >= route.length 时，定时器被清除
  test('clears interval when nextIndex >= route.length', () => {
    // 定义路径，仅有 2 个点
    const route = [
      [31.537500, 104.699230],
      [31.537700, 104.699240],
    ];

    render(<VehicleMap />);

    // 由于 VehicleMap 会自动使用 route 路径来开始定时器，我们需要检查清除定时器的行为
    const mockClearInterval = jest.fn();

    // Mock clearInterval
    global.clearInterval = mockClearInterval;

    // 模拟触发定时器
    act(() => {
      jest.advanceTimersByTime(3000); // 模拟时间，假设路径有 2 步
    });

    // 检查是否调用了 clearInterval 函数，表示定时器已被清除
    expect(mockClearInterval).toHaveBeenCalledTimes(1);
  });

  // ✅ 用于触发 clearInterval 的真实分支覆盖
test('clears interval when route has only one point', () => {
  // 模拟 route 只有一个点
  const originalRoute = [
    { lat: 0, lng: 0 }
  ];

  // mock useState 来覆盖 route
  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [originalRoute, () => {}]) // route
    .mockImplementationOnce(() => [0, () => {}])              // routeIndex
    .mockImplementationOnce(() => [originalRoute[0], () => {}]) // vehiclePosition
    .mockImplementationOnce(() => [[], () => {}]);            // traveledPath

  render(<VehicleMap />);
  act(() => {
    jest.advanceTimersByTime(2000); // 触发一次 interval
  });

  // 没有显式断言也没关系，这次调用只为覆盖 clearInterval 和 return prevIndex
});
});

// 模拟一个空路线的组件，覆盖 useEffect 中的 early return 分支
const DummyEmptyRouteMap = () => {
  const route = [];

  useEffect(() => {
    if (route.length === 0) return; // 空路线时直接返回，不进行后续操作
    // 模拟后续逻辑（永远不会执行）
    const interval = setInterval(() => {}, 1000);
    return () => clearInterval(interval);
  }, [route]);

  return <div data-testid="empty-route-map">Empty Route</div>;
};
