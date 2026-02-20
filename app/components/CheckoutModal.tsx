import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ordersRepo } from "../data/Orders";
import type { CreateOrder, CreateOrderItem, PaymentMethod, OrderType } from "../types/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  variantId: number;
  name: string;
  variantName: string;
  price: number;
  qty: number;
  image?: string;
}

interface CheckoutModalProps {
  visible: boolean;
  cart: CartItem[];
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let _orderSeq = 1;

function genOrderNumber() {
  const now = new Date();
  const ymd =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const seq = String(_orderSeq++).padStart(4, "0");
  return `ORD-${ymd}-${seq}`;
}

function genReceiptNumber() {
  const now = new Date();
  const ym = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `RCP-${ym}-${seq}`;
}

const TAX_RATE = 0.12;
const SERVICE_CHARGE_RATE = 0.10;

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckoutModal({ visible, cart, onClose, onSuccess }: CheckoutModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ── State ──────────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [discount, setDiscount] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const cashRef = useRef<TextInput>(null);

  // ── Derived totals ─────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = parseFloat(discount) || 0;
  const tax = parseFloat(((subtotal - discountAmt) * TAX_RATE).toFixed(2));
  const serviceCharge =
    orderType === "dine-in"
      ? parseFloat(((subtotal - discountAmt) * SERVICE_CHARGE_RATE).toFixed(2))
      : 0;
  const total = parseFloat((subtotal - discountAmt + tax + serviceCharge).toFixed(2));
  const tendered = parseFloat(cashTendered) || 0;
  const change = parseFloat((tendered - total).toFixed(2));

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setPaymentMethod("Cash");
      setOrderType("dine-in");
      setTableNumber("");
      setDiscount("");
      setCashTendered("");
      setError("");
    }
  }, [visible]);

  // ── Validation & Submit ────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setError("");

    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }
    if (orderType === "dine-in" && !tableNumber.trim()) {
      setError("Please enter a table number for dine-in orders.");
      return;
    }
    if (paymentMethod === "Cash" && tendered < total) {
      setError(`Cash tendered (${fmt(tendered)}) is less than total (${fmt(total)}).`);
      return;
    }

    Keyboard.dismiss();
    setPlacing(true);

    try {
      const orderNumber = genOrderNumber();
      const receiptNumber = genReceiptNumber();

      const orderData: CreateOrder = {
        order_number: orderNumber,
        receipt_number: receiptNumber,
        table_number: orderType === "dine-in" ? tableNumber.trim() : null,
        order_type: orderType,
        order_status: "Preparing",
        payment_status: "Paid",
        payment_method: paymentMethod,
        subtotal,
        tax,
        discount: discountAmt,
        service_charge: serviceCharge,
        total_amount: total,
        cash_tendered: paymentMethod === "Cash" ? tendered : null,
        completed_at: null,
        status_log: JSON.stringify([
          { from: null, to: "Preparing", at: new Date().toISOString() },
        ]),
      };

      const items: Omit<CreateOrderItem, "order_id">[] = cart.map((item) => ({
        product_variant_id: item.variantId,
        item_name:
          item.variantName && item.variantName !== item.name
            ? `${item.name} (${item.variantName})`
            : item.name,
        quantity: item.qty,
        price: item.price,
        modifiers: "[]",
        money_tendered: paymentMethod === "Cash" ? tendered : 0,
        change: paymentMethod === "Cash" ? change : 0,
        subtotal: item.qty * item.price,
      }));

      const dbId = await ordersRepo.createWithItems(orderData, items);
      const uiId = `ORD-${String(dbId).padStart(4, "0")}`;
      onSuccess(uiId);
    } catch (e: any) {
      console.error("[Checkout] error", e);
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Row helpers ────────────────────────────────────────────────────────────
  const SummaryRow = ({
    label,
    value,
    bold,
    valueColor,
  }: {
    label: string;
    value: string;
    bold?: boolean;
    valueColor?: string;
  }) => (
    <View className="flex-row justify-between items-center py-1.5">
      <Text
        className={`text-sm ${bold ? "font-black text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
      >
        {label}
      </Text>
      <Text
        style={valueColor ? { color: valueColor } : undefined}
        className={`text-sm ${bold ? "font-black text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300"}`}
      >
        {value}
      </Text>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={Keyboard.dismiss}
        >
          <View className="flex-1" />
          <Pressable onPress={() => {}}>
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl pb-8">
              {/* Handle */}
              <View className="items-center pt-3 pb-1">
                <View className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-xl font-black text-gray-900 dark:text-white">
                  Confirm Order
                </Text>
                <TouchableOpacity onPress={onClose} disabled={placing}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
              >
                {/* Order Type */}
                <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Order Type
                </Text>
                <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-4">
                  {(["dine-in", "takeout", "delivery"] as OrderType[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setOrderType(t)}
                      className={`flex-1 py-2.5 rounded-xl items-center ${orderType === t ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                    >
                      <Text
                        className={`text-sm font-bold capitalize ${orderType === t ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        {t === "dine-in" ? "🍽 Dine-in" : t === "takeout" ? "🥡 Takeout" : "🛵 Delivery"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Table number (dine-in only) */}
                {orderType === "dine-in" && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Table Number
                    </Text>
                    <TextInput
                      value={tableNumber}
                      onChangeText={setTableNumber}
                      placeholder="e.g. T-04"
                      placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
                      className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
                    />
                  </View>
                )}

                {/* Payment Method */}
                <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Payment Method
                </Text>
                <View className="flex-row gap-2 mb-4">
                  {(["Cash", "Card", "E-wallet"] as PaymentMethod[]).map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      className={`flex-1 py-3 rounded-xl items-center border-2 ${
                        paymentMethod === m
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <Text className="text-lg mb-0.5">
                        {m === "Cash" ? "💵" : m === "Card" ? "💳" : "📱"}
                      </Text>
                      <Text
                        className={`text-xs font-bold ${
                          paymentMethod === m
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Cash tendered */}
                {paymentMethod === "Cash" && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Cash Tendered
                    </Text>
                    <TextInput
                      ref={cashRef}
                      value={cashTendered}
                      onChangeText={setCashTendered}
                      placeholder="0.00"
                      placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
                      keyboardType="decimal-pad"
                      className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
                    />
                    {tendered > 0 && (
                      <View
                        className={`mt-2 px-4 py-2.5 rounded-xl ${
                          change >= 0
                            ? "bg-green-50 dark:bg-green-900/30"
                            : "bg-red-50 dark:bg-red-900/30"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            change >= 0
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          Change: {fmt(Math.max(change, 0))}
                          {change < 0 ? ` (short ${fmt(Math.abs(change))})` : ""}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Discount */}
                <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Discount (₱)
                </Text>
                <TextInput
                  value={discount}
                  onChangeText={setDiscount}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
                  keyboardType="decimal-pad"
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white mb-5"
                />

                {/* Order summary */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 mb-4">
                  <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Order Summary
                  </Text>
                  {cart.map((item) => (
                    <View
                      key={`${item.id}-${item.variantId}`}
                      className="flex-row justify-between py-1"
                    >
                      <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
                        ×{item.qty}{" "}
                        {item.variantName && item.variantName !== item.name
                          ? `${item.name} (${item.variantName})`
                          : item.name}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
                        {fmt(item.price * item.qty)}
                      </Text>
                    </View>
                  ))}

                  <View className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                    {discountAmt > 0 && (
                      <SummaryRow label="Discount" value={`-${fmt(discountAmt)}`} valueColor="#DC2626" />
                    )}
                    <SummaryRow label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} value={fmt(tax)} />
                    {serviceCharge > 0 && (
                      <SummaryRow label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`} value={fmt(serviceCharge)} />
                    )}
                    <View className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <SummaryRow label="TOTAL" value={fmt(total)} bold />
                    </View>
                  </View>
                </View>

                {/* Error */}
                {error !== "" && (
                  <View className="bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl mb-4">
                    <Text className="text-red-700 dark:text-red-400 text-sm font-semibold">
                      {error}
                    </Text>
                  </View>
                )}

                {/* Confirm button */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={placing}
                  className={`py-4 rounded-2xl items-center mb-2 ${placing ? "bg-blue-400" : "bg-blue-600"}`}
                >
                  {placing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-black text-base">
                      Confirm & Place Order — {fmt(total)}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}