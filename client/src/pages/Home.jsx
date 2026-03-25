import React from "react";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import NewsletterSection from "../components/Home/NewsletterSection";
import { useSelector } from "react-redux";

const Index = () => {
  const { topRatedProducts, newProducts, loading } = useSelector(
    (state) => state.product
  );
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />
        {(loading || newProducts.length > 0) && (
          <ProductSlider
            title="New Arrivals"
            products={newProducts}
            loading={loading}
          />
        )}
        {(loading || topRatedProducts.length > 0) && (
          <ProductSlider
            title="Top Rated Products"
            products={topRatedProducts}
            loading={loading}
          />
        )}
        <FeatureSection />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Index;
