export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] bg-linear-to-br from-primary/20 to-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 md:px-8 lg:px-20 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              About Doaba Sports
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Your trusted partner for premium cricket equipment and steel solutions since 1995
            </p>
          </div>
        </div>
      </section>

      {/* Cricket Business Section */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Cricket Heritage</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Doaba Sports has been at the forefront of cricket equipment manufacturing and distribution 
              for over two decades. We pride ourselves on delivering premium quality cricket bats, protective 
              gear, accessories, and apparel to players at all levels.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              Our commitment to excellence drives us to work directly with the finest factories and craftsmen, 
              ensuring every product meets our rigorous quality standards.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80"
              alt="Cricket Equipment"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Manufacturing Process */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">How We Create Excellence</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Factory Partnership</h4>
              <p className="text-muted-foreground">
                We collaborate with premier cricket equipment manufacturers in Sialkot, ensuring 
                authentic craftsmanship and superior materials.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Quality Control</h4>
              <p className="text-muted-foreground">
                Every cricket bat undergoes rigorous testing for balance, weight distribution, 
                and performance before reaching our customers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Direct Distribution</h4>
              <p className="text-muted-foreground">
                From our factories to your doorstep - we eliminate middlemen to provide 
                you with the best prices without compromising quality.
              </p>
            </div>
          </div>
        </div>

        {/* Product Range */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🏏</div>
            <h4 className="font-bold text-lg mb-2">Cricket Bats</h4>
            <p className="text-sm text-muted-foreground">
              English & Kashmir willow bats from top brands
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🥊</div>
            <h4 className="font-bold text-lg mb-2">Protection Gear</h4>
            <p className="text-sm text-muted-foreground">
              Helmets, pads, gloves & guards
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">👕</div>
            <h4 className="font-bold text-lg mb-2">Apparel</h4>
            <p className="text-sm text-muted-foreground">
              Professional jerseys & training wear
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🎒</div>
            <h4 className="font-bold text-lg mb-2">Accessories</h4>
            <p className="text-sm text-muted-foreground">
              Bags, balls, stumps & more
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Steel Business Section */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            We Also Deal in Other Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beyond cricket equipment, we're proud to operate{" "}
            <span className="font-bold text-foreground">Doaba Steel and Pipe Corporation</span>
            , specializing in premium steel gates and metal fabrication
          </p>
        </div>

        {/* Steel Business Info */}
        <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Doaba Steel & Pipe Corporation</h3>
              <p className="text-lg text-muted-foreground mb-4">
                With decades of expertise in metal fabrication, we manufacture and install 
                high-quality steel gates, grills, and custom metalwork solutions for residential 
                and commercial properties.
              </p>
              <p className="text-lg text-muted-foreground">
                Our skilled craftsmen combine traditional techniques with modern technology to 
                deliver durable, secure, and aesthetically pleasing steel products.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-6 text-center border">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Gates Installed</p>
              </div>
              <div className="bg-background rounded-lg p-6 text-center border">
                <div className="text-3xl font-bold text-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="bg-background rounded-lg p-6 text-center border">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Quality Assured</p>
              </div>
              <div className="bg-background rounded-lg p-6 text-center border">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Support Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steel Gates Gallery */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-8 text-center">Our Steel Work Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
              "https://images.unsplash.com/photo-1565183928294-7d22f5ab9ddd?w=800&q=80",
              "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
              "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
              "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
            ].map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
              >
                <img
                  src={image}
                  alt={`Steel gate work ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white font-semibold text-lg">View Project</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Need Custom Steel Work?</h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Contact Doaba Steel and Pipe Corporation for custom steel gates, grills, 
            and metal fabrication solutions tailored to your needs.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Get a Quote
          </button>
        </div>
      </section>
    </div>
  );
}
