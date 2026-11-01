import { useEffect } from 'react';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !tag;
    if (!tag) { tag = document.createElement('meta'); tag.name = 'description'; document.head.appendChild(tag); }
    const prevDesc = tag.content;
    document.title = title;
    tag.content = description;
    return () => {
      document.title = prevTitle;
      if (created) tag?.remove(); else if (tag) tag.content = prevDesc;
    };
  }, [title, description]);
}
