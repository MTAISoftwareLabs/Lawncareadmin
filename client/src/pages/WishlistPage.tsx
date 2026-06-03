import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export function WishlistPage() {
  const queryClient = useQueryClient();
  
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: api.wishlist.getAll,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => api.wishlist.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => api.cart.add(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-500" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
      </div>

      {!wishlistItems || wishlistItems.length === 0 ? (
        <Card data-testid="empty-wishlist">
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-4">
              Save items you love to your wishlist
            </p>
            <Link href="/products">
              <Button data-testid="button-browse">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item: any) => (
            <Card key={item.id} data-testid={`card-wishlist-${item.id}`}>
              <CardContent className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-product-${item.product.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </Link>
                <h3 className="font-semibold mb-2" data-testid={`text-name-${item.product.id}`}>
                  {item.product.name}
                </h3>
                <p className="text-lg font-bold text-primary mb-4" data-testid={`text-price-${item.product.id}`}>
                  ₹{parseFloat(item.product.price).toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCartMutation.mutate(item.product.id)}
                    disabled={addToCartMutation.isPending || item.product.stock === 0}
                    className="flex-1"
                    data-testid={`button-add-cart-${item.product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {item.product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    variant="outline"
                    size="sm"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
