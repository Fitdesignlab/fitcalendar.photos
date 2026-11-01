import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { isAdmin, LIVE_EVENT_ID } from '@/lib/admin';
import { uploadEventPhoto } from '@/lib/gallery';

export function AdminUpload({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!isAdmin(user) || eventId !== LIVE_EVENT_ID) return null;

  const onFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    setError('');
    try {
      for (const file of Array.from(list)) await uploadEventPhoto(eventId, file);
      await cache.invalidateQueries({ queryKey: ['event-photos', eventId] });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="mt-8 rounded-[28px] border border-dashed border-[#D9D9D9] px-6 py-8" data-testid="admin-upload" onSubmit={(event) => event.preventDefault()}>
      <p className="font-[Inter_Tight] text-[22px] font-bold tracking-[-0.02em]">Upload photos</p>
      <p className="mt-2 text-[14px] text-[#6E6E73]">These are the only photos shown in this event gallery.</p>
      <label className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-full bg-black px-5 text-[14px] font-medium text-white hover:opacity-85">
        {busy ? 'Uploading' : 'Choose photos'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          data-testid="input-admin-upload"
          className="sr-only"
          onChange={(event) => { void onFiles(event.target.files); event.target.value = ''; }}
        />
      </label>
      {error && <p role="alert" className="mt-3 text-[14px] text-[#101410]" data-testid="status-admin-upload">{error}</p>}
    </form>
  );
}
