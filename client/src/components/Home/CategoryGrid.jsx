import { Link } from "react-router-dom";
import { categories } from "../../data/products";

const CategoryGrid = () => {
  return (
    <section className="py-16 px-4">
      <div className="mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
          Shop by Category
        </h2>
        <p className="text-muted-foreground">
          Find exactly what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name}`}
            className="group glass-card p-4 sm:p-6 text-center transition-all duration-300 block h-full hover:shadow-lg"
          >
            <div className="relative aspect-square sm:aspect-video overflow-hidden rounded-lg mb-4">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
