import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";

interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  newCustomers: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface CategoryPerformance {
  category: string;
  totalRevenue: number;
  totalOrders: number;
}

function AdminAnalyticsContent() {
  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/admin/analytics/overview"],
  });

  const { data: salesTrends, isLoading: trendsLoading } = useQuery<SalesTrend[]>({
    queryKey: ["/api/admin/analytics/sales-trends"],
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery<TopProduct[]>({
    queryKey: ["/api/admin/analytics/top-products"],
  });

  const { data: orderStatus, isLoading: statusLoading } = useQuery<OrderStatus[]>({
    queryKey: ["/api/admin/analytics/order-status"],
  });

  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery<CategoryPerformance[]>({
    queryKey: ["/api/admin/analytics/category-performance"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const calculateTrend = () => {
    if (!salesTrends || salesTrends.length < 2) return 0;
    const recentWeek = salesTrends.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
    const previousWeek = salesTrends.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
    if (previousWeek === 0) return 0;
    return ((recentWeek - previousWeek) / previousWeek) * 100;
  };

  const trend = calculateTrend();

  return (
    <AdminLayout>
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-analytics">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your business performance and insights</p>
      </div>

      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-revenue">
                {formatCurrency(overview?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {trend > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trend.toFixed(1)}% from last week
                  </span>
                ) : trend < 0 ? (
                  <span className="text-red-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {Math.abs(trend).toFixed(1)}% from last week
                  </span>
                ) : (
                  <span className="text-gray-600">No change from last week</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-orders">
                {overview?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-customers">
                {overview?.totalCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-new-customers">
                {overview?.newCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends (Last 30 Days)</CardTitle>
            <p className="text-sm text-gray-600">Daily revenue and order count</p>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-64 bg-gray-200 animate-pulse rounded" />
            ) : salesTrends && salesTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-right px-3 py-2">Orders</th>
                        <th className="text-right px-3 py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody data-testid="table-sales-trends">
                      {salesTrends.map((trend, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2" data-testid={`sales-date-${index}`}>{formatDate(trend.date)}</td>
                          <td className="px-3 py-2 text-right" data-testid={`sales-orders-${index}`}>{trend.orders}</td>
                          <td className="px-3 py-2 text-right" data-testid={`sales-revenue-${index}`}>{formatCurrency(trend.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No sales data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <p className="text-sm text-gray-600">Current order status breakdown</p>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="h-64 bg-gray-200 animate-pulse rounded" />
            ) : orderStatus && orderStatus.length > 0 ? (
              <div className="space-y-3" data-testid="list-order-status">
                {orderStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between" data-testid={`status-item-${index}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="capitalize font-medium" data-testid={`status-name-${index}`}>{status.status}</span>
                    </div>
                    <span className="text-2xl font-bold" data-testid={`status-count-${index}`}>{status.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products</CardTitle>
            <p className="text-sm text-gray-600">Best performing products by revenue</p>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="h-80 bg-gray-200 animate-pulse rounded" />
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">Product</th>
                        <th className="text-right px-3 py-2">Sold</th>
                        <th className="text-right px-3 py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody data-testid="table-top-products">
                      {topProducts.map((product, index) => (
                        <tr key={product.productId} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2" data-testid={`product-name-${index}`}>{product.productName}</td>
                          <td className="px-3 py-2 text-right" data-testid={`product-quantity-${index}`}>{product.totalQuantity}</td>
                          <td className="px-3 py-2 text-right font-semibold" data-testid={`product-revenue-${index}`}>{formatCurrency(product.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No product sales yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <p className="text-sm text-gray-600">Revenue breakdown by category</p>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="h-80 bg-gray-200 animate-pulse rounded" />
            ) : categoryPerformance && categoryPerformance.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">Category</th>
                        <th className="text-right px-3 py-2">Orders</th>
                        <th className="text-right px-3 py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody data-testid="table-category-performance">
                      {categoryPerformance.map((cat, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2" data-testid={`category-name-${index}`}>{cat.category}</td>
                          <td className="px-3 py-2 text-right" data-testid={`category-orders-${index}`}>{cat.totalOrders}</td>
                          <td className="px-3 py-2 text-right font-semibold" data-testid={`category-revenue-${index}`}>{formatCurrency(cat.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminGuard>
      <AdminAnalyticsContent />
    </AdminGuard>
  );
}
