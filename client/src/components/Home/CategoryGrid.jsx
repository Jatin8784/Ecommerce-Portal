import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const CategoryGrid = () => {
  const categories = [
    { id: 1, name: "Electronics", image: "./electronics.jpg" },
    { id: 2, name: "Fashion", image: "./fashion.jpg" },
    { id: 3, name: "Home & Garden", image: "./furniture.jpg" },
    { id: 4, name: "Gifts", image: "./gift.jpg" },
  ];

  return (
    <section className="py-16">
      <div className="mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
          Shop by Category
        </h2>
        <p className="text-muted-foreground">
          Find exactly what you're looking for
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={itemVariants}>
            <Link
              to={`/products?category=${category.name}`}
              className="group glass-card p-6 text-center hover:glow-on-hover transition-all duration-300 block"
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <motion.img
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default CategoryGrid;
