import { useEffect, useState } from 'react';

export interface CartItem {
    product_id: number;
    variant_id?: number;
    name: string;
    price: number;
    quantity: number;
}

export function useCart(botId: number) {
    const storageKey = `cart_bot_${botId}`;

    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, storageKey]);

    const cartKey = (productId: number, variantId?: number) =>
        variantId ? `${productId}_${variantId}` : `${productId}`;

    const addToCart = (
        product: { id: number; name: string; price: number },
        quantity: number = 1,
        variantId?: number,
    ) => {
        setItems((prev) => {
            const key = cartKey(product.id, variantId);
            const existing = prev.find((item) => cartKey(item.product_id, item.variant_id) === key);
            if (existing) {
                return prev.map((item) =>
                    cartKey(item.product_id, item.variant_id) === key
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                );
            }
            return [...prev, { product_id: product.id, variant_id: variantId, name: product.name, price: product.price, quantity }];
        });
    };

    const removeFromCart = (productId: number, variantId?: number) => {
        const key = cartKey(productId, variantId);
        setItems((prev) => prev.filter((item) => cartKey(item.product_id, item.variant_id) !== key));
    };

    const updateQuantity = (productId: number, quantity: number, variantId?: number) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }
        const key = cartKey(productId, variantId);
        setItems((prev) =>
            prev.map((item) => (cartKey(item.product_id, item.variant_id) === key ? { ...item, quantity } : item)),
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };
}
