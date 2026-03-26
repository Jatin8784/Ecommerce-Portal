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

const AddressPickerMap = ({ onSelectAddress, initialCoords = [22.3039, 70.8022] }) => {
  const [position, setPosition] = useState(initialCoords);
  const [address, setAddress] = useState("Fetching location...");
  const [loading, setLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          fetchAddress(newPos[0], newPos[1]);
        },
        (error) => {
          console.warn("Geolocation denied or failed", error);
          fetchAddress(initialCoords[0], initialCoords[1]);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      fetchAddress(initialCoords[0], initialCoords[1]);
    }
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
        
        const result = {
          address: displayAddress,
          city,
          state,
          zipCode: postcode,
          lat,
          lon
        };
        setAddress(displayAddress);
        return result;
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

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl group">
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        <RecenterMap position={position} />
      </MapContainer>

      {/* FIXED CENTER MARKER (Zomato Style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
        <div className={`transition-transform duration-200 ${isMoving ? "-translate-y-4 scale-110" : "translate-y-0"}`}>
          <div className="relative">
            {/* Pin Head */}
            <div className="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
               <MapPin className="w-6 h-6 text-white" />
            </div>
            {/* Pin Needle */}
            <div className="w-1 bg-primary h-4 mx-auto -mt-1 rounded-full shadow-lg"></div>
            {/* Shadow beneath needle */}
            <div className={`w-3 h-1 bg-black/20 rounded-full mx-auto mt-0.5 blur-[1px] transition-all duration-200 ${isMoving ? "scale-50 opacity-100" : "scale-100 opacity-60"}`}></div>
          </div>
        </div>
      </div>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col space-y-2">
        <div className="glass-panel py-3 px-4 flex items-start space-x-3 shadow-lg border-primary/10 transition-all duration-300">
          <div className={`w-5 h-5 mt-1 flex-shrink-0 flex items-center justify-center ${loading ? "animate-spin" : ""}`}>
             {loading ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full" /> : <MapPin className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
              {isMoving ? "Selecting Location..." : "Live Address"}
            </p>
            <p className="text-sm font-medium line-clamp-2 leading-tight">
              {loading ? "Discovering..." : address}
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
              fetchAddress(newPos[0], newPos[1]);
            }, null, { enableHighAccuracy: true });
          }}
          className="p-3 bg-background text-foreground rounded-full shadow-xl border border-border hover:bg-secondary transition-all active:scale-95 flex items-center justify-center outline-none"
          title="Locate Me"
        >
          <Target className="w-6 h-6 text-primary" />
        </button>

        <button
          type="button"
          onClick={async () => {
            const finalData = await fetchAddress(position[0], position[1]);
            if (finalData) onSelectAddress(finalData);
          }}
          className="flex items-center space-x-2 px-6 py-3 gradient-primary text-primary-foreground rounded-full shadow-xl hover:glow-on-hover transition-all font-bold animate-smooth outline-none disabled:opacity-50"
          disabled={loading || isMoving}
        >
          <Check className="w-5 h-5" />
          <span>Confirm Location</span>
        </button>
      </div>
    </div>
  );
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    // Only fly to on mount/locate, not on drag
    // map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
  }, []);
  return null;
};

export default AddressPickerMap;
