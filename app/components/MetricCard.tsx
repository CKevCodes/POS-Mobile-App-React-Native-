import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  iconColor: string;
  iconBg: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MetricCard({
  icon,
  label,
  value,
  iconColor,
  iconBg,
}: MetricCardProps) {
  // Determine font size based on value length
  const valueStr = String(value);
  const isCurrency = valueStr.includes("₱");
  const isLongValue = valueStr.length > 8;

  const valueFontClass = isLongValue
    ? "text-lg" // Smaller for long values like ₱111,475.00
    : "text-2xl"; // Normal for short values

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 w-36">
      <View className="flex-row items-center justify-between">
        <View
          className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center`}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>

      <Text
        className={`text-gray-900 dark:text-white font-black mt-3 ${valueFontClass}`}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-1">
        {label}
      </Text>
    </View>
  );
}
