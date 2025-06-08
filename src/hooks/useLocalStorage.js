import { useState, useEffect } from "preact/hooks";

function getSavedValue(key, initialValue) {
  if (typeof window === "undefined") return initialValue; // No hacer nada en el servidor
  const savedValue = JSON.parse(localStorage.getItem(key));
  if (savedValue) return savedValue;
  return initialValue;
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    return getSavedValue(key, initialValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
}
