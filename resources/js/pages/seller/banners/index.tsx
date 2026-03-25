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
    { title: 'Banners', href: '/banners' },
];

interface Banner {
    id: number;
    image: string;
    title: string | null;
    link: string | null;
    sort_order: number;
}

export default function Index({ banners }: { banners: Banner[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const createImageRef = useRef<HTMLInputElement>(null);
    const editImageRef = useRef<HTMLInputElement>(null);

    const createForm = useForm({
        image: null as File | null,
        title: '',
        link: '',
        sort_order: 0,
    });

    const editForm = useForm({
        image: null as File | null,
        title: '',
        link: '',
        sort_order: 0,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/banners', {
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
        if (!editBanner) return;
        editForm.post(`/banners/${editBanner.id}`, {
            forceFormData: true,
            data: { ...editForm.data, _method: 'PUT' },
            onSuccess: () => {
                setIsEditOpen(false);
                setEditBanner(null);
                setEditPreview(null);
                editForm.reset();
            },
        });
    };

    const openEditModal = (banner: Banner) => {
        setEditBanner(banner);
        setEditPreview(`/storage/${banner.image}`);
        editForm.setData({
            image: null,
            title: banner.title ?? '',
            link: banner.link ?? '',
            sort_order: banner.sort_order,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            router.delete(`/banners/${id}`);
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
        setEditPreview(file ? URL.createObjectURL(file) : editBanner ? `/storage/${editBanner.image}` : null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Banners" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
                        <p className="text-muted-foreground mt-2">
                            Manage the banner slider shown on your store homepage.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Banner
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Image</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Title</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Link</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Order</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No banners yet. Add one to display a slider on your store.
                                        </td>
                                    </tr>
                                ) : (
                                    banners.map((banner) => (
                                        <tr key={banner.id} className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <img
                                                    src={`/storage/${banner.image}`}
                                                    alt={banner.title ?? 'Banner'}
                                                    className="h-14 w-24 rounded-md object-cover"
                                                />
                                            </td>
                                            <td className="p-4 align-middle font-medium">{banner.title ?? '—'}</td>
                                            <td className="p-4 align-middle text-muted-foreground truncate max-w-xs">{banner.link ?? '—'}</td>
                                            <td className="p-4 align-middle">{banner.sort_order}</td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(banner)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(banner.id)}
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
                        <DialogTitle>Add Banner</DialogTitle>
                        <DialogDescription>Upload a banner image for your store slider.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Image</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => createImageRef.current?.click()}
                                >
                                    {createPreview ? (
                                        <img src={createPreview} alt="Preview" className="h-32 w-full object-cover rounded-md" />
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
                            <div className="grid gap-2">
                                <Label htmlFor="create-title">Title (optional)</Label>
                                <Input
                                    id="create-title"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. Summer Sale"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-link">Link (optional)</Label>
                                <Input
                                    id="create-link"
                                    value={createForm.data.link}
                                    onChange={(e) => createForm.setData('link', e.target.value)}
                                    placeholder="e.g. /store/category/1"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-order">Sort Order</Label>
                                <Input
                                    id="create-order"
                                    type="number"
                                    value={createForm.data.sort_order}
                                    onChange={(e) => createForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                />
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
                        <DialogTitle>Edit Banner</DialogTitle>
                        <DialogDescription>Update banner details. Leave image empty to keep the current one.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Image</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => editImageRef.current?.click()}
                                >
                                    {editPreview ? (
                                        <img src={editPreview} alt="Preview" className="h-32 w-full object-cover rounded-md" />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to change image</p>
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
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title (optional)</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-link">Link (optional)</Label>
                                <Input
                                    id="edit-link"
                                    value={editForm.data.link}
                                    onChange={(e) => editForm.setData('link', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-order">Sort Order</Label>
                                <Input
                                    id="edit-order"
                                    type="number"
                                    value={editForm.data.sort_order}
                                    onChange={(e) => editForm.setData('sort_order', parseInt(e.target.value) || 0)}
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
