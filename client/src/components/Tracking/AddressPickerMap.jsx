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
  const markerRef = useRef(null);

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

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          fetchAddress(newPos.lat, newPos.lng);
        }
      },
    }),
    [],
  );

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  useEffect(() => {
    fetchAddress(position[0], position[1]);
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl group">
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
        />
        <MapEvents />
        <RecenterMap position={position} />
      </MapContainer>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col space-y-2">
        <div className="glass-panel py-3 px-4 flex items-start space-x-3 shadow-lg border-primary/10">
          <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Live Address</p>
            <p className="text-sm font-medium line-clamp-2 leading-tight">
              {loading ? "Locating..." : address}
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
            });
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
          className="flex items-center space-x-2 px-6 py-3 gradient-primary text-primary-foreground rounded-full shadow-xl hover:glow-on-hover transition-all font-bold animate-smooth outline-none"
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
    map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
  }, [position, map]);
  return null;
};

export default AddressPickerMap;
