import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import { fetchImageRegistries, fetchImageRegistry } from "api/image-registries";
import { useServerEntitlements } from "util/entitlements/server";

export const useImageRegistries = (enabled?: boolean) => {
  const { isFineGrained } = useAuth();
  const { canViewImageRegistries } = useServerEntitlements();
  return useQuery({
    queryKey: [queryKeys.imageRegistries],
    queryFn: async () => fetchImageRegistries(isFineGrained),
    enabled:
      canViewImageRegistries() && (enabled ?? true) && isFineGrained !== null,
  });
};

export const useImageRegistry = (name: string, enabled?: boolean) => {
  const { isFineGrained } = useAuth();
  const { canViewImageRegistries } = useServerEntitlements();
  return useQuery({
    queryKey: [queryKeys.imageRegistries, name],
    queryFn: async () => fetchImageRegistry(name, isFineGrained),
    enabled:
      canViewImageRegistries() && (enabled ?? true) && isFineGrained !== null,
  });
};
