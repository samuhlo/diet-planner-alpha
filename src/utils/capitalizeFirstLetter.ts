// src/utils/capitalizeFirstLetter.ts
export function capitalizeFirstLetter(string: string): string {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function formatRecipeName(name: string): string {
  return name
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function formatIngredientName(name: string): string {
  return capitalizeFirstLetter(name);
}
