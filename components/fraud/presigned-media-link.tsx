"use client";

type PresignedMediaLinkProps = {
  url: string;
  label?: string;
  onExpired?: () => void;
};

export function PresignedMediaLink({
  url,
  label = "Open media",
  onExpired
}: PresignedMediaLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-400 underline hover:text-emerald-300"
      onClick={() => {
        // Presigned URLs expire after ~15 minutes; refetch packet if link fails.
        if (onExpired) {
          window.setTimeout(() => {
            /* no-op — user may report 403 manually */
          }, 0);
        }
      }}
      onAuxClick={() => onExpired?.()}
    >
      {label}
    </a>
  );
}

export function PresignedMediaList({
  items,
  onExpired
}: {
  items: Array<{ url?: string | null }>;
  onExpired?: () => void;
}) {
  const urls = items.map((i) => i.url).filter(Boolean) as string[];
  if (!urls.length) return <span className="text-slate-500">—</span>;

  return (
    <ul className="space-y-1 text-xs">
      {urls.map((url, idx) => (
        <li key={`${url}-${idx}`}>
          <PresignedMediaLink
            url={url}
            label={`Attachment ${idx + 1}`}
            onExpired={onExpired}
          />
        </li>
      ))}
    </ul>
  );
}
