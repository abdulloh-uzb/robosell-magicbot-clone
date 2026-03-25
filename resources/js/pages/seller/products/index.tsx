import { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Edit, ImageIcon, Plus, Star, Trash2, Upload, X } from 'lucide-react';

interface Variant {
    id?: number;
    name: string;
    price: string;
    quantity: string;
    sku: string;
}

interface ProductImage {
    id: number;
    url: string;
    path: string;
}

interface Product {
    id: number;
    name: string;
    category_id: number;
    price: number;
    quantity: number;
    description: string;
    is_featured: boolean;
    category?: { name: string };
    variants: Variant[];
    images: ProductImage[];
}

const emptyVariant = (): Variant => ({ name: '', price: '0', quantity: '0', sku: '' });

function VariantManager({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
    const addRow = () => onChange([...variants, emptyVariant()]);
    const remove = (i: number) => onChange(variants.filter((_, idx) => idx !== i));
    const update = (i: number, field: keyof Variant, val: string) => {
        const updated = variants.map((v, idx) => (idx === i ? { ...v, [field]: val } : v));
        onChange(updated);
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label>Variants</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRow} className="gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add variant
                </Button>
            </div>
            {variants.length === 0 && (
                <p className="text-muted-foreground text-xs">No variants. Add variants for different sizes, colors, etc.</p>
            )}
            {variants.map((v, i) => (
                <div key={i} className="bg-muted/30 grid grid-cols-[1fr_80px_70px_auto] gap-2 rounded-lg p-2">
                    <Input
                        placeholder="e.g. Red XL"
                        value={v.name}
                        onChange={(e) => update(i, 'name', e.target.value)}
                        className="h-7 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => update(i, 'price', e.target.value)}
                        className="h-7 text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Qty"
                        value={v.quantity}
                        onChange={(e) => update(i, 'quantity', e.target.value)}
                        className="h-7 text-xs"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => remove(i)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

function ImageUploadPreview({ onFilesChange }: { onFilesChange: (files: File[]) => void }) {
    const [previews, setPreviews] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
        onFilesChange(files);
    };

    return (
        <div className="grid gap-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                    <img key={i} src={src} className="h-16 w-16 rounded-md object-cover" alt="" />
                ))}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="border-muted-foreground/30 text-muted-foreground hover:bg-muted flex h-16 w-16 items-center justify-center rounded-md border-2 border-dashed"
                >
                    <ImageIcon className="h-5 w-5" />
                </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
        </div>
    );
}

export default function Index({ products, categories }: { products: any; categories: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const [createVariants, setCreateVariants] = useState<Variant[]>([]);
    const [editVariants, setEditVariants] = useState<Variant[]>([]);
    const [createImages, setCreateImages] = useState<File[]>([]);
    const [editImages, setEditImages] = useState<File[]>([]);

    const createForm = useForm<{
        name: string;
        category_id: string;
        price: string;
        quantity: string;
        description: string;
        [key: string]: any;
    }>({
        name: '',
        category_id: '',
        price: '0',
        quantity: '0',
        description: '',
    });

    const editForm = useForm<{
        name: string;
        category_id: string;
        price: string;
        quantity: string;
        description: string;
        [key: string]: any;
    }>({
        name: '',
        category_id: '',
        price: '0',
        quantity: '0',
        description: '',
    });

    const buildFormData = (data: typeof createForm.data, variants: Variant[], images: File[]) => {
        const fd = new FormData();
        fd.append('name', data.name);
        fd.append('category_id', data.category_id);
        fd.append('price', data.price);
        fd.append('quantity', data.quantity);
        fd.append('description', data.description);
        variants.forEach((v, i) => {
            if (v.id) fd.append(`variants[${i}][id]`, String(v.id));
            fd.append(`variants[${i}][name]`, v.name);
            fd.append(`variants[${i}][price]`, v.price);
            fd.append(`variants[${i}][quantity]`, v.quantity);
            fd.append(`variants[${i}][sku]`, v.sku);
        });
        images.forEach((img) => fd.append('images[]', img));
        return fd;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = buildFormData(createForm.data, createVariants, createImages);
        router.post('/products', fd, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                setCreateVariants([]);
                setCreateImages([]);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editProduct) return;
        const fd = buildFormData(editForm.data, editVariants, editImages);
        fd.append('_method', 'PUT');
        router.post(`/products/${editProduct.id}`, fd, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditProduct(null);
                editForm.reset();
                setEditVariants([]);
                setEditImages([]);
            },
        });
    };

    const openEditModal = (product: Product) => {
        setEditProduct(product);
        editForm.setData({
            name: product.name,
            category_id: product.category_id.toString(),
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            description: product.description || '',
        });
        setEditVariants(
            product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: String(v.price),
                quantity: String(v.quantity),
                sku: v.sku ?? '',
            })),
        );
        setEditImages([]);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                        <p className="text-muted-foreground mt-2">Manage your product catalog.</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('file', file);
                                router.post('/products/import', fd, {
                                    onSuccess: () => {
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    },
                                    preserveScroll: true,
                                });
                            }}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                            <Upload className="h-4 w-4" /> Import CSV
                        </Button>
                        <Button variant="outline" onClick={() => (window.location.href = '/products/export')} className="gap-2">
                            <Download className="h-4 w-4" /> Export CSV
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Category</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Price</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Qty</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Variants</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Featured</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="h-24 text-center">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product: Product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-2">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            className="h-8 w-8 rounded-md object-cover"
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                                                            <ImageIcon className="text-muted-foreground h-4 w-4" />
                                                        </div>
                                                    )}
                                                    {product.name}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{product.category?.name || 'Uncategorized'}</td>
                                            <td className="p-4 align-middle">${product.price}</td>
                                            <td className="p-4 align-middle">{product.quantity}</td>
                                            <td className="p-4 align-middle">
                                                <span className="text-muted-foreground text-xs">{product.variants?.length ?? 0} variants</span>
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.patch(`/products/${product.id}/toggle-featured`, {}, { preserveScroll: true })}
                                                    title={product.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                                >
                                                    <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                                </Button>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Product Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogDescription>Create a new product for your store.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Wireless Mouse"
                                />
                                {createForm.errors.name && (
                                    <p className="text-destructive text-sm font-medium">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select onValueChange={(val) => createForm.setData('category_id', val)} value={createForm.data.category_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.category_id && (
                                    <p className="text-destructive text-sm font-medium">{createForm.errors.category_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={createForm.data.quantity}
                                        onChange={(e) => createForm.setData('quantity', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                />
                            </div>

                            <ImageUploadPreview onFilesChange={setCreateImages} />

                            <VariantManager variants={createVariants} onChange={setCreateVariants} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Make changes to your product here.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && (
                                    <p className="text-destructive text-sm font-medium">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select onValueChange={(val) => editForm.setData('category_id', val)} value={editForm.data.category_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={editForm.data.quantity}
                                        onChange={(e) => editForm.setData('quantity', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                            </div>

                            {/* Existing images */}
                            {editProduct?.images && editProduct.images.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Existing Images</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {editProduct.images.map((img) => (
                                            <img key={img.id} src={img.url} className="h-16 w-16 rounded-md object-cover" alt="" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <ImageUploadPreview onFilesChange={setEditImages} />

                            <VariantManager variants={editVariants} onChange={setEditVariants} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
