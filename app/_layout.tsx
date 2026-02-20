import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdaptiveLayout } from "./components/AdaptiveLayout";
import { runMigrations } from "./data/Database";
import "./global.css";

// ─── DB Bootstrap ─────────────────────────────────────────────────────────────
// Runs all pending migrations exactly once before any screen mounts.
// Until migrations finish, we show a small splash so screens never query
// tables that don't exist yet.

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    runMigrations()
      .then(() => {
        console.log("[DB] All migrations applied — database is ready.");
        setDbReady(true);
      })
      .catch((e) => {
        console.error("[DB] Migration failed:", e);
        setDbError(String(e?.message ?? e));
      });
  }, []);

  // ── Loading splash ────────────────────────────────────────────────────────
  if (!dbReady && !dbError) {
    return (
      <SafeAreaProvider>
        <View
          className="items-center justify-center flex-1 bg-white dark:bg-gray-950"
        >
          <ActivityIndicator
            size="large"
            color={isDark ? "#60A5FA" : "#2563EB"}
          />
          <Text className="mt-4 text-sm text-gray-400 dark:text-gray-500">
            Setting up database…
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // ── Migration error screen ────────────────────────────────────────────────
  if (dbError) {
    return (
      <SafeAreaProvider>
        <View className="items-center justify-center flex-1 px-8 bg-white dark:bg-gray-950">
          <Text className="mb-2 text-lg font-black text-red-600">
            Database Error
          </Text>
          <Text className="text-sm text-center text-gray-500">{dbError}</Text>
          <Text className="mt-4 text-xs text-center text-gray-400">
            Try restarting the app. If the problem persists, clear the app data.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // ── Normal app ────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <AdaptiveLayout>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="Products" />
          <Stack.Screen name="OrderHistory" />
        </Stack>
      </AdaptiveLayout>
    </SafeAreaProvider>
  );
}