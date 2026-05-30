// ధర్మ — Global drawer state
// Lifted out of HomeScreen so any screen can open the side drawer
// without prop-drilling. App.js mounts <DrawerMenu> at the root and
// reads `visible` from this context.

import React, { createContext, useCallback, useContext, useState } from 'react';

const DrawerContext = createContext({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openDrawer  = useCallback(() => setIsOpen(true),  []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
