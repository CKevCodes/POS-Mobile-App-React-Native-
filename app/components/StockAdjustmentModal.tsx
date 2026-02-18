import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import type { Product, Variant, MovementType } from "../types/inventory";
import { formatCurrency } from "../types/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjust: (
    productId: string,
    variantId: string | undefined,
    quantityChange: number,
    type: MovementType,
    notes?: string,
  ) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOVEMENT_TYPES: {
  value: MovementType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "STOCK_IN", label: "Stock In", icon: "arrow-down-circle" },
  { value: "ADJUSTMENT", label: "Adjustment", icon: "swap-horizontal" },
  { value: "WASTAGE", label: "Wastage", icon: "trash" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function StockAdjustmentModal({
  visible,
  onClose,
  product,
  onAdjust,
}: StockAdjustmentModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ─── State ──────────────────────────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [movementType, setMovementType] = useState<MovementType>("STOCK_IN");
  const [quantityChange, setQuantityChange] = useState("");
  const [notes, setNotes] = useState("");

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      setSelectedVariant(null);
      setMovementType("STOCK_IN");
      setQuantityChange("");
      setNotes("");
    }
  }, [visible, product]);

  // ─── Computed Values ────────────────────────────────────────────────────────

  const currentStock = selectedVariant
    ? selectedVariant.quantityOnHand
    : product?.quantityOnHand || 0;

  const changeValue = parseInt(quantityChange) || 0;

  // Calculate new quantity based on movement type
  const getNewQuantity = () => {
    if (movementType === "STOCK_IN") {
      return currentStock + Math.abs(changeValue);
    } else {
      // ADJUSTMENT and WASTAGE reduce stock
      return currentStock - Math.abs(changeValue);
    }
  };

  const newQuantity = getNewQuantity();
  const isValid = changeValue !== 0 && newQuantity >= 0;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAdjust = () => {
    if (!product || !isValid) return;

    const finalChange =
      movementType === "STOCK_IN"
        ? Math.abs(changeValue)
        : -Math.abs(changeValue);

    onAdjust(
      product.id,
      selectedVariant?.id,
      finalChange,
      movementType,
      notes || undefined,
    );

    onClose();
  };

  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable onPress={onClose} className="flex-1 bg-black/50">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mt-auto bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-1 pr-4">
                <Text className="text-gray-900 dark:text-white font-black text-xl">
                  Adjust Stock
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

            {/* Content */}
            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Current Stock Info */}
              <View className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 mb-4">
                <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
                  CURRENT STOCK
                </Text>
                <Text className="text-blue-900 dark:text-blue-100 font-black text-3xl">
                  {currentStock}
                </Text>
                {selectedVariant && (
                  <Text className="text-blue-700 dark:text-blue-300 text-sm font-semibold mt-1">
                    {selectedVariant.name}
                  </Text>
                )}
              </View>

              {/* Variant Selection */}
              {hasVariants && (
                <View className="mb-4">
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                    Select Variant
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Pressable
                      onPress={() => setSelectedVariant(null)}
                      className={`mr-2 px-4 py-2 rounded-xl ${
                        !selectedVariant
                          ? "bg-blue-600"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Text
                        className={`font-bold text-sm ${
                          !selectedVariant
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Base Product ({product.quantityOnHand})
                      </Text>
                    </Pressable>
                    {product.variants!.map((variant) => (
                      <Pressable
                        key={variant.id}
                        onPress={() => setSelectedVariant(variant)}
                        className={`mr-2 px-4 py-2 rounded-xl ${
                          selectedVariant?.id === variant.id
                            ? "bg-blue-600"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <Text
                          className={`font-bold text-sm ${
                            selectedVariant?.id === variant.id
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {variant.name} ({variant.quantityOnHand})
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Movement Type */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Movement Type
                </Text>
                <View className="flex-row gap-2">
                  {MOVEMENT_TYPES.map((type) => (
                    <Pressable
                      key={type.value}
                      onPress={() => setMovementType(type.value)}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
                        movementType === type.value
                          ? "bg-blue-600"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Ionicons
                        name={type.icon}
                        size={16}
                        color={
                          movementType === type.value
                            ? "#FFFFFF"
                            : isDark
                              ? "#9CA3AF"
                              : "#6B7280"
                        }
                      />
                      <Text
                        className={`font-bold text-xs ${
                          movementType === type.value
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Quantity Change */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Quantity{" "}
                  {movementType === "STOCK_IN" ? "to Add" : "to Remove"}
                </Text>
                <TextInput
                  value={quantityChange}
                  onChangeText={setQuantityChange}
                  placeholder="Enter quantity"
                  keyboardType="number-pad"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold text-lg"
                />
              </View>

              {/* Preview New Quantity */}
              {changeValue !== 0 && (
                <View
                  className={`rounded-2xl p-4 mb-4 ${
                    newQuantity < 0
                      ? "bg-red-50 dark:bg-red-950/30"
                      : "bg-green-50 dark:bg-green-950/30"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text
                        className={`text-xs font-bold mb-1 ${
                          newQuantity < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        NEW QUANTITY
                      </Text>
                      <Text
                        className={`font-black text-2xl ${
                          newQuantity < 0
                            ? "text-red-900 dark:text-red-100"
                            : "text-green-900 dark:text-green-100"
                        }`}
                      >
                        {newQuantity}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-xs font-bold ${
                          newQuantity < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {movementType === "STOCK_IN" ? "+" : "-"}
                        {Math.abs(changeValue)}
                      </Text>
                      {newQuantity < 0 && (
                        <Text className="text-red-600 dark:text-red-400 text-xs font-bold mt-1">
                          ⚠️ Insufficient stock
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Notes */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Notes (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about this adjustment"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-bold">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAdjust}
                disabled={!isValid}
                className={`flex-1 rounded-xl py-3 items-center ${
                  isValid ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <Text
                  className={`font-bold ${isValid ? "text-white" : "text-gray-500"}`}
                >
                  Adjust Stock
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
