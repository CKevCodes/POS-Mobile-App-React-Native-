import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export type DeviceType = "mobile" | "tablet" | "desktop";

export const useBreakpoint = (): DeviceType => {
  const { width } = useWindowDimensions();

  if (width >= BREAKPOINTS.DESKTOP) return "desktop";
  if (width >= BREAKPOINTS.TABLET) return "tablet";
  return "mobile";
};
