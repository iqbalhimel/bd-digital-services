import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  useListOrders, 
  getListOrdersQueryKey
} from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminOrders() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin");
  }, [location, setLocation]);

  const { data: orders, isLoading } = useListOrders({
    query: { queryKey: getListOrdersQueryKey() }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View all customer orders.</p>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium whitespace-nowrap">#{order.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">{order.phone}</span>
                          {order.email && <span className="text-xs text-muted-foreground">{order.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{order.productName || "Unknown Product"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize whitespace-nowrap">{order.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={order.message || ""}>
                        {order.message || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
