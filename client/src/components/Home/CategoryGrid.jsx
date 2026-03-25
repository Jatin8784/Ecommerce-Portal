import { Link } from "react-router-dom";
import { categories } from "../../data/products";
const CategoryGrid = () => {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
          Shop by Category
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our wide range of products across different categories
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name}`}
            className="group glass-card overflow-hidden hover:glow-on-hover animate-smooth flex flex-col items-center"
          >
            <div className="relative w-full aspect-square overflow-hidden mb-0">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="p-4 w-full text-center">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate px-2">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
