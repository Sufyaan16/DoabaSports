import { Price, PriceValue } from "@/components/price";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CRICKET_BATS } from "@/lib/data/products";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Cricket Bats</h1>
        <p className="text-lg text-muted-foreground">
          Explore our premium collection of cricket bats from top brands
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CRICKET_BATS.map((bat) => (
          <a
            key={bat.id}
            href={`/products/${bat.id}`}
            className="block transition-opacity hover:opacity-80"
          >
            <Card className="h-full overflow-hidden p-0">
              <CardHeader className="relative block p-0">
                <AspectRatio ratio={1.268115942} className="overflow-hidden">
                  <img
                    src={bat.image.src}
                    alt={bat.image.alt}
                    className="block size-full object-cover object-center"
                  />
                </AspectRatio>
                {bat.badge && (
                  <Badge
                    style={{
                      background: bat.badge.backgroundColor,
                    }}
                    className="absolute start-4 top-4"
                  >
                    {bat.badge.text}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-3 pb-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {bat.company}
                  </p>
                  <CardTitle className="text-xl font-semibold">
                    {bat.name}
                  </CardTitle>
                </div>
                <CardDescription className="font-medium text-muted-foreground line-clamp-2">
                  {bat.description}
                </CardDescription>
                <div className="mt-auto">
                  <Price
                    onSale={bat.price.sale != null}
                    className="text-lg font-semibold"
                  >
                    <PriceValue
                      price={bat.price.regular}
                      currency={bat.price.currency}
                      variant="regular"
                    />
                    <PriceValue
                      price={bat.price.sale}
                      currency={bat.price.currency}
                      variant="sale"
                    />
                  </Price>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
