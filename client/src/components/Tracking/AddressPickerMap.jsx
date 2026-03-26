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
  const [position, setPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState("Pinpointing your exact building...");
  const [houseNo, setHouseNo] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;
    const startGPS = () => {
      if (!navigator.geolocation) {
        setError("Your browser does not support GPS tracking.");
        setLoading(false);
        return;
      }

      // NO FALLBACK. We wait for REAL GPS.
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setUserLocation(newPos);
          fetchAddress(newPos[0], newPos[1]);
          setError(null);
        },
        (err) => {
          console.warn("GPS Error:", err);
          setError("GPS Permission Denied. Please click 'Allow' or enable Location in your settings to use the Live Map.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        null,
        { enableHighAccuracy: true }
      );
    };

    startGPS();
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchAddress = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data) {
        const addr = data.address || {};
        
        // Extract MOST DETAILED address string possible automatically
        const displayAddress = data.display_name.split(",").slice(0, -3).join(",").trim() || data.display_name;
        
        const city = addr.city || addr.town || addr.village || "";
        const state = addr.state || "";
        const zip = addr.postcode || "";

        setAddress(displayAddress);
        return { address: displayAddress, city, state, zipCode: zip, lat, lon };
      }
    } catch (err) {
       console.error(err);
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

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-destructive/5 flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-destructive/20 border-dashed">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-destructive animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="font-black text-destructive uppercase tracking-widest text-sm">GPS Permission Required</p>
          <p className="text-sm text-foreground/70 leading-relaxed font-medium">
            We cannot fetch your <b>Live Location</b> because it is blocked. <br/>
            Please enable <b>Location Services</b> in your browser settings to continue automatically.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-destructive text-destructive-foreground rounded-xl font-bold text-sm hover:scale-105 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-secondary flex flex-col items-center justify-center p-8 space-y-6 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <div className="relative">
             <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary animate-ping" />
             </div>
        </div>
        <div className="text-center relative z-10">
          <p className="font-black text-primary tracking-[0.2em] uppercase text-sm mb-1">Live Tracking Active</p>
          <p className="text-xs font-bold text-muted-foreground animate-bounce">Fetching your Real-World Coordinates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
      <MapContainer center={position} zoom={18} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url={isSatellite 
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}' 
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution='&copy; ESRI / OpenStreetMap'
        />
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({
            className: 'blue-dot-container',
            html: `<div class="relative flex items-center justify-center">
                    <div class="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
                    <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-2xl"></div>
                   </div>`,
            iconSize: [40, 40]
          })} />
        )}
        <MapEvents />
      </MapContainer>

      {/* FLOATING PIN (CENTER) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none -mt-4">
        <div className={`transition-all duration-300 ${isMoving ? "-translate-y-10 scale-125" : "translate-y-0"}`}>
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${isMoving ? "bg-primary animate-pulse" : "bg-black"}`}>
               <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className={`w-1.5 h-6 mx-auto -mt-1 rounded-full ${isMoving ? "bg-primary" : "bg-black"}`}></div>
          </div>
        </div>
      </div>

      {/* AUTOMATIC ADDRESS BAR */}
      <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="glass-panel p-5 shadow-2xl border-white/20 backdrop-blur-2xl rounded-2xl flex flex-col space-y-4 pointer-events-auto border-2 border-black/5">
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${loading ? "bg-primary/20 animate-pulse" : "bg-black text-white"}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Detected Live Address</p>
              <p className="text-sm font-black truncate text-black">{loading ? "Pinpointing Accuracy..." : address}</p>
            </div>
          </div>
          
          <div className="h-px bg-black/5 w-full" />
          
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              placeholder="Add Floor / Building / Landmark (Optional)..."
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="flex-1 bg-secondary/30 border-2 border-transparent focus:border-black/10 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* CONTROL BUTTONS */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-4">
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all border-4 ${isSatellite ? "bg-black text-white border-white" : "bg-white text-black border-transparent"}`}
        >
          <Target className="w-7 h-7" />
        </button>

        <button
          type="button"
          onClick={async () => {
            const data = await fetchAddress(position[0], position[1]);
            if (data) {
              const finalAddress = houseNo ? `${houseNo}, ${data.address}` : data.address;
              onSelectAddress({ ...data, address: finalAddress });
            }
          }}
          className="h-14 px-10 bg-black text-white rounded-2xl shadow-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 active:scale-95 transition-all hover:bg-zinc-800"
          disabled={loading || isMoving}
        >
          <Check className="w-6 h-6 text-green-400" />
          <span>Confirm Location</span>
        </button>
      </div>

      <style>{`
        .blue-dot-container { background: transparent !important; border: none !important; }
        .glass-panel { background: rgba(255, 255, 255, 0.9); }
      `}</style>
    </div>
  );
};

const RecenterMap = () => {
   // Logic handled by position state and center prop
  return null;
};

export default AddressPickerMap;
