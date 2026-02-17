import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, TouchableOpacity, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "expo-router";

interface LayoutProps {
  children: React.ReactNode;
}

export const AdaptiveLayout = ({ children }: LayoutProps) => {
  const device = useBreakpoint();

  // Common wrapper for all layouts (e.g., background color)
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {device === "mobile" && <MobileLayout>{children}</MobileLayout>}
      {device === "tablet" && <TabletLayout>{children}</TabletLayout>}
      {device === "desktop" && <DesktopLayout>{children}</DesktopLayout>}
    </View>
  );
};

// Simple Platform Shells
const MobileLayout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const iconColor = colorScheme === "dark" ? "#fff" : "#111";

  return (
    <View className="flex-1">
      {/* Content wrapper with padding to avoid hamburger overlap */}
      <View className="flex-1" style={{ paddingTop: insets.top + 60 }}>
        {children}
      </View>

      {/* Hamburger Button - Fixed at top with safe area */}
      <View
        className="absolute top-0 left-0 right-0 z-50"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row justify-between items-center px-4 py-3 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800">
          <Pressable
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white dark:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Ionicons
              name="menu"
              size={24}
              color={isDark ? "#e5e7eb" : "#1f2937"}
            />
          </Pressable>

          {/* Spacer for future items like title or actions */}
          <View className="flex-1" />
        </View>
      </View>

      {/* Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <View
          className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl border-r border-gray-200 dark:border-gray-800"
          style={{ paddingTop: insets.top }}
        >
          {/* Sidebar Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <View>{/* You can add a logo or title here */}</View>
            <Pressable
              onPress={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg bg-white dark:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#e5e7eb" : "#1f2937"}
              />
            </Pressable>
          </View>

          {/* Sidebar Content */}

          <View className="flex-1 p-4">
            <Pressable
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
              onPress={() => {
                router.push("/pages/ProductScreen");
                setIsSidebarOpen(false);
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={iconColor}
                  className="mr-2 dark:text-white"
                />
                <Text className="text-gray-900 dark:text-white font-medium">
                  Products
                </Text>
              </View>
            </Pressable>

            {/* Order History */}
            <Pressable
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
              onPress={() => {
                router.push("/pages/OrderHistoryScreen");
                setIsSidebarOpen(false);
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={iconColor}
                  className="mr-2 dark:text-white"
                />
                <Text className="text-gray-900 dark:text-white font-medium">
                  Order History
                </Text>
              </View>
            </Pressable>

            {/* Analytics */}
            <Pressable
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
              onPress={() => {
                router.push("/pages/AnalyticsScreen");
                setIsSidebarOpen(false);
              }}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={20}
                  color={iconColor}
                  className="mr-2 dark:text-white"
                />
                <Text className="text-gray-900 dark:text-white font-medium">
                  Analytics
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Sidebar Footer with Theme Toggle */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-800">
            <ThemeToggle />
          </View>
        </View>
      )}
    </View>
  );
};

const TabletLayout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#fff" : "#111";

  return (
    <View className="flex-1 flex-row">
      <View className="w-52 bg-white dark:bg-gray-900 h-full p-4 justify-between border-r border-gray-200 dark:border-gray-800">
        <View className="flex-1 mt-10">
          {/* Products */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
            onPress={() => router.push("/pages/ProductScreen")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="cart-outline"
                size={20}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium">
                Products
              </Text>
            </View>
          </Pressable>

          {/* Order History */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
            onPress={() => router.push("/pages/OrderHistoryScreen")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="time-outline"
                size={20}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium">
                Order History
              </Text>
            </View>
          </Pressable>

          {/* Analytics */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3"
            onPress={() => router.push("/pages/AnalyticsScreen")}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium">
                Analytics
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <ThemeToggle />
        </View>
      </View>

      <View className="flex-1 bg-gray-50 dark:bg-gray-800">{children}</View>
    </View>
  );
};

const DesktopLayout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#fff" : "#111";

  return (
    <View className="flex-1 flex-row">
      <View className="w-64 bg-white dark:bg-gray-900 h-full p-4 justify-between border-r border-gray-200 dark:border-gray-800">
        <View className="flex-1 mt-10">
          {/* Products */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200"
            onPress={() => router.push("/pages/ProductScreen")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="cart-outline"
                size={22}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium text-lg">
                Products
              </Text>
            </View>
          </Pressable>

          {/* Order History */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200"
            onPress={() => router.push("/pages/OrderHistoryScreen")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="time-outline"
                size={22}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium text-lg">
                Order History
              </Text>
            </View>
          </Pressable>

          {/* Analytics */}
          <Pressable
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200"
            onPress={() => router.push("/pages/AnalyticsScreen")}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="chart-bar"
                size={22}
                color={iconColor}
                className="mr-3"
              />
              <Text className="text-gray-900 dark:text-white font-medium text-lg">
                Analytics
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <ThemeToggle />
        </View>
      </View>

      <View className="flex-1 bg-gray-50 dark:bg-gray-800">
        <View className="max-w-7xl mx-auto w-full h-full">{children}</View>
      </View>
    </View>
  );
};
