import React, { useState, useEffect } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductWithAI } from "../../store/slices/productSlice.js";
import { toggleAIModal } from "../../store/slices/popupSlice.js";

const AISearchModal = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const { aiSearching } = useSelector((state) => state.product);
  const { isAIPopupOpen } = useSelector((state) => state.popup);

  // Clear input when modal closes
  useEffect(() => {
    if (!isAIPopupOpen) {
      setUserPrompt("");
    }
  }, [isAIPopupOpen]);

  const exampleText = [
    "Find the best suitable GPU with Ryzen 5600X",
    "Leather jackets for men",
    "Red t-shirts for summer",
  ];

  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (userPrompt.trim()) {
      dispatch(fetchProductWithAI(userPrompt));
    }
  };

  if (!isAIPopupOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm 
    z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
        onClick={() => dispatch(toggleAIModal())}
      >
        <div
          className="bg-background/95 backdrop-blur-md border-t sm:border 
      border-border rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-2xl 
      max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 
            to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  AI Product Search
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleAIModal())}
              className="p-2 rounded-full hover:bg-secondary transition-colors border border-transparent hover:border-border"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Describe what you're looking for, mentioning brands, features, or use cases, and our AI will find the perfect products for you.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="e.g., 'A wireless headphone for gaming with good bass'"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full pl-12 pr-4 py-4 sm:py-5 bg-secondary/50 border border-border rounded-xl focus:outline-none 
              focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground text-base sm:text-lg transition-all"
                required
                autoFocus
                disabled={aiSearching}
              />
            </div>

            <button
              type="submit"
              disabled={aiSearching || !userPrompt.trim()}
              className={`w-full py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl 
              font-bold text-base sm:text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20 ${
                aiSearching && "animate-pulse"
              }`}
            >
              {aiSearching ? (
                <>
                  <div
                    className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`}
                  />
                  <span>AI finding products...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </form>

          {/* Example Queries */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-medium text-foreground mb-4">
              Try searching for:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleText.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setUserPrompt(example)}
                  className="px-4 py-2 bg-secondary/80 text-foreground rounded-lg 
                text-sm hover:bg-primary hover:text-primary-foreground transition-all border border-border/50 hover:border-primary"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISearchModal;
