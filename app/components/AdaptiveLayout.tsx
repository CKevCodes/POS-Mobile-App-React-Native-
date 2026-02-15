import React from "react";
import { View } from "react-native";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface LayoutProps {
  children: React.ReactNode;
}

export const AdaptiveLayout = ({ children }: LayoutProps) => {
  const device = useBreakpoint();

  // Common wrapper for all layouts (e.g., background color)
  return (
    <View className="flex-1 bg-gray-100">
      {device === "mobile" && <MobileLayout>{children}</MobileLayout>}
      {device === "tablet" && <TabletLayout>{children}</TabletLayout>}
      {device === "desktop" && <DesktopLayout>{children}</DesktopLayout>}
    </View>
  );
};

// Simple Platform Shells
const MobileLayout = ({ children }: LayoutProps) => (
  <View className="flex-1">{children}</View>
);

const TabletLayout = ({ children }: LayoutProps) => (
  <View className="flex-1 flex-row">
    {/* Sidebar placeholder for later */}
    <View className="w-20 bg-blue-600 h-full" />
    <View className="flex-1">{children}</View>
  </View>
);

const DesktopLayout = ({ children }: LayoutProps) => (
  <View className="flex-1 flex-row">
    {/* Wider Sidebar for Desktop */}
    <View className="w-64 bg-blue-700 h-full p-4" />
    <View className="flex-1 max-w-7xl mx-auto w-full">{children}</View>
  </View>
);
