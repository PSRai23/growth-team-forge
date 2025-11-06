import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const collections = [
  {
    id: 1,
    title: "Summer Essentials",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    itemCount: 24,
  },
  {
    id: 2,
    title: "Office Elegance",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop",
    itemCount: 18,
  },
  {
    id: 3,
    title: "Weekend Casual",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
    itemCount: 32,
  },
];

export function FeaturedCollections() {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-serif font-semibold text-primary mb-4 px-4">
        Featured Collections
      </h3>
      
      <Carousel className="w-full px-4">
        <CarouselContent className="-ml-2 md:-ml-4">
          {collections.map((collection) => (
            <CarouselItem key={collection.id} className="pl-2 md:pl-4 basis-4/5 md:basis-1/2">
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-serif font-semibold text-lg mb-1">
                      {collection.title}
                    </h4>
                    <p className="text-xs text-white/90">
                      {collection.itemCount} items
                    </p>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
