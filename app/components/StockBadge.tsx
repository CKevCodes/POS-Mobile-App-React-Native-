import { View, Text } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; bgCls: string; textCls: string }
> = {
  "in-stock": {
    label: "In Stock",
    bgCls: "bg-green-100 dark:bg-green-900/40",
    textCls: "text-green-800 dark:text-green-300",
  },
  "low-stock": {
    label: "Low Stock",
    bgCls: "bg-yellow-100 dark:bg-yellow-900/40",
    textCls: "text-yellow-800 dark:text-yellow-300",
  },
  "out-of-stock": {
    label: "Out of Stock",
    bgCls: "bg-red-100 dark:bg-red-900/40",
    textCls: "text-red-800 dark:text-red-300",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StockBadge({ status, quantity }: StockBadgeProps) {
  const config = STOCK_STATUS_CONFIG[status];

  return (
    <View className={`rounded px-2 py-0.5 ${config.bgCls}`}>
      <Text className={`text-xs font-bold ${config.textCls}`}>
        {config.label}
        {quantity !== undefined && ` • ${quantity}`}
      </Text>
    </View>
  );
}

// ─── Helper Function ──────────────────────────────────────────────────────────

export const getStockStatus = (
  quantity: number,
  threshold: number,
): StockStatus => {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= threshold) return "low-stock";
  return "in-stock";
};
