import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Minus, Plus, Heart, Share2, Star, Truck, Shield, RotateCcw, Leaf } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { apiRequest } from "@/lib/queryClient";

export function ProductDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.products.getById(Number(id)),
  });

  const { data: allProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.getAll({}),
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: api.auth.me,
    retry: false,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.reviews.getByProduct(Number(id)),
  });

  useEffect(() => {
    if (id && product) {
      const sessionId = localStorage.getItem("sessionId") || 
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("sessionId", sessionId);
      
      apiRequest(`/api/products/${id}/view`, { 
        method: "POST", 
        body: JSON.stringify({ sessionId }) 
      }).catch(err => {
        console.error("Failed to track view:", err);
      });
    }
  }, [id, product]);

  const addToCartMutation = useMutation({
    mutationFn: () => api.cart.add(Number(id), quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      alert("Added to cart successfully!");
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: () => api.wishlist.add(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      alert("Added to wishlist successfully!");
    },
    onError: () => {
      alert("Failed to add to wishlist");
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowPhonePopup(true);
      return;
    }
    
    addToCartMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/checkout");
      }
    });
  };

  const handleQuickCheckout = async () => {
    if (phoneNumber.length === 10) {
      try {
        await api.auth.quickRegister(phoneNumber);
        
        await addToCartMutation.mutateAsync();
        
        queryClient.invalidateQueries({ queryKey: ["user"] });
        
        setShowPhonePopup(false);
        setLocation("/checkout");
      } catch (error: any) {
        alert(error.message || "Failed to process quick checkout. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-600">Product not found</p>
          <Button onClick={() => setLocation("/products")} className="mt-4">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = allProducts?.filter(
    (p: any) => p.category === product.category && p.id !== product.id
  ).slice(0, 4) || [];

  const productImages = [product.image, product.image, product.image, product.image];

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-12 mb-16"
        >
          <div className="space-y-6">
            <motion.div
              className="aspect-square overflow-hidden rounded-2xl bg-white shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === idx ? 'border-green-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <motion.span
                className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {product.category}
              </motion.span>
              
              <motion.h1
                className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {product.name}
              </motion.h1>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No rating'}
                </span>
                <span className="text-sm text-gray-600">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <motion.div
                className="flex items-baseline gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-3xl lg:text-4xl font-bold text-green-600">{formatPrice(product.price)}</p>
                <p className="text-lg text-gray-400 line-through">{formatPrice(Number(product.price) * 1.3)}</p>
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-sm font-semibold">
                  Save 30%
                </span>
              </motion.div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-gray-700 leading-relaxed">
                {product.description || "Premium lawn care product designed to give you professional results. Crafted with quality ingredients for optimal lawn health and beautiful results."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">100% Natural</p>
                  <p className="text-xs text-gray-600">Organic ingredients</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Clinically Tested</p>
                  <p className="text-xs text-gray-600">Safe & effective</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">30-Day Return</p>
                  <p className="text-xs text-gray-600">Money back guarantee</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <Truck className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600">Orders above ₹500</p>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-gray-900">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm">
                <div className={`h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                <p className="font-medium text-gray-700">
                  {product.stock > 10 ? `${product.stock} items in stock` : `Only ${product.stock} items left!`}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-4"
                    onClick={() => {
                      if (!user) {
                        setLocation("/login");
                        return;
                      }
                      addToWishlistMutation.mutate();
                    }}
                    disabled={addToWishlistMutation.isPending}
                    data-testid="button-add-wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                <Button
                  className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ 
                        title: product.name, 
                        text: product.description,
                        url: window.location.href 
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert("Product link copied to clipboard!");
                      }).catch(() => {
                        alert("Unable to copy link. Please copy manually: " + window.location.href);
                      });
                    }
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Product
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>

        {isLoadingReviews ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900">Customer Reviews</h2>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : reviewCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                <span className="text-gray-600">({reviewCount})</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900" data-testid={`review-author-${review.id}`}>
                          {review.userName || 'Anonymous'}
                        </p>
                        {review.isVerifiedPurchase && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2" data-testid={`review-title-${review.id}`}>
                      {review.title}
                    </h4>
                  )}
                  <p className="text-gray-700 leading-relaxed" data-testid={`review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-gray-900">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any, index: number) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ProductCard
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    price={relatedProduct.price}
                    image={relatedProduct.image}
                    category={relatedProduct.category}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showPhonePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPhonePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-2">Quick Checkout</h3>
              <p className="text-gray-600 mb-6">
                Enter your phone number to proceed with your order
              </p>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-green-600 focus:outline-none"
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPhonePopup(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleQuickCheckout}
                  disabled={phoneNumber.length !== 10}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
