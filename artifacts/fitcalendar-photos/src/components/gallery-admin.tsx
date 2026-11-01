import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Trash2, Upload, X } from 'lucide-react';
import {
  useCompleteGalleryUpload,
  useDeleteGalleryPhoto,
  useRequestGalleryUpload,
  type GalleryPhoto,
  type GalleryUploadInputMime,
} from '@workspace/api-client-react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 20 * 1024 * 1024;

type Status = 'queued' | 'requesting' | 'uploading' | 'processing' | 'done' | 'error' | 'cancelled';
type Item = { key: string; file: File; status: Status; progress: number; error?: string };

const LABEL: Record<Status, string> = {
  queued: 'Waiting', requesting: 'Preparing', uploading: 'Uploading', processing: 'Checking image',
  done: 'Published', error: 'Failed', cancelled: 'Cancelled',
};

function size(n: number) {
  return n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
}

function message(e: unknown) {
  if (e && typeof e === 'object') {
    const d = (e as { data?: { error?: string; message?: string } }).data;
    if (d?.error) return d.error;
    if (d?.message) return d.message;
  }
  return e instanceof Error && e.message ? e.message : 'Upload failed. Try again.';
}

function putFile(url: string, file: File, signal: AbortSignal, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    const settle = (fn: () => void) => { signal.removeEventListener('abort', onAbort); fn(); };
    xhr.open('PUT', url);
    xhr.withCredentials = false;
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) onProgress(ev.loaded / ev.total); };
    xhr.onload = () => settle(() => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Storage rejected the file (' + xhr.status + ').'))));
    xhr.onerror = () => settle(() => reject(new Error('Network error while sending the file.')));
    xhr.onabort = () => settle(() => reject(new DOMException('Aborted', 'AbortError')));
    signal.addEventListener('abort', onAbort, { once: true });
    xhr.send(file);
  });
}

export function GalleryAdmin({ eventId, photos, onChanged }: { eventId: string; photos: GalleryPhoto[]; onChanged: () => Promise<unknown> }) {
  const [controller, setController] = useState(() => new AbortController());
  const ctrlRef = useRef(controller);
  ctrlRef.current = controller;
  const req = { request: { credentials: 'same-origin' as const, signal: controller.signal } };
  const requestUpload = useRequestGalleryUpload(req);
  const completeUpload = useCompleteGalleryUpload(req);
  const deletePhoto = useDeleteGalleryPhoto(req);

  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [delError, setDelError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;
  const reqRef = useRef(requestUpload.mutateAsync);
  reqRef.current = requestUpload.mutateAsync;
  const compRef = useRef(completeUpload.mutateAsync);
  compRef.current = completeUpload.mutateAsync;

  useEffect(() => () => ctrlRef.current.abort(), []);

  const patch = (key: string, p: Partial<Item>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...p } : x)));

  async function run(queue: Item[], signal: AbortSignal) {
    setRunning(true);
    for (const it of queue) {
      if (signal.aborted) break;
      try {
        patch(it.key, { status: 'requesting' });
        const ticket = await reqRef.current({ eventId, data: { name: it.file.name, mime: it.file.type as GalleryUploadInputMime, size: it.file.size } });
        if (signal.aborted) break;
        patch(it.key, { status: 'uploading' });
        await putFile(ticket.uploadUrl, it.file, signal, (p) => patch(it.key, { progress: p }));
        if (signal.aborted) break;
        patch(it.key, { status: 'processing', progress: 1 });
        await compRef.current({ eventId, photoId: ticket.id });
        if (signal.aborted) break;
        patch(it.key, { status: 'done' });
        await onChangedRef.current();
      } catch (e) {
        if (signal.aborted) break;
        patch(it.key, { status: 'error', error: message(e) });
      }
    }
    if (signal.aborted) {
      const keys = new Set(queue.map((q) => q.key));
      setItems((xs) => xs.map((x) => (keys.has(x.key) && !['done', 'error'].includes(x.status) ? { ...x, status: 'cancelled' } : x)));
    } else setRunning(false);
  }

  function pick(files: FileList | null) {
    if (!files?.length || running) return;
    const next: Item[] = Array.from(files).map((file, i) => {
      const key = Date.now() + '-' + i + '-' + file.name;
      if (!ALLOWED.includes(file.type)) return { key, file, status: 'error', progress: 0, error: 'Only JPEG, PNG or WebP.' };
      if (file.size === 0) return { key, file, status: 'error', progress: 0, error: 'File is empty.' };
      if (file.size > MAX) return { key, file, status: 'error', progress: 0, error: 'Larger than 20 MB.' };
      return { key, file, status: 'queued', progress: 0 };
    });
    setItems(next);
    if (inputRef.current) inputRef.current.value = '';
    const queue = next.filter((x) => x.status === 'queued');
    if (queue.length) void run(queue, controller.signal);
  }

  function cancel() {
    controller.abort();
    setController(new AbortController());
    setRunning(false);
  }

  async function remove(id: string) {
    setDeleting(id); setDelError(null);
    try {
      await deletePhoto.mutateAsync({ eventId, photoId: id });
      setConfirm(null);
      await onChanged();
    } catch (e) {
      if (!controller.signal.aborted) setDelError(message(e));
    } finally { setDeleting(null); }
  }

  const done = items.filter((x) => x.status === 'done').length;
  const failed = items.filter((x) => x.status === 'error').length;

  return (
    <section className="mt-12 rounded-[28px] border border-[#E5E5E5] p-5 sm:p-7" data-testid="panel-gallery-admin" aria-label="Manage gallery">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#6E6E73]">Admin</p>
          <h2 className="mt-1 font-[Inter_Tight] text-[24px] font-bold tracking-[-0.025em]">Add photographs</h2>
          <p className="mt-1 text-[14px] text-[#6E6E73]">JPEG, PNG or WebP, up to 20 MB each.</p>
          <p className="mt-1 text-[13px] text-[#9A9A9E]" data-testid="text-visibility-note">Gallery previews are public. Downloading originals requires Google sign-in.</p>
        </div>
        <div className="flex gap-2">
          {running && (
            <button onClick={cancel} data-testid="button-cancel-uploads" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D9D9D9] px-5 text-[14px] font-medium hover:border-black">
              <X className="h-4 w-4" aria-hidden /> Cancel
            </button>
          )}
          <label className={'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-black px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 ' + (running ? 'pointer-events-none opacity-40' : '')}>
            <Upload className="h-4 w-4" aria-hidden /> Choose files
            <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={running}
              onChange={(e) => pick(e.target.files)} className="sr-only" data-testid="input-upload-files" />
          </label>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] text-[#6E6E73]" data-testid="text-upload-summary" aria-live="polite">
            {done} of {items.length} published{failed ? ', ' + failed + ' failed' : ''}{running ? '' : '.'}
          </p>
          <ul className="mt-3 divide-y divide-[#EFEFEF]">
            {items.map((x, i) => (
              <li key={x.key} className="py-3" data-testid={'row-upload-' + i}>
                <div className="flex items-center justify-between gap-4 text-[14px]">
                  <span className="min-w-0 truncate font-medium">{x.file.name}</span>
                  <span className={'shrink-0 ' + (x.status === 'error' ? 'text-[#101410] font-medium' : 'text-[#6E6E73]')} data-testid={'status-upload-' + i}>
                    {LABEL[x.status]}{x.status === 'uploading' ? ' ' + Math.round(x.progress * 100) + '%' : ''} <span className="text-[#9A9A9E]">{size(x.file.size)}</span>
                  </span>
                </div>
                {['requesting', 'uploading', 'processing', 'done'].includes(x.status) && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div className="h-full origin-left rounded-full bg-black transition-transform duration-200" style={{ transform: 'scaleX(' + (x.status === 'done' ? 1 : x.progress) + ')' }} />
                  </div>
                )}
                {x.error && <p className="mt-1 text-[13px] text-[#5E5E61]">{x.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-6 border-t border-[#EFEFEF] pt-4">
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} data-testid="button-toggle-manage"
            className="inline-flex items-center gap-2 rounded-full text-[14px] font-medium text-[#6E6E73] hover:text-[#101410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
            Manage {photos.length} {photos.length === 1 ? 'file' : 'files'}
            <ChevronDown className={'h-4 w-4 transition-transform ' + (open ? 'rotate-180' : '')} aria-hidden />
          </button>
          {open && (
            <ul className="mt-3 max-h-80 divide-y divide-[#EFEFEF] overflow-y-auto">
              {delError && <li className="py-2 text-[13px] text-[#5E5E61]" data-testid="status-delete-error">{delError}</li>}
              {photos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]" data-testid={'row-photo-' + p.id}>
                  <span className="min-w-0 truncate">{p.originalName || p.file}</span>
                  {confirm === p.id ? (
                    <span className="flex shrink-0 gap-2">
                      <button onClick={() => setConfirm(null)} disabled={deleting === p.id} data-testid={'button-keep-' + p.id} className="h-9 rounded-full border border-[#D9D9D9] px-4 text-[13px] font-medium hover:border-black">Keep</button>
                      <button onClick={() => void remove(p.id)} disabled={deleting === p.id} data-testid={'button-confirm-delete-' + p.id} className="h-9 rounded-full bg-black px-4 text-[13px] font-medium text-white hover:opacity-85 disabled:opacity-50">
                        {deleting === p.id ? 'Removing' : 'Remove'}
                      </button>
                    </span>
                  ) : (
                    <button onClick={() => { setConfirm(p.id); setDelError(null); }} aria-label={'Remove ' + (p.originalName || p.file)} data-testid={'button-delete-' + p.id}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6E6E73] hover:bg-[#F2F2F2] hover:text-[#101410]">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
