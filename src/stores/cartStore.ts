 import { create } from 'zustand';
 import { persist } from 'zustand/middleware';
 import type { WoodItem, CartItem } from '@/types';
 
 interface CartState {
   items: CartItem[];
   addItem: (woodItem: WoodItem, quantity: number) => void;
   removeItem: (woodItemId: string) => void;
   updateQuantity: (woodItemId: string, quantity: number) => void;
   clearCart: () => void;
   getTotal: () => number;
   getItemCount: () => number;
 }
 
 export const useCartStore = create<CartState>()(
   persist(
     (set, get) => ({
       items: [],
 
       addItem: (woodItem: WoodItem, quantity: number) => {
         set((state) => {
           const existingItem = state.items.find(
             (item) => item.woodItem.id === woodItem.id
           );
 
           if (existingItem) {
             return {
               items: state.items.map((item) =>
                 item.woodItem.id === woodItem.id
                   ? { ...item, quantity: item.quantity + quantity }
                   : item
               ),
             };
           }
 
           return {
             items: [...state.items, { woodItem, quantity }],
           };
         });
       },
 
       removeItem: (woodItemId: string) => {
         set((state) => ({
           items: state.items.filter((item) => item.woodItem.id !== woodItemId),
         }));
       },
 
       updateQuantity: (woodItemId: string, quantity: number) => {
         if (quantity <= 0) {
           get().removeItem(woodItemId);
           return;
         }
 
         set((state) => ({
           items: state.items.map((item) =>
             item.woodItem.id === woodItemId ? { ...item, quantity } : item
           ),
         }));
       },
 
       clearCart: () => {
         set({ items: [] });
       },
 
       getTotal: () => {
         return get().items.reduce(
           (total, item) => total + item.woodItem.price * item.quantity,
           0
         );
       },
 
       getItemCount: () => {
         return get().items.reduce((count, item) => count + item.quantity, 0);
       },
     }),
     {
       name: 'cart-storage',
     }
   )
 );