import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationIcon from '../assets/location.png';
import axios from 'axios';

const Events = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [dailyEvents, setDailyEvents] = useState([]);

  const getMapHeight = () => {
    const navbarHeight = document.querySelector('nav')
      ? document.querySelector('nav').offsetHeight
      : 0;
    return `calc(88.3vh - ${navbarHeight}px)`;
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v2/events/all',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setDailyEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);

          if (map) {
            map.setView(userCoords, 13);
            const userIcon = L.icon({
              iconUrl: locationIcon,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });

            const userMarker = L.marker(userCoords, { icon: userIcon }).addTo(
              map
            );
            userMarker.bindPopup('You are here!');
          } else {
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

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const isEventEnded = (eventDate) => {
    const currentDate = new Date();
    return new Date(eventDate) < currentDate;
  };

  useEffect(() => {
    if (map && userLocation) {
      dailyEvents.forEach((event) => {
        const eventLocation = [event.lat, event.lon];
        const marker = L.marker(eventLocation).addTo(map);
  
        const popupContent = `
          <div style="padding: 10px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);">
              <h4 style="margin: 0; color: #007bff; text-align: center;">${event.title}</h4>
              <p style="margin: 5px 0; font-size: 14px;">${event.description}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #777;">Date & Time: ${formatDate(event.date)}</p>
          </div>
        `;
  
        marker.bindPopup(popupContent);
      });
    }
  }, [map, userLocation, dailyEvents]);
  

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