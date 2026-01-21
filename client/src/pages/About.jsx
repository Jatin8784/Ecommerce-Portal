import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do.'
    },
    {
      icon: Award,
      title: 'Quality Products',
      description: 'We ensure all products meet our high standards.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building lasting relationships with our customers.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Constantly improving our platform and services.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">About ShopMate</h1>
          <p className="text-xl text-muted-foreground">
            Your trusted e-commerce platform for quality products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-secondary rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded with a vision to make online shopping simple and enjoyable, ShopMate has grown 
            to become a trusted platform for thousands of customers worldwide. We believe that 
            everyone deserves access to quality products at fair prices, backed by exceptional 
            customer service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;