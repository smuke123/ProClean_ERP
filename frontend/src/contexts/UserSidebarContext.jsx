import { createContext, useContext, useState } from 'react';

const UserSidebarContext = createContext();

export const useUserSidebar = () => {
  const context = useContext(UserSidebarContext);
  if (!context) {
    throw new Error('useUserSidebar debe ser usado dentro de un UserSidebarProvider');
  }
  return context;
};

export const UserSidebarProvider = ({ children }) => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);

  const openUserSidebar = () => setIsUserSidebarOpen(true);
  const closeUserSidebar = () => setIsUserSidebarOpen(false);

  const value = {
    isUserSidebarOpen,
    openUserSidebar,
    closeUserSidebar
  };

  return (
    <UserSidebarContext.Provider value={value}>
      {children}
    </UserSidebarContext.Provider>
  );
};

