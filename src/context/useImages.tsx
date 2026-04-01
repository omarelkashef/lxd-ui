import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  fetchImageRegistries,
  fetchImageRegistry,
  fetchImagesInAllProjects,
  fetchLocalImagesInProject,
} from "api/images";
import type { LxdImage } from "types/image";
import { useServerEntitlements } from "util/entitlements/server";

export const useLocalImagesInProject = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: async () => fetchLocalImagesInProject(project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useImagesInAllProjects = (
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images],
    queryFn: async () => fetchImagesInAllProjects(isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

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
