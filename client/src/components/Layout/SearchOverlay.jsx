import { useState } from "react";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleSearchBar } from "../../store/slices/popupSlice";

const SearchOverlay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSearchBarOpen } = useSelector((state) => state.popup);

  if (!isSearchBarOpen) {
    return null;
  }

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      dispatch(toggleSearchBar());
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50">
        {/* Glass BackGround */}
        <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]">
          {/* Search Container */}
          <div className="relative z-10 animate-slide-in-top">
            <div className="glass-panel m-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">
                  Search Products
                </h2>
                <button
                  onClick={() => dispatch(toggleSearchBar())}
                  className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              <div className="relative">
                {/* Search Icon Button */}
                <button
                  onClick={handleSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
                >
                  <Search className="w-5 h-5 text-primary" />
                </button>

                <input
                  type="text"
                  placeholder="Search for Products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-lg focus:outline-none text-foreground placeholder-muted-foreground"
                  autoFocus
                />
              </div>

              <div className="mt-6 text-center text-muted-foreground">
                <p>Start typing to search for products...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchOverlay;
