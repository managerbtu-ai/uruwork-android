import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { VacancyNotificationSettings } from "../lib/notifications";
import { useJobs } from "../lib/state";
import { C, s, Button, Empty, openUrl } from "../lib/ui";
import { filterJobs, ORIGIN } from "../lib/jobs";
export default function Home() {
  const state = useJobs();
  const [tab, setTab] = useState("Ofertas"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todos"),
    [location, setLocation] = useState("Todas");
  const categories = ["Todos", ...new Set(state.jobs.map((j) => j.category))],
    locations = ["Todas", ...new Set(state.jobs.map((j) => j.location))];
  const jobs = useMemo(
    () =>
      filterJobs(state.jobs, query, category, location).filter(
        (j) => tab !== "Guardados" || state.saved.includes(j.id),
      ),
    [state.jobs, state.saved, query, category, location, tab],
  );
  return (
    <SafeAreaView style={s.page} edges={["top", "bottom"]}>
      <View style={[s.row, { paddingHorizontal: 24, paddingVertical: 15 }]}>
        <View>
          <Text style={s.brand}>
            uruwork<Text style={{ color: C.green }}>.</Text>
          </Text>
          <Text style={s.small}>Oportunidades en Uruguay</Text>
        </View>
        <View style={s.pill}>
          <Text style={s.pillText}>Por Carlitos · BTU</Text>
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={state.loading}
            onRefresh={() => void state.refresh()}
            tintColor={C.green}
          />
        }
        contentContainerStyle={s.content}
      >
        {state.demo && (
          <View style={s.warning}>
            <Text style={s.warningText}>
              DEMOSTRACIÓN · Estos ejemplos no son vacantes reales.
            </Text>
            <Pressable
              onPress={() => {
                state.setDemo(false);
                setCategory("Todos");
                setLocation("Todas");
                setQuery("");
              }}
            >
              <Text style={[s.pillText, { marginTop: 9 }]}>
                Volver a ofertas reales
              </Text>
            </Pressable>
          </View>
        )}
        {state.storageError && (
          <Text accessibilityRole="alert" style={s.warningText}>
            {state.storageError}
          </Text>
        )}
        {tab === "Recursos" ? (
          <>
            <VacancyNotificationSettings />
            <Text style={s.eyebrow}>Un impulso para tu búsqueda</Text>
            <Text style={[s.title, { fontSize: 32 }]}>
              Más herramientas.{"\n"}Más oportunidades.
            </Text>
            <Text style={s.copy}>
              Todo lo que compartimos para acompañarte a encontrar trabajo.
            </Text>
            {[
              [
                "El Gallito del domingo",
                "Consultá la edición disponible en nuestra web.",
                `${ORIGIN}/avisos-del-domingo.html`,
                "newspaper-outline",
              ],
              [
                "Lista de empresas",
                "Accedé a los canales de postulación y su estado de verificación.",
                `${ORIGIN}/#guia-empresas`,
                "business-outline",
              ],
              [
                "Guía de empleo en Montevideo",
                "Organizá tu búsqueda laboral con nuestra guía gratuita.",
                `${ORIGIN}/assets/guia-para-conseguir-trabajo-en-montevideo-uruwork.pdf`,
                "book-outline",
              ],
              [
                "LinkedIn desde cero",
                "Aprendé a crear tu perfil con la guía gratuita.",
                `${ORIGIN}/assets/guia_linkedin_desde_cero.pdf`,
                "person-outline",
              ],
              [
                "Publicar una búsqueda",
                "¿Tenés una vacante? Enviá tu aviso para revisión.",
                `${ORIGIN}/#empresas`,
                "megaphone-outline",
              ],
              [
                "Política de privacidad",
                "Consultá cómo Uruwork trata los datos y cómo contactarnos.",
                "https://www.uruwork.com/privacidad-app.html",
                "shield-checkmark-outline",
              ],
            ].map(([title, copy, url, icon]) => (
              <Pressable
                key={title}
                accessibilityRole="link"
                onPress={() => void openUrl(url)}
                style={s.card}
              >
                <Ionicons
                  name={icon as "book-outline"}
                  color={C.green}
                  size={28}
                />
                <Text style={s.title}>{title}</Text>
                <Text style={s.copy}>{copy}</Text>
                <Text style={s.pillText}>Abrir en Uruwork →</Text>
              </Pressable>
            ))}
            <Text style={s.small}>
              Los recursos se abren en el navegador. Uruwork difunde avisos; las
              postulaciones se dirigen a cada empresa.
            </Text>
          </>
        ) : (
          <>
            {tab === "Ofertas" ? (
              <View style={s.hero}>
                <Text style={[s.eyebrow, { color: C.lime }]}>
                  Tu próxima oportunidad
                </Text>
                <Text style={s.heroTitle}>
                  El trabajo que buscás{"\n"}puede estar acá.
                </Text>
                <Text style={[s.copy, { color: "#CEDBD9" }]}>
                  Explorá las ofertas y contactá directamente a las empresas.
                  Sin costo para postularte.
                </Text>
                <View
                  style={[
                    s.pill,
                    { backgroundColor: C.lime, alignSelf: "flex-start" },
                  ]}
                >
                  <Text style={[s.pillText, { color: C.ink }]}>
                    {state.loading
                      ? "Cargando ofertas…"
                      : `${state.jobs.length} ofertas disponibles`}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={s.eyebrow}>Tu selección</Text>
                <Text style={[s.title, { fontSize: 32 }]}>
                  Avisos guardados
                </Text>
                <Text style={s.copy}>
                  Se conservan en este dispositivo. Los avisos retirados de la
                  web dejan de aparecer.
                </Text>
              </>
            )}
            <TextInput
              accessibilityLabel="Buscar puesto, empresa o palabra clave"
              placeholder="Buscá un puesto, empresa o palabra"
              placeholderTextColor={C.muted}
              value={query}
              onChangeText={setQuery}
              style={s.input}
              clearButtonMode="while-editing"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityState={{ selected: c === category }}
                  onPress={() => setCategory(c)}
                  style={[s.chip, c === category && s.chipActive]}
                >
                  <Text
                    style={[s.chipText, c === category && s.chipTextActive]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={s.eyebrow}>Zona</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {locations.map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityState={{ selected: c === location }}
                  onPress={() => setLocation(c)}
                  style={[s.chip, c === location && s.chipActive]}
                >
                  <Text
                    style={[s.chipText, c === location && s.chipTextActive]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={s.row}>
              <Text style={s.title}>
                {tab === "Guardados" ? "Tus ofertas" : "Últimas ofertas"}
              </Text>
              <Text style={s.small}>{jobs.length} resultados</Text>
            </View>
            {state.loading ? (
              <ActivityIndicator size="large" color={C.green} />
            ) : state.error ? (
              <View style={s.card}>
                <Text accessibilityRole="alert" style={s.copy}>
                  {state.error}
                </Text>
                <Button
                  label="Volver a intentar"
                  onPress={() => void state.refresh()}
                />
                <Button
                  secondary
                  label="Abrir la web"
                  onPress={() => void openUrl(ORIGIN)}
                />
              </View>
            ) : jobs.length === 0 ? (
              <Empty
                title={
                  tab === "Guardados"
                    ? "Todavía no hay avisos para mostrar"
                    : "No encontramos ofertas"
                }
                text="Probá otra búsqueda o volvé más tarde. Tocá el marcador de una oferta para guardarla."
              />
            ) : (
              jobs.map((j) => (
                <View key={j.id} style={s.card}>
                  <View style={s.row}>
                    <View style={s.pill}>
                      <Text style={s.pillText}>{j.category}</Text>
                    </View>
                    <Pressable
                      hitSlop={14}
                      accessibilityRole="button"
                      accessibilityLabel={
                        state.saved.includes(j.id)
                          ? `Quitar ${j.title} de guardados`
                          : `Guardar ${j.title}`
                      }
                      accessibilityState={{
                        selected: state.saved.includes(j.id),
                      }}
                      onPress={() => state.toggle(j.id)}
                    >
                      <Ionicons
                        name={
                          state.saved.includes(j.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={23}
                        color={C.green}
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: "/job/[id]",
                        params: { id: j.id },
                      })
                    }
                    style={{ gap: 10 }}
                  >
                    <Text style={s.title}>{j.title}</Text>
                    <Text style={s.copy}>
                      {j.company || "Empresa anunciante"}
                    </Text>
                    <Text style={s.small}>{j.location}</Text>
                    {j.image_url ? (
                      <Image
                        source={{ uri: j.image_url }}
                        accessibilityLabel={`Aviso de ${j.title}`}
                        style={{
                          height: 180,
                          borderRadius: 12,
                          backgroundColor: C.bg,
                        }}
                        resizeMode="contain"
                      />
                    ) : null}
                    <View style={s.divider} />
                    <View style={s.row}>
                      <Text style={s.small}>Postulación directa</Text>
                      <Text style={s.pillText}>Ver oferta →</Text>
                    </View>
                  </Pressable>
                </View>
              ))
            )}
            {!state.demo && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  state.setDemo(true);
                  setCategory("Todos");
                  setLocation("Todas");
                  setQuery("");
                }}
              >
                <Text
                  style={[
                    s.small,
                    {
                      textAlign: "center",
                      padding: 14,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Probar el diseño con avisos de ejemplo
                </Text>
              </Pressable>
            )}
            <Text style={[s.small, { textAlign: "center" }]}>
              Uruwork difunde oportunidades. No recibe CV para estas vacantes.
            </Text>
          </>
        )}
      </ScrollView>
      <View
        style={[
          s.row,
          {
            paddingTop: 12,
            paddingBottom: 8,
            paddingHorizontal: 28,
            borderTopWidth: 1,
            borderTopColor: C.line,
            backgroundColor: C.white,
          },
        ]}
      >
        {(["Ofertas", "Guardados", "Recursos"] as const).map((name, i) => (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === name }}
            onPress={() => setTab(name)}
            style={{ alignItems: "center", gap: 5, padding: 5 }}
          >
            <Ionicons
              name={
                (
                  [
                    "search-outline",
                    "bookmark-outline",
                    "grid-outline",
                  ] as const
                )[i]
              }
              size={23}
              color={tab === name ? C.green : C.muted}
            />
            <Text
              style={{
                fontSize: 11,
                color: tab === name ? C.green : C.muted,
                fontWeight: "700",
              }}
            >
              {name}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
