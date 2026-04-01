import { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Edit, ImageIcon, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/categories' },
];

interface Category {
    id: number;
    name: string;
    image: string | null;
}

export default function Index({ categories }: { categories: { data: Category[] } }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const createImageRef = useRef<HTMLInputElement>(null);
    const editImageRef = useRef<HTMLInputElement>(null);

    const createForm = useForm({
        name: '',
        image: null as File | null,
    });

    const editForm = useForm({
        name: '',
        image: null as File | null,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/categories', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreatePreview(null);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory) return;
        editForm.post(`/categories/${editCategory.id}`, {
            forceFormData: true,
            data: { ...editForm.data, _method: 'PUT' },
            onSuccess: () => {
                setIsEditOpen(false);
                setEditCategory(null);
                setEditPreview(null);
                editForm.reset();
            },
        });
    };

    const openEditModal = (category: Category) => {
        setEditCategory(category);
        setEditPreview(category.image ? `/storage/${category.image}` : null);
        editForm.setData({ name: category.name, image: null });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/categories/${id}`);
        }
    };

    const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        createForm.setData('image', file);
        setCreatePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        editForm.setData('image', file);
        setEditPreview(file ? URL.createObjectURL(file) : editCategory?.image ? `/storage/${editCategory.image}` : null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                        <p className="text-muted-foreground mt-2">
                            Manage your product categories.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Image</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="h-24 text-center">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                {category.image ? (
                                                    <img
                                                        src={`/storage/${category.image}`}
                                                        alt={category.name}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                                            {category.name.substring(0, 2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle font-medium">{category.name}</td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
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

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for your products.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Electronics"
                                />
                                {createForm.errors.name && (
                                    <p className="text-sm font-medium text-destructive">{createForm.errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Image (optional)</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => createImageRef.current?.click()}
                                >
                                    {createPreview ? (
                                        <img src={createPreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={createImageRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCreateImageChange}
                                />
                                {createForm.errors.image && (
                                    <p className="text-sm font-medium text-destructive">{createForm.errors.image}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Make changes to your category here.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm font-medium text-destructive">{editForm.errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Image (optional)</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => editImageRef.current?.click()}
                                >
                                    {editPreview ? (
                                        <img src={editPreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={editImageRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleEditImageChange}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
