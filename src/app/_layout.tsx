import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "../lib/state";
import { VacancyNotificationRoute } from "../lib/notifications";
import { C } from "../lib/ui";
export default function Layout() {
  return (
    <Provider>
      <StatusBar style="dark" />
      <VacancyNotificationRoute />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="job/[id]"
          options={{ title: "Detalle de la oferta" }}
        />
      </Stack>
    </Provider>
  );
}
