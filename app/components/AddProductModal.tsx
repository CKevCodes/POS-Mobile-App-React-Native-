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
import type { Product, Category, Variant } from "../types/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  categories: Category[];
  editProduct?: Product | null;
}

interface VariantInput {
  id: string;
  name: string;
  additionalPrice: string;
  quantityOnHand: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddProductModal({
  visible,
  onClose,
  onSave,
  categories,
  editProduct,
}: AddProductModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ─── State ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantityOnHand, setQuantityOnHand] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description || "");
      setImage(editProduct.image || "");
      setCategoryId(editProduct.categoryId);
      setCostPrice(editProduct.costPrice.toString());
      setSellingPrice(editProduct.sellingPrice.toString());
      setQuantityOnHand(editProduct.quantityOnHand.toString());
      setLowStockThreshold(editProduct.lowStockThreshold.toString());

      if (editProduct.variants && editProduct.variants.length > 0) {
        setShowVariants(true);
        setVariants(
          editProduct.variants.map((v) => ({
            id: v.id,
            name: v.name,
            additionalPrice: v.additionalPrice.toString(),
            quantityOnHand: v.quantityOnHand.toString(),
          })),
        );
      }
    } else {
      resetForm();
    }
  }, [editProduct, visible]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage("");
    setCategoryId("");
    setCostPrice("");
    setSellingPrice("");
    setQuantityOnHand("");
    setLowStockThreshold("");
    setVariants([]);
    setShowVariants(false);
  };

  const handleSave = () => {
    if (
      !name ||
      !categoryId ||
      !costPrice ||
      !sellingPrice ||
      !quantityOnHand ||
      !lowStockThreshold
    ) {
      return;
    }

    const productData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      name,
      description: description || undefined,
      image: image || undefined,
      categoryId,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      quantityOnHand: parseInt(quantityOnHand),
      lowStockThreshold: parseInt(lowStockThreshold),
      isArchived: false,
      variants:
        showVariants && variants.length > 0
          ? variants.map((v) => ({
              id: v.id || `var-${Date.now()}-${Math.random()}`,
              name: v.name,
              additionalPrice: parseFloat(v.additionalPrice),
              quantityOnHand: parseInt(v.quantityOnHand),
            }))
          : undefined,
    };

    onSave(productData);
    resetForm();
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        name: "",
        additionalPrice: "0",
        quantityOnHand: "0",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantInput,
    value: string,
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const parentCategories = categories.filter((c) => !c.parentId);

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
              <Text className="text-gray-900 dark:text-white font-black text-xl">
                {editProduct ? "Edit Product" : "Add Product"}
              </Text>
              <Pressable onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#FFFFFF" : "#000000"}
                />
              </Pressable>
            </View>

            {/* Form */}
            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Product Name */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Product Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Wagyu Burger"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional product description"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Category *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {parentCategories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      className={`mr-2 px-4 py-2 rounded-xl ${
                        categoryId === cat.id
                          ? "bg-blue-600"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Text
                        className={`font-bold text-sm ${
                          categoryId === cat.id
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Pricing Row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                    Cost Price *
                  </Text>
                  <TextInput
                    value={costPrice}
                    onChangeText={setCostPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                    Selling Price *
                  </Text>
                  <TextInput
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  />
                </View>
              </View>

              {/* Stock Row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                    Quantity *
                  </Text>
                  <TextInput
                    value={quantityOnHand}
                    onChangeText={setQuantityOnHand}
                    placeholder="0"
                    keyboardType="number-pad"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                    Low Stock Alert *
                  </Text>
                  <TextInput
                    value={lowStockThreshold}
                    onChangeText={setLowStockThreshold}
                    placeholder="0"
                    keyboardType="number-pad"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  />
                </View>
              </View>

              {/* Image URL */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">
                  Image URL
                </Text>
                <TextInput
                  value={image}
                  onChangeText={setImage}
                  placeholder="https://..."
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                  autoCapitalize="none"
                />
              </View>

              {/* Variants Section */}
              <View className="mb-4">
                <Pressable
                  onPress={() => setShowVariants(!showVariants)}
                  className="flex-row items-center justify-between mb-3"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                    Product Variants
                  </Text>
                  <Ionicons
                    name={showVariants ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </Pressable>

                {showVariants && (
                  <View>
                    {variants.map((variant, index) => (
                      <View
                        key={variant.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-gray-600 dark:text-gray-400 font-bold text-xs">
                            Variant {index + 1}
                          </Text>
                          <Pressable onPress={() => removeVariant(index)}>
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#EF4444"
                            />
                          </Pressable>
                        </View>

                        <TextInput
                          value={variant.name}
                          onChangeText={(v) => updateVariant(index, "name", v)}
                          placeholder="Variant name (e.g., Small)"
                          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                          className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-900 dark:text-white mb-2 text-sm"
                        />

                        <View className="flex-row gap-2">
                          <View className="flex-1">
                            <TextInput
                              value={variant.additionalPrice}
                              onChangeText={(v) =>
                                updateVariant(index, "additionalPrice", v)
                              }
                              placeholder="Price +/-"
                              keyboardType="decimal-pad"
                              placeholderTextColor={
                                isDark ? "#6B7280" : "#9CA3AF"
                              }
                              className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                            />
                          </View>
                          <View className="flex-1">
                            <TextInput
                              value={variant.quantityOnHand}
                              onChangeText={(v) =>
                                updateVariant(index, "quantityOnHand", v)
                              }
                              placeholder="Quantity"
                              keyboardType="number-pad"
                              placeholderTextColor={
                                isDark ? "#6B7280" : "#9CA3AF"
                              }
                              className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm"
                            />
                          </View>
                        </View>
                      </View>
                    ))}

                    <Pressable
                      onPress={addVariant}
                      className="bg-gray-100 dark:bg-gray-800 rounded-xl py-3 items-center flex-row justify-center gap-2"
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={isDark ? "#60A5FA" : "#2563EB"}
                      />
                      <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        Add Variant
                      </Text>
                    </Pressable>
                  </View>
                )}
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
                onPress={handleSave}
                className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold">
                  {editProduct ? "Save Changes" : "Add Product"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
