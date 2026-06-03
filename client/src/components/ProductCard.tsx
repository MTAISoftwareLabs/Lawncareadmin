import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Eye, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  id: number;
  name: string;
  price: string | number;
  image: string;
  category: string;
}

export function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${id}`}>
        <Card className="overflow-hidden cursor-pointer h-full hover:shadow-lg transition-shadow">
          <div className="aspect-square overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
            />
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{category}</p>
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
            <p className="text-2xl font-bold">{formatPrice(price)}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
