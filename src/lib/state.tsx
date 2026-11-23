import { AppState } from "react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Job, fetchJobs, DEMO_JOBS } from "./jobs";
type State = {
  jobs: Job[];
  saved: string[];
  loading: boolean;
  error: string;
  demo: boolean;
  storageError: string;
  refresh: () => Promise<void>;
  toggle: (id: string) => void;
  setDemo: (v: boolean) => void;
};
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]),
    [saved, setSaved] = useState<string[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [demo, setDemo] = useState(false),
    [storageError, setStorageError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setJobs(await fetchJobs());
    } catch {
      setError(
        "No pudimos conectar con Uruwork. Revisá tu conexión y volvé a intentar.",
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchJobs()
      .then(setJobs)
      .catch(() =>
        setError(
          "No pudimos conectar con Uruwork. Revisá tu conexión y volvé a intentar.",
        ),
      )
      .finally(() => setLoading(false));
    const subscription = AppState.addEventListener("change", (value) => {
      if (value === "active") void refresh();
    });
    AsyncStorage.getItem("uruwork.saved.v1")
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data))
            setSaved(data.filter((x) => typeof x === "string"));
        }
      })
      .catch(() => setStorageError("No pudimos recuperar tus guardados."));
    return () => subscription.remove();
  }, [refresh]);
  const toggle = (id: string) => {
    setSaved((previous) => {
      const next = previous.includes(id)
        ? previous.filter((x) => x !== id)
        : [...previous, id];
      void AsyncStorage.setItem("uruwork.saved.v1", JSON.stringify(next)).catch(
        () =>
          setStorageError(
            "No pudimos conservar el cambio. Los guardados podrían perderse al cerrar.",
          ),
      );
      return next;
    });
  };
  return (
    <Context.Provider
      value={{
        jobs: demo ? DEMO_JOBS : jobs,
        saved,
        loading: demo ? false : loading,
        error: demo ? "" : error,
        demo,
        storageError,
        refresh,
        toggle,
        setDemo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useJobs() {
  const state = useContext(Context);
  if (!state) throw new Error("Missing provider");
  return state;
}
