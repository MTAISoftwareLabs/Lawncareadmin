import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "India",
  });
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: api.cart.get,
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: api.auth.me,
  });

  const validatePromoMutation = useMutation({
    mutationFn: (code: string) => api.promoCodes.validate(code, subtotal),
    onSuccess: (data: any) => {
      setDiscount(data.discount);
      alert(`Promo code applied! You saved ₹${data.discount.toFixed(2)}`);
    },
    onError: (error: Error) => {
      setDiscount(0);
      alert(error.message || "Invalid promo code");
    },
  });

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      alert("Please enter a promo code");
      return;
    }
    validatePromoMutation.mutate(promoCode);
  };

  const createOrderMutation = useMutation({
    mutationFn: () => api.orders.create({
      ...formData,
      promoCode: promoCode || undefined,
      discount: discount,
    }),
    onSuccess: async (data: any) => {
      const order = data.order;
      
      try {
        const finalAmount = Math.max(0, total);
        const paymentData = await api.payment.createOrder(finalAmount);
        
        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: paymentData.name,
          description: paymentData.description,
          handler: async function (_razorpayResponse: any) {
            try {
              await api.payment.verify(order.id);
              queryClient.invalidateQueries({ queryKey: ["cart"] });
              alert("Payment successful! Your order has been placed.");
              setLocation("/profile");
            } catch (error) {
              console.error("Payment verification error:", error);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.user?.name || "",
            email: user?.user?.email || "",
            contact: user?.user?.phone || "",
          },
          theme: {
            color: "#16a34a",
          },
          modal: {
            ondismiss: function () {
              alert("Payment cancelled. Your order is saved but not confirmed.");
              setLocation("/profile");
            }
          }
        };

        if (window.Razorpay) {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } else {
          alert("Payment gateway not loaded. Please refresh and try again.");
        }
      } catch (error: any) {
        alert(error.message || "Failed to initiate payment");
      }
    },
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (cart && cart.length === 0) {
      setLocation("/cart");
    }
  }, [cart, setLocation]);

  if (!cart || cart.length === 0) {
    return null;
  }

  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 50; // Shipping based on pre-tax subtotal
  const GST_RATE = 0.18; // 18% GST
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = discountedSubtotal * GST_RATE;
  const total = discountedSubtotal + gst + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    required
                    placeholder="Enter your full name"
                    value={user?.user?.name || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    required
                    placeholder="Enter your phone number"
                    value={user?.user?.phone || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <Input
                    required
                    placeholder="House No., Building Name, Street"
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      required
                      placeholder="City"
                      value={formData.shippingCity}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingCity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      required
                      placeholder="State"
                      value={formData.shippingState}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingState: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">PIN Code *</label>
                    <Input
                      required
                      placeholder="PIN Code"
                      maxLength={6}
                      value={formData.shippingZip}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingZip: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <Input
                      required
                      value={formData.shippingCountry}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? "Processing..." : "Proceed to Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Promo Discount Applied 🎉</span>
                    <span data-testid="text-discount-amount">-{formatPrice(discount)}</span>
                  </div>
                )}
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discounted Subtotal</span>
                    <span data-testid="text-discounted-subtotal">{formatPrice(discountedSubtotal)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (18%{discount > 0 ? ' on discounted amount' : ''})</span>
                  <span data-testid="text-gst-amount">{formatPrice(gst)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                
                <div className="border-t pt-3 pb-3">
                  <label className="block text-sm font-medium mb-2">Have a promo code?</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      data-testid="input-promo-code"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={validatePromoMutation.isPending}
                      data-testid="button-apply-promo"
                    >
                      {validatePromoMutation.isPending ? "..." : "Apply"}
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      Code "{promoCode}" applied! You're saving ₹{discount.toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total to Pay</span>
                  <span data-testid="text-total-amount" className={discount > 0 ? "text-green-600" : ""}>
                    {formatPrice(Math.max(0, total))}
                  </span>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 text-right">
                    (You saved ₹{discount.toFixed(2)}!)
                  </p>
                )}
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                <p className="font-semibold mb-1">Secure Payment with Razorpay</p>
                <p className="text-xs">Your payment information is encrypted and secure.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
