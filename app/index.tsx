import { Text, View } from "react-native";
import { useBreakpoint } from "./hooks/useBreakpoint";

export default function Dashboard() {
  const device = useBreakpoint();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 items-center">
        <Text className="text-2xl font-bold text-gray-800">POS Dashboard</Text>
        <Text className="text-gray-500 mt-2 capitalize">
          Current View: {device}
        </Text>

        <View className="mt-6 h-32 w-64 bg-gray-50 border-dashed border-2 border-gray-300 rounded-lg items-center justify-center">
          <Text className="text-gray-400">Phase 2: Product Grid Here</Text>
        </View>
      </View>
    </View>
  );
}
