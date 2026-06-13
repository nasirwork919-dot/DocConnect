"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar-open";
const SIDEBAR_COOKIE_MAX_AGE = 31536000; // 1 year in seconds

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  keyboardShortcut?: string;
}

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function Sidebar({
  children,
  defaultOpen = true,
  keyboardShortcut = "b",
  className,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof document === 'undefined') return defaultOpen; // Guard for SSR
    if (isMobile) return false; // Sidebar is always closed on mobile by default
    const savedState = document.cookie // Access document after checking typeof
      .split("; ")
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      ?.split("=")[1];
    return savedState ? JSON.parse(savedState) : defaultOpen;
  });

  const toggleSidebar = React.useCallback(() => {
    setIsOpen((prev) => {
      const openState = !prev;
      // This sets the cookie to keep the sidebar state.
      if (typeof document !== 'undefined') { // Guard for SSR
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
      return openState;
    });
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR

    const handleKeyDown = (event: KeyboardEvent) => { // Explicitly use global KeyboardEvent
      if (
        event.key === keyboardShortcut &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, keyboardShortcut]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, setIsOpen }}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-full flex-col overflow-y-auto border-r bg-sidebar transition-all duration-300",
          isOpen ? "w-64" : "w-0 md:w-16",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      Toggle
    </button>
  );
}