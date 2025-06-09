import { map, atom } from "nanostores";

// --- TIPOS (Opcional, pero buena práctica) ---
type UserData = {
  gender: "male" | "female" | "other";
  age: number;
  height: number;
  weight: number;
  steps: number;
};

type UserGoal = {
  startDate: string;
  endDate: string;
  targetWeight: number;
};

type WeightEntry = {
  weight: number;
  date: string;
};

// --- HELPERS ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  // Sin cambios aquí, esta función es correcta.
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    try {
      if (item) return JSON.parse(item);
    } catch (e) {
      console.error(`Error parsing localStorage item ${key}:`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

// --- STORE DE DATOS PERSONALES ---
const defaultUserData: UserData = {
  gender: "male",
  age: 35,
  height: 180,
  weight: 96,
  steps: 7500,
};
export const $userData = map<UserData>(
  getFromStorage("userData", defaultUserData)
);
$userData.subscribe((value) => {
  if (typeof window !== "undefined")
    localStorage.setItem("userData", JSON.stringify(value));
});

// AHORA: Una función normal que modifica el store. Más simple y directo.
export const updateUserData = <K extends keyof UserData>(
  key: K,
  value: UserData[K]
) => {
  $userData.setKey(key, value);
};

// --- STORE DEL OBJETIVO ---
const defaultGoal: UserGoal = { startDate: "", endDate: "", targetWeight: 90 };
export const $userGoal = map<UserGoal>(getFromStorage("userGoal", defaultGoal));
$userGoal.subscribe((value) => {
  if (typeof window !== "undefined")
    localStorage.setItem("userGoal", JSON.stringify(value));
});

// AHORA: Igual que antes, una función helper.
export const updateUserGoal = <K extends keyof UserGoal>(
  key: K,
  value: UserGoal[K]
) => {
  $userGoal.setKey(key, value);
};

// --- STORE DEL REGISTRO DE PESO ---
const defaultLog: WeightEntry[] = [
  {
    weight: 96,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// CAMBIO CLAVE: Usamos `atom` para listas/arrays en lugar de `map`.
export const $weightLog = atom<WeightEntry[]>(
  getFromStorage("weightLog", defaultLog)
);
$weightLog.subscribe((value) => {
  if (typeof window !== "undefined")
    localStorage.setItem("weightLog", JSON.stringify(value));
});

// AHORA: La lógica es más limpia porque `get()` devuelve directamente el array.
export const addWeightEntry = (newEntry: WeightEntry) => {
  const currentLog = $weightLog.get(); // .get() ya nos da el array
  const updatedLog = [...currentLog, newEntry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  $weightLog.set(updatedLog); // Actualizamos el store con el nuevo array ordenado
};
