import 'server-only';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// MD materi Dōjō → HTML di server (bundle klien tetap ringan). Isinya file milik sendiri,
// jadi aman disisipkan; catatan pengguna TIDAK lewat sini (ditampilkan sebagai teks biasa).
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeHighlight, { detect: false })
  .use(rehypeStringify);

export async function mdToHtml(md: string): Promise<string> {
  return String(await processor.process(md));
}

export type TocItem = { id: string; text: string; depth: number };

export function tocFromHtml(html: string): TocItem[] {
  const out: TocItem[] = [];
  for (const m of html.matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)) {
    out.push({ depth: Number(m[1]), id: m[2], text: m[3].replace(/<[^>]+>/g, '').replace(/&#x26;/g, '&').replace(/&amp;/g, '&') });
  }
  return out;
}
