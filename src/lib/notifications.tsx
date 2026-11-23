import { useEffect, useState } from "react";
import { Linking, Platform, Text, View } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router, useRootNavigationState } from "expo-router";
import { ORIGIN } from "./jobs";
import { Button, s } from "./ui";

const channel = "vacancies";
const enabled =
  Platform.OS === "android" &&
  Constants.expoConfig?.extra?.androidVacancyAlerts === true;

if (enabled) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function VacancyNotificationRoute() {
  const ready = Boolean(useRootNavigationState()?.key);
  useEffect(() => {
    if (!enabled || !ready) return;
    function open(response: Notifications.NotificationResponse) {
      const id = response.notification.request.content.data?.vacancyId;
      if (typeof id !== "string" || !/^\d{1,20}$/.test(id)) return;
      Notifications.clearLastNotificationResponse();
      router.push({ pathname: "/job/[id]", params: { id } });
    }
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) open(lastResponse);
    return () => subscription.remove();
  }, [ready]);
  return null;
}

export function VacancyNotificationSettings() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!enabled) return null;

  async function subscribe() {
    setBusy(true);
    setMessage("");
    setShowSettings(false);
    try {
      await Notifications.setNotificationChannelAsync(channel, {
        name: "Nuevas vacantes",
        // eslint-disable-next-line import/namespace -- Expo re-exports this enum.
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      const current = await Notifications.getPermissionsAsync();
      const permission = current.granted || !current.canAskAgain
        ? current
        : await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        setMessage("Permití las notificaciones en los ajustes de Uruwork.");
        setShowSettings(true);
        return;
      }
      const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
      if (typeof projectId !== "string") throw new Error("Expo project ID missing");
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const response = await fetch(`${ORIGIN}/notifications-register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Registration failed");
      setMessage("Listo. Te avisaremos cuando se publique una vacante.");
    } catch {
      setMessage("No pudimos activar los avisos. Probá de nuevo en unos minutos.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.card}>
      <Text style={s.title}>Avisos de nuevas vacantes</Text>
      {message ? <Text style={s.copy} accessibilityLiveRegion="polite">{message}</Text> : null}
      {busy ? <Text style={s.copy}>Activando avisos…</Text> : (
        <Button label="Activar avisos" onPress={() => void subscribe()} />
      )}
      {showSettings ? (
        <Button secondary label="Abrir ajustes" onPress={() => void Linking.openSettings()} />
      ) : null}
    </View>
  );
}
