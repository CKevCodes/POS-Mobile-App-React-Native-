import { Modal, View, Text, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import type { Product, StockMovement } from "../types/inventory";
import {
  MOVEMENT_TYPE_LABEL,
  MOVEMENT_TYPE_COLOR,
  formatDateTime,
} from "../types/inventory";
import { StatusBadge } from "./StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  movements: StockMovement[];
}

// ─── Movement Row Component ───────────────────────────────────────────────────

function MovementRow({ movement }: { movement: StockMovement }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const config = MOVEMENT_TYPE_COLOR[movement.type];
  const isIncrease = movement.quantityChange > 0;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800">
      {/* Header Row */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <View className={`rounded px-2 py-0.5 self-start ${config.bg}`}>
            <Text className={`text-xs font-bold ${config.text}`}>
              {MOVEMENT_TYPE_LABEL[movement.type]}
            </Text>
          </View>
          {movement.variantId && (
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1.5">
              Variant ID: {movement.variantId}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text
            className={`font-black text-lg ${
              isIncrease
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isIncrease ? "+" : ""}
            {movement.quantityChange}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
            {formatDateTime(movement.createdAt)}
          </Text>
        </View>
      </View>

      {/* Stock Change Row */}
      <View className="flex-row items-center gap-2 mt-2">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
            Before
          </Text>
          <Text className="text-gray-900 dark:text-white font-bold text-base">
            {movement.previousQuantity}
          </Text>
        </View>

        <Ionicons
          name="arrow-forward"
          size={16}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />

        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
            After
          </Text>
          <Text className="text-gray-900 dark:text-white font-bold text-base">
            {movement.newQuantity}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {movement.notes && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            {movement.notes}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StockHistoryModal({
  visible,
  onClose,
  product,
  movements,
}: StockHistoryModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!product) return null;

  // Filter movements for this product
  const productMovements = movements
    .filter((m) => m.productId === product.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Calculate movement stats
  const totalIn = productMovements
    .filter((m) => m.quantityChange > 0)
    .reduce((sum, m) => sum + m.quantityChange, 0);

  const totalOut = productMovements
    .filter((m) => m.quantityChange < 0)
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable onPress={onClose} className="flex-1 bg-black/50">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="mt-auto bg-gray-50 dark:bg-gray-800 rounded-t-3xl max-h-[90%]"
        >
          {/* Header */}
          <View className="bg-white dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-4">
                <Text className="text-gray-900 dark:text-white font-black text-xl">
                  Stock History
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                  {product.name}
                </Text>
              </View>
              <Pressable onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#FFFFFF" : "#000000"}
                />
              </Pressable>
            </View>

            {/* Summary Stats */}
            <View className="flex-row gap-2">
              <View className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-xl p-3">
                <Text className="text-green-600 dark:text-green-400 text-xs font-bold mb-1">
                  TOTAL IN
                </Text>
                <Text className="text-green-900 dark:text-green-100 font-black text-xl">
                  +{totalIn}
                </Text>
              </View>

              <View className="flex-1 bg-red-50 dark:bg-red-950/30 rounded-xl p-3">
                <Text className="text-red-600 dark:text-red-400 text-xs font-bold mb-1">
                  TOTAL OUT
                </Text>
                <Text className="text-red-900 dark:text-red-100 font-black text-xl">
                  -{totalOut}
                </Text>
              </View>

              <View className="flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
                  CURRENT
                </Text>
                <Text className="text-blue-900 dark:text-blue-100 font-black text-xl">
                  {product.quantityOnHand}
                </Text>
              </View>
            </View>
          </View>

          {/* Movement List */}
          <FlatList
            data={productMovements}
            keyExtractor={(m) => m.id}
            contentContainerClassName="p-4"
            renderItem={({ item }) => <MovementRow movement={item} />}
            ListEmptyComponent={
              <View className="items-center pt-16">
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={isDark ? "#4B5563" : "#D1D5DB"}
                />
                <Text className="text-gray-700 dark:text-gray-300 font-extrabold text-base mt-4">
                  No stock movements yet
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1 text-center">
                  Stock changes will appear here
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
