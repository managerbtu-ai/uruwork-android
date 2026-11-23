import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export const C = {
  ink: "#082B59",
  muted: "#647184",
  green: "#12487B",
  lime: "#FFD36A",
  bg: "#F5F7FA",
  line: "#E2E7EF",
  white: "#FFFFFF",
};
export async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    if (Platform.OS === "web") globalThis.alert("No se pudo abrir el enlace.");
    else
      Alert.alert(
        "No se pudo abrir",
        "Probá abrirlo desde tu navegador o revisá si tenés una app compatible.",
      );
  }
}
export function Button({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.button, secondary && s.secondary]}
    >
      <Text style={[s.buttonText, secondary && { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name="search-outline" size={32} color={C.green} />
      <Text style={s.title}>{title}</Text>
      <Text style={s.copy}>{text}</Text>
    </View>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  content: {
    padding: 22,
    gap: 16,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  brand: { fontWeight: "900", fontSize: 26, color: C.ink, letterSpacing: -1 },
  eyebrow: {
    color: C.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  title: { color: C.ink, fontSize: 22, fontWeight: "800" },
  copy: { fontSize: 15, lineHeight: 23, color: C.muted },
  hero: { padding: 24, borderRadius: 24, backgroundColor: C.ink, gap: 12 },
  heroTitle: {
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -1,
  },
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: "#EDF3FA",
  },
  pillText: { fontSize: 12, fontWeight: "700", color: C.green },
  button: {
    padding: 16,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: "center",
  },
  buttonText: { fontSize: 15, fontWeight: "700", color: C.white },
  secondary: { backgroundColor: "#E8EEF6" },
  input: {
    backgroundColor: C.white,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    fontSize: 16,
    color: C.ink,
  },
  empty: {
    paddingVertical: 34,
    paddingHorizontal: 14,
    gap: 14,
    alignItems: "center",
  },
  warning: { backgroundColor: "#FFF3CC", padding: 14, borderRadius: 12 },
  warningText: { color: "#755510", fontSize: 13, lineHeight: 20 },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.white,
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  chipTextActive: { color: C.white },
  small: { fontSize: 12, color: C.muted },
  divider: { height: 1, backgroundColor: C.line },
});
