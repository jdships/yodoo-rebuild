import { toast } from "@/components/ui/toast";
import { fetchClient } from "@/lib/fetch";
import { useModel } from "@/lib/model-store/provider";
import { debounce } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

const SECONDS_TO_MS = 1000;
const MINUTES_TO_MS = 60 * SECONDS_TO_MS;
const STALE_TIME_MINUTES = 5;
const STALE_TIME_MS = STALE_TIME_MINUTES * MINUTES_TO_MS; // 5 minutes
const DEBOUNCE_DELAY_MS = 500;

type FavoriteModelsResponse = {
  // biome-ignore lint: API requires snake_case
  favorite_models: string[];
};

export function useFavoriteModels() {
  const queryClient = useQueryClient();
  const { favoriteModels: initialFavoriteModels, refreshFavoriteModelsSilent } =
    useModel();

  // Ensure we always have an array
  const safeInitialData = Array.isArray(initialFavoriteModels)
    ? initialFavoriteModels
    : [];

  // Query to fetch favorite models
  const {
    data: favoriteModels = safeInitialData,
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["favorite-models"],
    queryFn: async () => {
      const response = await fetchClient(
        "/api/user-preferences/favorite-models"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch favorite models");
      }

      const data: FavoriteModelsResponse = await response.json();
      return data.favorite_models || [];
    },
    staleTime: STALE_TIME_MS,
    retry: 1,
    initialData: safeInitialData,
  });

  // Mutation to update favorite models
  const updateFavoriteModelsMutation = useMutation({
    mutationFn: async (models: string[]) => {
      const response = await fetchClient(
        "/api/user-preferences/favorite-models",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // biome-ignore lint: API requires snake_case
            favorite_models: models,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error ||
            `Failed to save favorite models: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result;
    },
    onMutate: async (newModels) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favorite-models"] });

      // Snapshot the previous value
      const previousFavoriteModels = queryClient.getQueryData<string[]>([
        "favorite-models",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["favorite-models"], newModels);

      // Return a context object with the snapshotted value
      return { previousFavoriteModels };
    },
    onError: (err, _newModels, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (
        context &&
        "previousFavoriteModels" in context &&
        context.previousFavoriteModels
      ) {
        queryClient.setQueryData(
          ["favorite-models"],
          context.previousFavoriteModels
        );
      }

      // Error saving favorite models

      toast({
        title: "Failed to save favorite models",
        description: err.message || "Please try again.",
      });

      // Also refresh ModelProvider on error to sync back with server state
      refreshFavoriteModelsSilent();
    },
    onSuccess: () => {
      // Invalidate the cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["favorite-models"] });

      // Also refresh the ModelProvider's favorite models (silently)
      refreshFavoriteModelsSilent();
    },
  });

  // Debounced version of the mutation for reordering
  const debouncedUpdateFavoriteModels = useRef(
    debounce((models: string[]) => {
      updateFavoriteModelsMutation.mutate(models);
    }, DEBOUNCE_DELAY_MS)
  ).current;

  // Wrapper function that decides whether to debounce or not
  const updateFavoriteModels = useCallback(
    (models: string[], shouldDebounce = false) => {
      // Always update the cache immediately for optimistic updates
      queryClient.setQueryData(["favorite-models"], models);

      if (shouldDebounce) {
        debouncedUpdateFavoriteModels(models);
      } else {
        updateFavoriteModelsMutation.mutate(models);
      }
    },
    [updateFavoriteModelsMutation, debouncedUpdateFavoriteModels, queryClient]
  );

  return {
    favoriteModels,
    isLoading,
    error,
    updateFavoriteModels,
    updateFavoriteModelsDebounced: (models: string[]) =>
      updateFavoriteModels(models, true),
    isUpdating: updateFavoriteModelsMutation.isPending,
    updateError: updateFavoriteModelsMutation.error,
  };
}
