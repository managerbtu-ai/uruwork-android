import { Image, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useJobs } from "../../lib/state";
import { C, s, Button, Empty, openUrl } from "../../lib/ui";
import { ORIGIN, whatsappUrl } from "../../lib/jobs";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useJobs();
  const job = state.jobs.find((j) => j.id === id);
  if (!job)
    return (
      <Empty
        title="Oferta no disponible"
        text="Puede haber vencido o haber sido retirada. Volvé al listado para ver las ofertas actuales."
      />
    );
  const wa = whatsappUrl(job.whatsapp);
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      {state.demo && (
        <View style={s.warning}>
          <Text style={s.warningText}>
            DEMOSTRACIÓN · No admite postulaciones.
          </Text>
        </View>
      )}
      <Text style={s.eyebrow}>{job.category}</Text>
      <Text style={[s.title, { fontSize: 32, lineHeight: 38 }]}>
        {job.title}
      </Text>
      <Text style={s.copy}>
        {job.company || "Empresa anunciante"} · {job.location}
      </Text>
      {job.image_url && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Abrir imagen del aviso en tamaño completo"
          onPress={() => void openUrl(job.image_url)}
        >
          <Image
            source={{ uri: job.image_url }}
            style={{
              width: "100%",
              height: 430,
              borderRadius: 18,
              backgroundColor: C.white,
            }}
            resizeMode="contain"
          />
          <Text style={s.small}>Tocá la imagen para verla completa.</Text>
        </Pressable>
      )}
      <View style={s.card}>
        <Text style={s.title}>Sobre la oportunidad</Text>
        <Text selectable style={[s.copy, { color: C.ink }]}>
          {job.description ||
            "Revisá la imagen del aviso para conocer los requisitos y los datos de contacto."}
        </Text>
      </View>
      <Button
        secondary
        label={
          state.saved.includes(job.id)
            ? "Quitar de guardados"
            : "Guardar oferta"
        }
        onPress={() => state.toggle(job.id)}
      />
      {!state.demo && (
        <>
          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.email) && (
            <Button
              label="Postular por correo"
              onPress={() =>
                void openUrl(
                  `mailto:${job.email}?subject=${encodeURIComponent(`Postulación: ${job.title}`)}`,
                )
              }
            />
          )}
          {wa && (
            <Button
              label="Contactar por WhatsApp"
              onPress={() => void openUrl(wa)}
            />
          )}
          <Button
            secondary
            label="Ver publicación en la web"
            onPress={() =>
              void openUrl(`${ORIGIN}/#oferta/${encodeURIComponent(job.id)}`)
            }
          />
          <Button
            secondary
            label="Compartir oferta"
            onPress={() =>
              void Share.share({
                message: `${job.title} — ${job.location}\n${ORIGIN}/#oferta/${encodeURIComponent(job.id)}`,
              }).catch(() => {})
            }
          />
        </>
      )}
      <Text style={s.small}>
        Contactá directamente a la empresa usando los datos del aviso. Uruwork
        no realiza la contratación ni cobra a postulantes.
      </Text>
    </ScrollView>
  );
}
