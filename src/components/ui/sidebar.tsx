"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar-open";
const SIDEBAR_COOKIE_MAX_AGE = 31536000; // 1 year

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  keyboardShortcut?: string;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  keyboardShortcut = "b",
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof document === 'undefined') return defaultOpen; // Guard for SSR
    if (isMobile) return false; // Sidebar is always closed on mobile by default
    const savedState = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      ?.split("=")[1];
    return savedState ? savedState === "true" : defaultOpen;
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

    const handleKeyDown = (event: KeyboardEvent) => {
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

  // Close sidebar on mobile if it's open
  React.useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const value = React.useMemo(
    () => ({ isOpen, setIsOpen, toggleSidebar }),
    [isOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      "flex h-full w-72 flex-col border-r bg-sidebar text-sidebar-foreground",
      className,
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center border-b px-6", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 px-6 py-8", className)} {...props} />
));
SidebarBody.displayName = "SidebarBody";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center border-t px-6", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      className,
    )}
    {...props}
  />
));
SidebarItem.displayName = "SidebarItem";

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarItem,
};