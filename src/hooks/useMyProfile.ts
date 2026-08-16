import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/auth.functions";

export function useMyProfile() {
  const getProfile = useServerFn(getMyProfile);
  
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry auth-sensitive profile calls to avoid infinite loops on failure
  });
}
