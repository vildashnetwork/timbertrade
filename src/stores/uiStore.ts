 import { create } from 'zustand';
 
 interface UIState {
   sidebarOpen: boolean;
   lowBandwidthMode: boolean;
   toggleSidebar: () => void;
   setSidebarOpen: (open: boolean) => void;
   toggleLowBandwidthMode: () => void;
   setLowBandwidthMode: (enabled: boolean) => void;
 }
 
 export const useUIStore = create<UIState>((set) => ({
   sidebarOpen: false,
   lowBandwidthMode: false,
 
   toggleSidebar: () => {
     set((state) => ({ sidebarOpen: !state.sidebarOpen }));
   },
 
   setSidebarOpen: (open: boolean) => {
     set({ sidebarOpen: open });
   },
 
   toggleLowBandwidthMode: () => {
     set((state) => ({ lowBandwidthMode: !state.lowBandwidthMode }));
   },
 
   setLowBandwidthMode: (enabled: boolean) => {
     set({ lowBandwidthMode: enabled });
   },
 }));