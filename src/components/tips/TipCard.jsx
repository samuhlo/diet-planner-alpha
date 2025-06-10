export default function TipCard({ item: tip }) {
  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-semibold mb-3 text-[#3a5a40]">{tip.title}</h3>
      <div
        class="text-stone-700 space-y-2"
        dangerouslySetInnerHTML={{ __html: tip.content }}
      ></div>
      <div class="mt-4 flex flex-wrap gap-1">
        {tip.tags.map((tag) => (
          <span
            key={tag}
            class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
