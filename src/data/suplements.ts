export interface Supplement {
  id: string; // Un identificador único
  name: string; // El nombre que verá el usuario
  calories: number; // Calorías por toma
  protein: number; // Proteína por toma
}

export const allSupplements: Supplement[] = [
  {
    id: "default-whey",
    name: "Proteína Whey (30g)",
    calories: 109,
    protein: 24,
  },
  {
    id: "vegan-blend",
    name: "Mezcla Vegana (30g)",
    calories: 115,
    protein: 22,
  },
  {
    id: "casein",
    name: "Caseína (30g)",
    calories: 105,
    protein: 25,
  },
];
