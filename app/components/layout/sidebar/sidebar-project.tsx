"use client";

import { useUser } from "@/lib/user-store/provider";
import { FolderPlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DialogCreateProject } from "./dialog-create-project";
import { SidebarProjectItem } from "./sidebar-project-item";

type Project = {
  id: string;
  name: string;
  // biome-ignore lint: API returns snake_case
  user_id: string;
  // biome-ignore lint: API returns snake_case
  created_at: string;
};

export function SidebarProject() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
    enabled: !!user, // Only fetch projects when user is authenticated
  });

  const hasProjects = projects.length > 0;
  const shouldShowProjects = !isLoading && hasProjects;
  const shouldShowCreateButton = !!user; // Only show create button when user is authenticated

  return (
    <div>
      {shouldShowCreateButton && (
        <button
          className="group/new-chat relative inline-flex w-full items-center gap-2 rounded-md bg-transparent px-2 py-2 text-primary text-sm transition-colors hover:bg-accent/80 hover:text-foreground"
          onClick={() => setIsDialogOpen(true)}
          type="button"
        >
          <FolderPlusIcon className="size-5" />
          <span>New project</span>
        </button>
      )}

      {shouldShowProjects && (
        <div className="space-y-1">
          {projects.map((project) => (
            <SidebarProjectItem key={project.id} project={project} />
          ))}
        </div>
      )}

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
