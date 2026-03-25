import React from "react";
import { Link } from "react-router-dom";

const CategoryGrid = () => {
  const categories = [
    { id: 1, name: "Electronics", image: "./electronics.jpg" },
    { id: 2, name: "Fashion", image: "./fashion.jpg" },
    { id: 3, name: "Home & Garden", image: "./furniture.jpg" },
    { id: 4, name: "Gifts", image: "./gift.jpg" },
  ];

  return (
    <section className="py-12 px-4">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Shop by Category
        </h2>
        <p className="text-gray-600">
          Find exactly what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name}`}
            className="group block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square overflow-hidden rounded-md mb-3">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="text-center font-medium text-gray-900 group-hover:text-blue-600 truncate">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
