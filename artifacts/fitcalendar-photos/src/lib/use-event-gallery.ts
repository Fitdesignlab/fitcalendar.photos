import { useGetEventGallery, getGetEventGalleryQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/context/auth';

export { getGetEventGalleryQueryKey };
export function useEventGallery(eventId: string) {
  const { user } = useAuth();
  return useGetEventGallery(eventId, {
    request: { credentials: 'same-origin' },
    query: {
      enabled: eventId === '369',
      queryKey: [...getGetEventGalleryQueryKey(eventId), user?.id ?? 'public'],
      staleTime: 0,
      refetchInterval: 15_000,
      refetchOnWindowFocus: true,
    },
  });
}
