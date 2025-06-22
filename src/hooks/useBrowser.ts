import { useState, useMemo } from "preact/hooks";

interface BrowserConfig<T> {
  items: T[];
  searchKeys: (keyof T)[];
  tagKey: keyof T;
}

export function useBrowser<T extends Record<string, any>>({
  items,
  searchKeys,
  tagKey,
}: BrowserConfig<T>) {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach((item) => {
      const itemTags = item[tagKey];
      if (Array.isArray(itemTags)) {
        itemTags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items, tagKey]);

  const handleTagChange = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagMatch =
        activeTags.length === 0 ||
        activeTags.every((tag) => {
          const itemTags = item[tagKey];
          return Array.isArray(itemTags) && itemTags.includes(tag);
        });

      const searchMatch =
        searchTerm === "" ||
        searchKeys.some((key) => {
          const value = item[key];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

      return tagMatch && searchMatch;
    });
  }, [items, activeTags, searchTerm, searchKeys, tagKey]);

  return {
    activeTags,
    searchTerm,
    setSearchTerm,
    allTags,
    handleTagChange,
    filteredItems,
  };
}
