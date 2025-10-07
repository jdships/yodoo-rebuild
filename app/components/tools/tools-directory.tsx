"use client";

import { toolsData } from "@/lib/tools/data";
import type { ToolCategory, ToolsFilter } from "@/lib/tools/types";
import { useMemo, useState } from "react";
import { CategoryTabs } from "./category-tabs";
import { ToolCard } from "./tool-card";
import { ToolsSearch } from "./tools-search";

function filterTools(tools: typeof toolsData, filters: ToolsFilter) {
  return tools.filter((tool) => {
    // Category filter
    if (
      filters.category &&
      filters.category !== "all" &&
      tool.category !== filters.category
    ) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = tool.name.toLowerCase().includes(searchLower);
      const matchesDescription = tool.description
        .toLowerCase()
        .includes(searchLower);
      const matchesTags = tool.tags?.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );

      if (!(matchesName || matchesDescription || matchesTags)) {
        return false;
      }
    }

    // Pricing filter
    if (
      filters.pricing &&
      filters.pricing !== "all" &&
      tool.pricing !== filters.pricing
    ) {
      return false;
    }

    return true;
  });
}

export function ToolsDirectory() {
  const [filters, setFilters] = useState<ToolsFilter>({
    category: "all",
    search: "",
    pricing: "all",
  });

  const filteredTools = useMemo(
    () => filterTools(toolsData, filters),
    [filters]
  );

  const handleCategoryChange = (category: ToolCategory | "all") => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  return (
    <div className="flex h-full flex-col px-2">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-4">
            <div>
              <h1 className="font-medium text-3xl tracking-tight">
                Tools Directory
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Discover and explore the most innovative AI tools. Find the
                perfect tools to enhance your workflow and boost productivity.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-start">
              <ToolsSearch
                onSearchChange={handleSearchChange}
                placeholder="Search for AI Tools..."
                searchQuery={filters.search || ""}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 pt-0">
          <div className="mx-auto max-w-6xl">
            {/* Category Tabs */}
            <div className="mb-8">
              <CategoryTabs
                activeCategory={filters.category || "all"}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {filteredTools.map((tool) => (
                <ToolCard className="h-full" key={tool.id} tool={tool} />
              ))}
            </div>

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">
                  <h3 className="mb-2 font-semibold text-lg">No tools found</h3>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
