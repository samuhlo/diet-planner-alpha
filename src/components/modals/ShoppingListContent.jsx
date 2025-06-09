export default function ShoppingListContent({ data: ingredients }) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <p class="text-center italic text-stone-500">
        No has seleccionado ninguna receta todavía.
      </p>
    );
  }
  return (
    <ul class="list-disc list-inside space-y-2">
      {ingredients.map((ing, index) => (
        <li key={`${ing.n}-${index}`} class="text-stone-700">
          {Number(ing.q.toPrecision(3))} {ing.u} de {ing.n}
        </li>
      ))}
    </ul>
  );
}
