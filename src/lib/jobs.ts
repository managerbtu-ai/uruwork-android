export type Job = {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  description: string;
  email: string;
  whatsapp: string;
  image_url: string;
  created_at: string;
  expires_at: string;
};
export const ORIGIN = "https://uruwork.com";
export function normalizeJob(value: unknown): Job | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    (typeof v.id !== "string" && typeof v.id !== "number") ||
    typeof v.title !== "string"
  )
    return null;
  const str = (key: string) =>
    typeof v[key] === "string" ? (v[key] as string) : "";
  const raw = str("image_url");
  let image = "";
  try {
    const url = new URL(raw, ORIGIN);
    if (raw && url.protocol === "https:") image = url.href;
  } catch {}
  return {
    id: String(v.id),
    title: str("title"),
    company: str("company"),
    category: str("category") || "Otros",
    location: str("location") || "Uruguay",
    description: str("description"),
    email: str("email"),
    whatsapp: str("whatsapp"),
    image_url: image,
    created_at: str("created_at"),
    expires_at: str("expires_at"),
  };
}
export function activeJobs(values: unknown[], now = Date.now()): Job[] {
  return values
    .map(normalizeJob)
    .filter((j): j is Job => Boolean(j))
    .filter(
      (j) =>
        !j.expires_at ||
        (Number.isFinite(Date.parse(j.expires_at)) &&
          Date.parse(j.expires_at) > now),
    );
}
export function filterJobs(
  jobs: Job[],
  query: string,
  category: string,
  location: string,
) {
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return jobs.filter(
    (j) =>
      (category === "Todos" || j.category === category) &&
      (location === "Todas" || j.location === location) &&
      fold(
        [j.title, j.company, j.location, j.category, j.description].join(" "),
      ).includes(fold(query.trim())),
  );
}
export async function fetchJobs(): Promise<Job[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(`${ORIGIN}/api.php?action=list_vacancies`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("No se pudieron cargar las ofertas.");
    const data = await response.json();
    if (data.ok !== true || !Array.isArray(data.items))
      throw new Error("La web no devolvió un listado válido.");
    return activeJobs(data.items);
  } finally {
    clearTimeout(timer);
  }
}
export function whatsappUrl(value: string) {
  let digits = value.replace(/\D/g, "");
  if (/^09\d{7}$/.test(digits)) digits = `598${digits.slice(1)}`;
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}`;
}
export const DEMO_JOBS: Job[] = [
  {
    id: "demo-1",
    title: "Ayudante de cocina",
    company: "Empresa de ejemplo",
    category: "Gastronomía",
    location: "Montevideo",
    description:
      "Aviso de demostración. Acá se verá la descripción completa publicada en Uruwork, junto con los requisitos, horarios y datos de postulación. Este ejemplo no recibe postulaciones.",
    email: "",
    whatsapp: "",
    image_url: "",
    created_at: "",
    expires_at: "",
  },
  {
    id: "demo-2",
    title: "Auxiliar de limpieza",
    company: "Empresa de ejemplo",
    category: "Limpieza",
    location: "Ciudad de la Costa",
    description:
      "Aviso de demostración, sin vacante real. Las ofertas de la app se cargarán desde la misma fuente de la web.",
    email: "",
    whatsapp: "",
    image_url: "",
    created_at: "",
    expires_at: "",
  },
  {
    id: "demo-3",
    title: "Vendedor/a de salón",
    company: "Empresa de ejemplo",
    category: "Ventas",
    location: "Montevideo",
    description:
      "Ejemplo para probar la búsqueda, los filtros y los guardados. No es una oferta laboral vigente.",
    email: "",
    whatsapp: "",
    image_url: "",
    created_at: "",
    expires_at: "",
  },
];
