export default function SummaryContent({ data: summary }) {
  if (!summary || summary.length === 0) {
    return (
      <p class="text-center text-stone-500 italic">
        No has planificado ninguna comida todavía.
      </p>
    );
  }
  return (
    <div id="summary-to-copy" class="space-y-4">
      {summary.map((dayData) => (
        <div key={dayData.day} class="day-summary-block">
          <h4 class="font-bold text-lg text-[#6B8A7A] border-b pb-1 mb-2">
            {dayData.day}
          </h4>
          <ul class="list-none space-y-1 pl-2 text-stone-700">
            {dayData.meals.desayuno && (
              <li>
                <strong class="font-semibold w-24 inline-block">
                  Desayuno:
                </strong>{" "}
                {dayData.meals.desayuno}
              </li>
            )}
            {dayData.meals.almuerzo && (
              <li>
                <strong class="font-semibold w-24 inline-block">
                  Almuerzo:
                </strong>{" "}
                {dayData.meals.almuerzo}
              </li>
            )}
            {dayData.meals.cena && (
              <li>
                <strong class="font-semibold w-24 inline-block">Cena:</strong>{" "}
                {dayData.meals.cena}
              </li>
            )}
            {dayData.meals.supplement && (
              <li>
                <strong class="font-semibold w-24 inline-block">Supp:</strong>{" "}
                {dayData.meals.supplement}
              </li>
            )}
            {dayData.meals.snacks && (
              <li>
                <strong class="font-semibold w-24 inline-block">Snacks:</strong>{" "}
                {dayData.meals.snacks}
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
