import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  useListProducts, 
  getListProductsQueryKey,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product, CreateProductBody } from "@workspace/api-client-react";

export default function AdminProducts() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [priceBdt, setPriceBdt] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [badge, setBadge] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin");
  }, [location, setLocation]);

  const { data: products, isLoading } = useListProducts(
    {}, 
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const resetForm = () => {
    setEditingProduct(null);
    setNameBn("");
    setNameEn("");
    setDescriptionBn("");
    setDescriptionEn("");
    setCategoryId("");
    setPriceBdt("");
    setPriceUsd("");
    setBadge("");
    setIsActive(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setNameBn(product.nameBn);
    setNameEn(product.nameEn);
    setDescriptionBn(product.descriptionBn || "");
    setDescriptionEn(product.descriptionEn || "");
    setCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setPriceBdt(product.priceBdt);
    setPriceUsd(product.priceUsd);
    setBadge(product.badge || "");
    setIsActive(product.isActive);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: CreateProductBody = {
      nameBn,
      nameEn,
      descriptionBn: descriptionBn || null,
      descriptionEn: descriptionEn || null,
      categoryId: categoryId && categoryId !== "none" ? parseInt(categoryId) : null,
      priceBdt,
      priceUsd,
      badge: badge || null,
      isActive,
    };

    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({ title: "Product updated successfully" });
            setIsModalOpen(false);
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({ title: "Product created successfully" });
            setIsModalOpen(false);
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product deleted successfully" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your store products.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsModalOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English) *</Label>
                    <Input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameBn" className="font-bn">Name (Bangla) *</Label>
                    <Input id="nameBn" value={nameBn} onChange={(e) => setNameBn(e.target.value)} required className="font-bn" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceBdt">Price (BDT) *</Label>
                    <Input id="priceBdt" value={priceBdt} onChange={(e) => setPriceBdt(e.target.value)} placeholder="e.g. 500" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceUsd">Price (USD) *</Label>
                    <Input id="priceUsd" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} placeholder="e.g. 5.00" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nameEn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Popular, Hot" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Textarea id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionBn" className="font-bn">Description (Bangla)</Label>
                  <Textarea id="descriptionBn" value={descriptionBn} onChange={(e) => setDescriptionBn(e.target.value)} rows={3} className="font-bn" />
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive">Active (visible to customers)</Label>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading products...</TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No products found. Create one!</TableCell>
                </TableRow>
              ) : (
                products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.nameEn}</div>
                      <div className="text-sm text-muted-foreground font-bn">{product.nameBn}</div>
                    </TableCell>
                    <TableCell>{product.categoryNameEn || "Uncategorized"}</TableCell>
                    <TableCell>
                      <div>৳{product.priceBdt}</div>
                      <div className="text-xs text-muted-foreground">${product.priceUsd}</div>
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Draft</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the product "{product.nameEn}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
