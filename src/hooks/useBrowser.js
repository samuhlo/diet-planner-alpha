import { useState, useMemo } from "preact/hooks";

export function useBrowser({ items, searchKeys, tagKey }) {
  const [activeTags, setActiveTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const allTags = useMemo(() => {
    const tags = new Set();
    items.forEach((item) => {
      if (item[tagKey]) {
        item[tagKey].forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items, tagKey]);

  const handleTagChange = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagMatch =
        activeTags.length === 0 ||
        activeTags.every((tag) => item[tagKey]?.includes(tag));
      const searchMatch =
        searchTerm === "" ||
        searchKeys.some((key) =>
          item[key]?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return tagMatch && searchMatch;
    });
  }, [items, activeTags, searchTerm, searchKeys, tagKey]);

  // El hook devuelve el estado y las funciones para que el componente las use
  return {
    activeTags,
    searchTerm,
    setSearchTerm,
    allTags,
    handleTagChange,
    filteredItems,
  };
}
