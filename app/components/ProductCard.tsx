import { Pressable, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../types/inventory";
import { formatCurrency } from "../types/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  categoryName: string;
  onPress: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductCard({
  product,
  categoryName,
  onPress,
}: ProductCardProps) {
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800 active:opacity-70"
    >
      <View className="flex-row gap-3">
        {/* Product Image */}
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="image-outline" size={24} color="#9CA3AF" />
          </View>
        )}

        {/* Product Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2">
              <Text
                className="text-gray-900 dark:text-white font-extrabold text-base"
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                {categoryName}
              </Text>
            </View>
            <Text className="text-gray-900 dark:text-white font-black text-base">
              {formatCurrency(product.sellingPrice)}
            </Text>
          </View>

          {/* Badges */}
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {hasVariants && (
              <View className="bg-purple-100 dark:bg-purple-900/40 rounded px-2 py-0.5">
                <Text className="text-xs font-bold text-purple-800 dark:text-purple-300">
                  {product.variants!.length} Variants
                </Text>
              </View>
            )}
            <View className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Cost: {formatCurrency(product.costPrice)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
