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
  const [position, setPosition] = useState(null); // Wait for GPS
  const [address, setAddress] = useState("Finding your door...");
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const locate = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = [pos.coords.latitude, pos.coords.longitude];
            setPosition(newPos);
            fetchAddress(newPos[0], newPos[1]);
          },
          (err) => {
            console.warn("Geolocation error:", err);
            setError("Permission denied. Drag the pin to your location.");
            // Default to Rajkot only after failure
            const defaultPos = [22.3039, 70.8022];
            setPosition(defaultPos);
            fetchAddress(defaultPos[0], defaultPos[1]);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setError("Geolocation not supported.");
        const defaultPos = [22.3039, 70.8022];
        setPosition(defaultPos);
        fetchAddress(defaultPos[0], defaultPos[1]);
      }
    };
    locate();
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
        // Extract a robust address line
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
      movestart() {
        setIsMoving(true);
      },
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
          <p className="font-bold text-lg animate-pulse">Finding your Real Location...</p>
          <p className="text-sm text-muted-foreground">Please allow GPS permission</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl group animate-in zoom-in-95 duration-500">
      <MapContainer center={position} zoom={18} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
      </MapContainer>

      {/* FIXED CENTER MARKER (Zomato Style) */}
      <div className="absolute top-1/2 left-1/2 -track-x-1/2 -track-y-1/2 z-[1000] pointer-events-none -mt-8 ml-[-20px]">
        <div className={`transition-all duration-300 transform ${isMoving ? "-translate-y-6 scale-125" : "translate-y-0 scale-100"}`}>
          <div className="relative flex flex-col items-center">
            {/* Pin Body */}
            <div className="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
               <MapPin className="w-6 h-6 text-white" />
            </div>
            {/* Line / Needle */}
            <div className="w-1 bg-primary h-6 rounded-full shadow-lg -mt-1" />
            {/* Shadow beneath needle */}
            <div className={`w-4 h-1.5 bg-black/30 rounded-full blur-[1px] transition-all duration-300 ${isMoving ? "scale-50 opacity-100" : "scale-100 opacity-60"}`} />
          </div>
        </div>
      </div>

      {/* Overlay Address Panel */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col space-y-2">
        {error && <div className="bg-destructive/10 text-destructive text-xs py-1 px-3 rounded-full text-center font-bold border border-destructive/20">{error}</div>}
        <div className="glass-panel py-3 px-4 flex items-start space-x-3 shadow-xl border-primary/10 transition-all duration-300 hover:shadow-primary/20">
          <div className={`w-5 h-5 mt-1 flex-shrink-0 flex items-center justify-center ${loading ? "animate-spin" : ""}`}>
             {loading ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full" /> : <MapPin className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">
              {isMoving ? "Locating Door..." : "Confirmed Location"}
            </p>
            <p className="text-sm font-bold truncate leading-tight">
              {loading ? "Searching..." : address}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-3">
         <button
          type="button"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              const newPos = [pos.coords.latitude, pos.coords.longitude];
              setPosition(newPos);
            }, null, { enableHighAccuracy: true });
          }}
          className="p-3 bg-white text-primary rounded-full shadow-2xl border border-primary/20 hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center outline-none"
          title="My Location"
        >
          <Target className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={async () => {
            const finalData = await fetchAddress(position[0], position[1]);
            if (finalData) onSelectAddress(finalData);
          }}
          className="flex items-center space-x-2 px-8 py-4 gradient-primary text-primary-foreground rounded-full shadow-2xl hover:glow-on-hover transition-all font-black text-sm uppercase tracking-wider animate-smooth outline-none disabled:opacity-50"
          disabled={loading || isMoving}
        >
          <Check className="w-6 h-6" />
          <span>Confirm Door</span>
        </button>
      </div>
    </div>
  );
};

const RecenterMap = () => {
   // Logic handled by position state and center prop
  return null;
};

export default AddressPickerMap;
