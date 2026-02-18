import { Modal, View, Text, Pressable, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import type { Product } from "../types/inventory";
import { formatCurrency, formatDate } from "../types/inventory";
import { StockBadge, getStockStatus } from "./StockBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  categoryName: string;
  onEdit: () => void;
  onAdjustStock: () => void;
  onViewHistory: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductDetailModal({
  visible,
  onClose,
  product,
  categoryName,
  onEdit,
  onAdjustStock,
  onViewHistory,
}: ProductDetailModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!product) return null;

  const stockStatus = getStockStatus(
    product.quantityOnHand,
    product.lowStockThreshold,
  );
  const profitMargin = product.sellingPrice - product.costPrice;
  const profitPercentage = ((profitMargin / product.costPrice) * 100).toFixed(
    1,
  );
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <Pressable onPress={onClose} className="flex-1">
          {/* Tap outside to close */}
        </Pressable>

        <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white font-black text-xl">
              Product Details
            </Text>
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
            {/* Product Image & Name */}
            <View className="items-center mb-6">
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                </View>
              )}
              <Text className="text-gray-900 dark:text-white font-black text-2xl text-center mb-2">
                {product.name}
              </Text>
              {product.description && (
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  {product.description}
                </Text>
              )}
            </View>

            {/* Stock Status */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                  Stock Status
                </Text>
                <StockBadge
                  status={stockStatus}
                  quantity={product.quantityOnHand}
                />
              </View>
              <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  Low stock threshold: {product.lowStockThreshold}
                </Text>
              </View>
            </View>

            {/* Pricing Info */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-3">
                Pricing
              </Text>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1 bg-red-50 dark:bg-red-950/30 rounded-xl p-3">
                  <Text className="text-red-600 dark:text-red-400 text-xs font-bold mb-1">
                    COST PRICE
                  </Text>
                  <Text className="text-red-900 dark:text-red-100 font-black text-xl">
                    {formatCurrency(product.costPrice)}
                  </Text>
                </View>
                <View className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-xl p-3">
                  <Text className="text-green-600 dark:text-green-400 text-xs font-bold mb-1">
                    SELLING PRICE
                  </Text>
                  <Text className="text-green-900 dark:text-green-100 font-black text-xl">
                    {formatCurrency(product.sellingPrice)}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
                  PROFIT MARGIN
                </Text>
                <Text className="text-blue-900 dark:text-blue-100 font-black text-xl">
                  {formatCurrency(profitMargin)} ({profitPercentage}%)
                </Text>
              </View>
            </View>

            {/* Variants */}
            {hasVariants && (
              <View className="mb-6">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-3">
                  Variants
                </Text>
                {product.variants!.map((variant) => (
                  <View
                    key={variant.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-900 dark:text-white font-bold text-base">
                          {variant.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          {formatCurrency(
                            product.sellingPrice + variant.additionalPrice,
                          )}
                          {variant.additionalPrice !== 0 && (
                            <Text className="text-gray-400">
                              {" "}
                              ({variant.additionalPrice > 0 ? "+" : ""}
                              {formatCurrency(variant.additionalPrice)})
                            </Text>
                          )}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-900 dark:text-white font-black text-lg">
                          {variant.quantityOnHand}
                        </Text>
                        <Text className="text-gray-400 dark:text-gray-500 text-xs">
                          in stock
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Category & Metadata */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-3">
                Information
              </Text>
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="pricetag-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-1">
                    Category
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-bold text-sm">
                    {categoryName}
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="barcode-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-1">
                    Product ID
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-bold text-sm">
                    {product.id}
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-1">
                    Created
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-bold text-sm">
                    {formatDate(product.createdAt)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-1">
                    Last Updated
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-bold text-sm">
                    {formatDate(product.updatedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row gap-2 mb-2">
              <Pressable
                onPress={() => {
                  onClose();
                  setTimeout(onEdit, 300);
                }}
                className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm">Edit</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onClose();
                  setTimeout(onAdjustStock, 300);
                }}
                className="flex-1 bg-green-600 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm">
                  Adjust Stock
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                onClose();
                setTimeout(onViewHistory, 300);
              }}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                View Stock History
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
