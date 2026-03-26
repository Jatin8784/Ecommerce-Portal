import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target, Check } from 'lucide-react';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddressPickerMap = ({ onSelectAddress }) => {
  const [position, setPosition] = useState(null); // Center of map
  const [userLocation, setUserLocation] = useState(null); // Blue dot GPS
  const [address, setAddress] = useState("Finding your door...");
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported.");
        const defaultPos = [22.3039, 70.8022];
        setPosition(defaultPos);
        fetchAddress(defaultPos[0], defaultPos[1]);
        return;
      }

      // Initial high accuracy position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setUserLocation(newPos);
          fetchAddress(newPos[0], newPos[1]);
        },
        (err) => {
          console.warn("GPS failed, using fallback:", err);
          const defaultPos = [22.3039, 70.8022];
          setPosition(defaultPos);
          fetchAddress(defaultPos[0], defaultPos[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      // Continuous tracking like Rapido
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        null,
        { enableHighAccuracy: true }
      );
    };

    startTracking();
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const fetchAddress = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.municipality || "";
        const state = addr.state || "";
        const postcode = addr.postcode || "";
        const displayAddress = data.display_name.split(",").slice(0, -3).join(",").trim() || data.display_name;
        
        setAddress(displayAddress);
        return { address: displayAddress, city, state, zipCode: postcode, lat, lon };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const MapEvents = () => {
    const map = useMapEvents({
      movestart() { setIsMoving(true); },
      moveend() {
        const center = map.getCenter();
        setPosition([center.lat, center.lng]);
        setIsMoving(false);
        fetchAddress(center.lat, center.lng);
      },
    });
    return null;
  };

  if (!position) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-secondary flex flex-col items-center justify-center space-y-4 shadow-inner border-2 border-primary/10">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="font-bold text-lg animate-pulse">Initializing Live Map...</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap px-4">Connecting to Satellites (Rapido Mode)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border-4 border-white shadow-2xl group animate-in zoom-in-95 duration-500">
      <MapContainer center={position} zoom={18} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* User's Real-Time GPS Blue Dot */}
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({
            className: 'blue-dot-container',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-6 h-6 bg-blue-500/30 rounded-full animate-ping"></div>
                <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            `,
            iconSize: [24, 24]
          })} />
        )}
        <MapEvents />
      </MapContainer>

      {/* FIXED CENTER MARKER (Zomato Style) */}
      <div className="absolute top-1/2 left-1/2 -track-x-1/2 -track-y-1/2 z-[1000] pointer-events-none -mt-8 ml-[-20px]">
        <div className={`transition-all duration-300 transform ${isMoving ? "-translate-y-6 scale-125 shadow-2xl" : "translate-y-0 scale-100"}`}>
          <div className="relative flex flex-col items-center">
            {/* Pin Body */}
            <div className={`w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-colors duration-300 ${isMoving ? "bg-primary" : "bg-black"}`}>
               <MapPin className="w-6 h-6 text-white" />
            </div>
            {/* Line / Needle */}
            <div className={`w-1 h-6 rounded-full shadow-lg -mt-1 transition-colors duration-300 ${isMoving ? "bg-primary" : "bg-black"}`} />
            {/* Shadow beneath needle */}
            <div className={`w-4 h-1.5 bg-black/30 rounded-full blur-[1px] transition-all duration-300 ${isMoving ? "scale-50 opacity-100" : "scale-125 opacity-40 translate-y-2 focus:translate-y-0"}`} />
          </div>
        </div>
      </div>

      {/* Overlay Address Panel */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col space-y-2">
        <div className="glass-panel py-3 px-4 flex items-start space-x-3 shadow-2xl border-primary/10 transition-all duration-300 backdrop-blur-md">
          <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 ${loading ? "animate-spin" : ""}`}>
             {loading ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full" /> : <MapPin className="w-4 h-4 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary/70 uppercase font-black tracking-widest mb-0.5">
              Pickup Point
            </p>
            <p className="text-sm font-bold truncate leading-tight text-foreground/90">
              {loading ? "Scanning Area..." : address}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-3">
         <button
          type="button"
          onClick={() => {
            if (userLocation) {
               setPosition(userLocation);
               fetchAddress(userLocation[0], userLocation[1]);
            }
          }}
          className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center outline-none"
          title="Jump to My Location"
        >
          <Target className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={async () => {
            const finalData = await fetchAddress(position[0], position[1]);
            if (finalData) onSelectAddress(finalData);
          }}
          className="flex items-center space-x-2 px-8 py-4 bg-black text-white rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all font-black text-sm uppercase tracking-wider outline-none disabled:opacity-50"
          disabled={loading || isMoving}
        >
          <Check className="w-6 h-6 text-green-400" />
          <span>Confirm Location</span>
        </button>
      </div>

      {/* CSS for Blue Dot */}
      <style>{`
        .blue-dot-container {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

const RecenterMap = () => {
   // Logic handled by position state and center prop
  return null;
};

export default AddressPickerMap;
