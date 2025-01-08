import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationIcon from '../assets/location.png';

const Events = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);

  const events = [
    {
      lon: 19.8186,
      lat: 41.3275,
      title: 'Event 1',
      description: 'Description for Event 1',
      date: '2025-01-15 18:00',
    },
    {
      lon: 19.8232,
      lat: 41.3175,
      title: 'Event 2',
      description: 'Description for Event 2',
      date: '2025-01-16 14:00',
    },
    {
      lon: 19.8093,
      lat: 41.3115,
      title: 'Event 3',
      description: 'Description for Event 3',
      date: '2025-01-17 20:00',
    },
    {
      lon: 19.8245,
      lat: 41.3385,
      title: 'Event 4',
      description: 'Description for Event 4',
      date: '2025-01-18 09:00',
    },
    {
      lon: 19.8115,
      lat: 41.3202,
      title: 'Event 5',
      description: 'Description for Event 5',
      date: '2025-01-19 16:00',
    },
    {
      lon: 19.8153,
      lat: 41.3401,
      title: 'Event 6',
      description: 'Description for Event 6',
      date: '2025-01-20 10:00',
    },
    {
      lon: 19.813,
      lat: 41.335,
      title: 'Event 7',
      description: 'Description for Event 7',
      date: '2025-01-21 12:00',
    },
    {
      lon: 19.812,
      lat: 41.324,
      title: 'Event 8',
      description: 'Description for Event 8',
      date: '2025-01-20 18:00',
    },
    {
      lon: 19.82,
      lat: 41.3305,
      title: 'Event 9',
      description: 'Description for Event 9',
      date: '2025-01-22 14:00',
    },
    {
      lon: 19.8065,
      lat: 41.328,
      title: 'Event 10',
      description: 'Description for Event 10',
      date: '2025-01-23 11:00',
    },
    {
      lon: 19.824,
      lat: 41.3165,
      title: 'Event 11',
      description: 'Description for Event 11',
      date: '2025-01-24 10:00',
    },
    {
      lon: 19.8185,
      lat: 41.338,
      title: 'Event 12',
      description: 'Description for Event 12',
      date: '2025-01-25 19:00',
    },
  ];

  const farEvents = [
    {
      lon: 20.4589,
      lat: 41.8287,
      title: 'Event 13',
      description: 'Description for Event 13',
      date: '2025-01-22 15:00',
    },
    {
      lon: 20.1245,
      lat: 42.001,
      title: 'Event 14',
      description: 'Description for Event 14',
      date: '2025-01-23 11:00',
    },
    {
      lon: 19.999,
      lat: 42.095,
      title: 'Event 15',
      description: 'Description for Event 15',
      date: '2025-01-26 17:00',
    },
    {
      lon: 19.738,
      lat: 40.7525,
      title: 'South Event 1',
      description: 'Description for South Event 1',
      date: '2025-01-27 14:00',
    },
    {
      lon: 19.65,
      lat: 40.818,
      title: 'South Event 2',
      description: 'Description for South Event 2',
      date: '2025-01-28 09:00',
    },
    {
      lon: 19.56,
      lat: 40.9005,
      title: 'South Event 3',
      description: 'Description for South Event 3',
      date: '2025-01-30 12:00',
    },
    {
      lon: 19.47,
      lat: 40.9505,
      title: 'South Event 4',
      description: 'Description for South Event 4',
      date: '2025-01-31 10:00',
    },
    {
      lon: 19.365,
      lat: 41.001,
      title: 'South Event 5',
      description: 'Description for South Event 5',
      date: '2025-02-01 13:00',
    },
  ];

  const getMapHeight = () => {
    const navbarHeight = document.querySelector('nav')
      ? document.querySelector('nav').offsetHeight
      : 0;
    return `calc(88.3vh - ${navbarHeight}px)`;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);

          if (!map) {
            const mapInstance = L.map('map', { zoomControl: false }).setView(
              userCoords,
              13
            );
            L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ).addTo(mapInstance);

            const userIcon = L.icon({
              iconUrl: locationIcon,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });

            const userMarker = L.marker(userCoords, { icon: userIcon }).addTo(
              mapInstance
            );
            userMarker.bindPopup('You are here!');

            setMap(mapInstance);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, [map]);

  useEffect(() => {
    if (map && userLocation) {
      events.forEach((event) => {
        const eventLocation = [event.lat, event.lon];
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          event.lat,
          event.lon
        );

        if (distance <= 10000) {
          const marker = L.marker(eventLocation).addTo(map);

          const popupContent = `
                        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);">
                            <h4 style="margin: 0; color: #007bff; text-align: center;">${event.title}</h4>
                            <p style="margin: 5px 0; font-size: 14px;">${event.description}</p>
                            <p style="margin: 5px 0; font-size: 12px; color: #777;">Date & Time: ${event.date}</p>
                        </div>
                    `;
          marker.bindPopup(popupContent);
        }
      });

      farEvents.forEach((event) => {
        const eventLocation = [event.lat, event.lon];
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          event.lat,
          event.lon
        );

        if (distance <= 100000 && !isOverSea(event.lat, event.lon)) {
          const marker = L.marker(eventLocation).addTo(map);

          const popupContent = `
                        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);">
                            <h4 style="margin: 0; color: #007bff; text-align: center;">${event.title}</h4>
                            <p style="margin: 5px 0; font-size: 14px;">${event.description}</p>
                            <p style="margin: 5px 0; font-size: 12px; color: #777;">Date & Time: ${event.date}</p>
                        </div>
                    `;
          marker.bindPopup(popupContent);
        }
      });
    }
  }, [map, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  const isOverSea = (lat, lon) => {
    const seaBounds = [
      { lat: 36.0, lon: 19.0 },
      { lat: 45.0, lon: 21.0 },
    ];

    return (
      lat < seaBounds[0].lat ||
      lat > seaBounds[1].lat ||
      lon < seaBounds[0].lon ||
      lon > seaBounds[1].lon
    );
  };

  return (
    <div>
      <h4 style={{ textAlign: 'center', marginTop: 10, fontSize: 35 }}>
        Events Map
      </h4>
      <div id='map' style={{ height: getMapHeight(), width: '100%' }}></div>
    </div>
  );
};

export default Events;