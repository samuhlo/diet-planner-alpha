import { useState, useMemo } from "preact/hooks";

export default function TipsBrowser({ allTips }) {
  const [activeTags, setActiveTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const allTags = useMemo(() => {
    const tags = new Set();
    allTips.forEach((tip) => tip.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [allTips]);

  const handleTagChange = (tag) => {
    setActiveTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredTips = useMemo(() => {
    return allTips.filter((tip) => {
      const tagMatch =
        activeTags.length === 0 ||
        activeTags.every((tag) => tip.tags.includes(tag));
      const searchMatch =
        searchTerm === "" ||
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase());
      return tagMatch && searchMatch;
    });
  }, [activeTags, searchTerm, allTips]);

  return (
    <div>
      {/* Filtros y Buscador */}
      <div class="bg-white p-4 rounded-lg shadow-md mb-8 space-y-4">
        <input
          type="text"
          placeholder="Buscar por palabra clave..."
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="w-full p-2 border border-gray-300 rounded-md"
        />
        <div class="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagChange(tag)}
              class={`cursor-pointer border border-gray-300 rounded-full py-1 px-3 text-sm transition ${
                activeTags.includes(tag)
                  ? "bg-[#6B8A7A] text-white border-[#6B8A7A]"
                  : "bg-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Consejos */}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTips.length > 0 ? (
          filteredTips.map((tip) => (
            <div key={tip.id} class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-3 text-[#3a5a40]">
                {tip.title}
              </h3>
              <div
                class="text-stone-700 space-y-2"
                dangerouslySetInnerHTML={{ __html: tip.content }}
              ></div>
              <div class="mt-4 flex flex-wrap gap-1">
                {tip.tags.map((tag) => (
                  <span class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p class="text-stone-500 italic col-span-full text-center">
            No se han encontrado consejos con los filtros seleccionados.
          </p>
        )}
      </div>
    </div>
  );
}
