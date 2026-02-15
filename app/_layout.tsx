import { Stack } from "expo-router";
import { AdaptiveLayout } from "./components/AdaptiveLayout";
import "./global.css";

export default function RootLayout() {
  return (
    <AdaptiveLayout>
      <Stack
        screenOptions={{
          headerShown: false, // POS apps usually handle their own headers
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </AdaptiveLayout>
  );
}
