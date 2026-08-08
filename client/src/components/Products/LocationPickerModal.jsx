import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search, MapPin, Navigation, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Fix default marker icon issue in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map movement events
function MapController({ onPositionChange }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onPositionChange(center.lat, center.lng);
    },
  });
  return null;
}

const LocationPickerModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [position, setPosition] = useState([23.0225, 72.5714]); // Default Ahmedabad coordinates
  const [currentAddress, setCurrentAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef(null);

  // Fetch address from coordinates (Reverse Geocoding)
  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.district || addr.county || "";
        const state = addr.state || "";
        const pincode = addr.postcode || "";
        const country = addr.country || "India";
        const roadAddress = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood]
          .filter(Boolean)
          .join(", ") || data.display_name?.split(",").slice(0, 3).join(",");

        const fullDisplay = data.display_name || "Selected Location";
        setCurrentAddress(fullDisplay);

        setAddressDetails({
          address: roadAddress || fullDisplay,
          city,
          state,
          pincode,
          country,
          fullDisplay,
          lat,
          lng,
        });
      }
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      setCurrentAddress("Custom Pin Location");
    } finally {
      setLoadingAddress(false);
    }
  };

  // Move map to specific coordinates
  const moveMapTo = (lat, lng, zoom = 16) => {
    setPosition([lat, lng]);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
    fetchAddress(lat, lng);
  };

  // Handle "Use Current Location" GPS button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    toast.info("Fetching your current location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        moveMapTo(latitude, longitude, 17);
        setIsLocating(false);
        toast.success("Location centered on your device!");
      },
      (error) => {
        setIsLocating(false);
        toast.error("Unable to access location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Initial location fetch on open
  useEffect(() => {
    if (isOpen) {
      handleUseCurrentLocation();
    }
  }, [isOpen]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      setIsSearching(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`
      )
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Handle Select Search Result
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery("");
    setSearchResults([]);
    moveMapTo(lat, lng, 16);
  };

  // Confirm Location
  const handleConfirm = () => {
    if (addressDetails) {
      onSelectLocation(addressDetails);
      onClose();
      toast.success("Delivery address updated from map!");
    } else {
      toast.error("Please select a location on map");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Search */}
        <div className="p-4 border-b border-border bg-card flex flex-col gap-3 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                Set Delivery Location
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="flex items-center bg-secondary border border-border rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search area, landmark or street..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent text-sm w-full outline-none text-foreground placeholder:text-muted-foreground"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0 ml-2" />}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-3 hover:bg-primary/10 cursor-pointer flex items-start space-x-3 text-xs border-b border-border/40 last:border-0 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {item.display_name?.split(",")[0]}
                      </p>
                      <p className="text-muted-foreground truncate">{item.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] w-full">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full z-10"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController onPositionChange={fetchAddress} />
          </MapContainer>

          {/* Rapido-Style Fixed Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center">
            <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap animate-bounce">
              Order Delivers Here
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary drop-shadow-lg fill-primary/30" />
            </div>
            <div className="w-2 h-2 rounded-full bg-black/40 blur-[1px] mt-0.5" />
          </div>

          {/* Use Current Location Floating Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-20 flex items-center space-x-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-xl hover:bg-secondary text-foreground text-xs font-semibold transition-all disabled:opacity-50 active:scale-95"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-primary fill-primary/20" />
            )}
            <span>{isLocating ? "Locating..." : "Use Current Location"}</span>
          </button>
        </div>

        {/* Bottom Location Confirmation Card */}
        <div className="p-4 border-t border-border bg-card flex flex-col gap-3 relative z-20">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Selected Location
              </p>
              {loadingAddress ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-0.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching exact address...</span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {currentAddress || "Move map pin to select address"}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loadingAddress || !addressDetails}
            className="w-full py-3.5 gradient-primary text-primary-foreground rounded-xl font-bold text-sm hover:glow-on-hover transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Delivery Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
