import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useListOrders,
  getListOrdersQueryKey,
  useUpdateOrderStatus,
} from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrders() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin");
  }, [location, setLocation]);

  const ordersQueryKey = getListOrdersQueryKey();

  const { data: orders, isLoading } = useListOrders({
    query: { queryKey: ordersQueryKey }
  });

  const updateStatusMutation = useUpdateOrderStatus({
    mutation: {
      onMutate: async ({ id, data: { status } }) => {
        await queryClient.cancelQueries({ queryKey: ordersQueryKey });

        const previous = queryClient.getQueryData<Order[]>(ordersQueryKey);

        queryClient.setQueryData<Order[]>(ordersQueryKey, (old) =>
          old?.map((o) => (o.id === id ? { ...o, status } : o)) ?? []
        );

        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData<Order[]>(ordersQueryKey, context.previous);
        }
        toast({ title: "Failed to update status", variant: "destructive" });
      },
      onSuccess: (_data, { id }) => {
        toast({ title: "Status updated", description: `Order #${id} status saved.` });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      },
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      data: { status: newStatus as "pending" | "processing" | "completed" | "cancelled" },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View and manage customer orders.</p>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
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
                      <TableCell>
                        <Select
                          value={order.status || "pending"}
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className={`h-8 w-[130px] text-xs font-semibold border ${STATUS_COLORS[order.status || "pending"] || "bg-gray-100 text-gray-800"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
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
