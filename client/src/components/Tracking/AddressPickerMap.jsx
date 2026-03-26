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
  const [address, setAddress] = useState("Finding your building...");
  const [houseNo, setHouseNo] = useState(""); // Manual entry for door
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;
    if (navigator.geolocation) {
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

      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        null,
        { enableHighAccuracy: true }
      );
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
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
        
        // Advanced Building/Street Parsing
        const bldg = addr.building || addr.office || addr.amenity || addr.house_name || "";
        const house = addr.house_number || "";
        const road = addr.road || addr.pedestrian || "";
        const neighbourhood = addr.neighbourhood || addr.suburb || "";
        const city = addr.city || addr.town || addr.village || "";
        const state = addr.state || "";
        
        const streetPart = [house, bldg, road].filter(Boolean).join(", ");
        const areaPart = [neighbourhood, city].filter(Boolean).join(", ");
        const fullDisplay = [streetPart, areaPart].filter(Boolean).join(", ") || data.display_name;
        
        setAddress(fullDisplay);
        return { 
          address: fullDisplay, 
          city, 
          state, 
          zipCode: addr.postcode || "", 
          lat, 
          lon 
        };
      }
    } catch (error) {
       console.error(error);
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
      <div className="w-full h-[400px] rounded-2xl bg-secondary flex flex-col items-center justify-center space-y-4 shadow-inner">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold animate-pulse text-primary tracking-widest uppercase text-xs">Connecting to Nav-Sat...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group transition-all duration-500">
      <MapContainer center={position} zoom={18} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url={isSatellite 
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution='&copy; ESRI / OpenStreetMap'
        />
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({
            className: 'blue-dot-container',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
                <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
              </div>
            `,
            iconSize: [32, 32]
          })} />
        )}
        <MapEvents />
      </MapContainer>

      {/* PIN OVERLAY */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none -mt-4">
        <div className={`transition-all duration-300 ${isMoving ? "-translate-y-8 scale-125" : "translate-y-0"}`}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${isMoving ? "bg-primary" : "bg-black"}`}>
               <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className={`w-1.5 h-6 mx-auto -mt-1 rounded-full ${isMoving ? "bg-primary" : "bg-black"}`}></div>
            <div className={`w-4 h-1 bg-black/30 rounded-full blur-[1px] mt-1 transition-opacity ${isMoving ? "opacity-100 scale-50" : "opacity-0 scale-100"}`}></div>
          </div>
        </div>
      </div>

      {/* TOP PANEL: ADDRESS & HOUSE NO */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col space-y-2 pointer-events-none">
        <div className="glass-panel p-4 shadow-2xl border-white/20 backdrop-blur-xl pointer-events-auto rounded-2xl flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${loading ? "bg-primary/20 animate-pulse" : "bg-black text-white"}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-tighter mb-0.5">Live Delivery Point</p>
              <p className="text-sm font-bold truncate">{loading ? "Pinpointing Accuracy..." : address}</p>
            </div>
          </div>
          
          <div className="relative group/input">
            <input 
              type="text"
              placeholder="House No / Flat / Building Name..."
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/50 opacity-0 group-focus-within/input:opacity-100 transition-opacity">REQUIRED</div>
          </div>
        </div>
      </div>

      {/* SIDE BUTTONS */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-3">
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all border-2 ${isSatellite ? "bg-black text-white border-white" : "bg-white text-black border-transparent"}`}
          title="Satellite View"
        >
          <Target className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => { if (userLocation) setPosition(userLocation); }}
          className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-2xl flex items-center justify-center outline-none border-2 border-transparent hover:border-blue-400 transition-all"
        >
          <MapPin className="w-6 h-6 animate-pulse" />
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
          className="px-8 py-4 bg-black text-white rounded-2xl shadow-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-2 active:scale-95 transition-all border-2 border-transparent hover:border-white/20"
          disabled={loading || isMoving}
        >
          <Check className="w-5 h-5 text-green-400" />
          <span>Confirm Door</span>
        </button>
      </div>

      <style>{`
        .blue-dot-container { background: transparent !important; border: none !important; }
        .glass-panel { background: rgba(255, 255, 255, 0.85); transition: background 0.3s ease; }
        .glass-panel:focus-within { background: rgba(255, 255, 255, 0.95); }
      `}</style>
    </div>
  );
};

const RecenterMap = () => {
   // Logic handled by position state and center prop
  return null;
};

export default AddressPickerMap;
