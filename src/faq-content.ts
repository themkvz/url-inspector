export type FaqItem = { question: string; answer: string }

// The single source for the FAQ page's visible question/answer pairs and its FAQPage JSON-LD
// (see scripts/build.tsx and src/faq.tsx) - both read this array, so they cannot list different
// content. See openspec/specs/faq-page/spec.md.
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a URL, exactly?',
    answer:
      'A scheme, host, path, query, and fragment, packed into one string. URL Inspector ' +
      'labels and colors each part as you type.',
  },
  {
    question: "What's the difference between raw and decoded?",
    answer:
      'Raw is the exact percent-encoded text; decoded is what it represents once that ' +
      'encoding is undone. Every query value has a raw ⇄ decoded toggle.',
  },
  {
    question: 'Why do some query parameters have no "="?',
    answer:
      'A key with no = at all (like ?debug) is a flag parameter — present but valueless, ' +
      'unlike a present, empty value (?debug=).',
  },
  {
    question: 'Why do URLs show %20 or + for a space?',
    answer:
      "A space in the path is %20. In a form-encoded query string it's usually + instead. " +
      'Both mean the same character.',
  },
  {
    question: "What's the difference between the path and the fragment?",
    answer:
      "The path is sent to the server; the fragment (after #) never is — it's resolved " +
      'entirely in the browser.',
  },
  {
    question: 'Why does my URL look different after I paste it?',
    answer:
      'Browsers normalize URLs — lowercasing the scheme and host, resolving . and .. segments. ' +
      'URL Inspector shows a "Browser sends: ..." line when that happens.',
  },
  {
    question: 'Can I reorder or remove query parameters safely?',
    answer:
      'Yes. Each parameter has its own move and remove controls, and editing one never ' +
      "touches another's raw text.",
  },
  {
    question: 'Does URL Inspector send my URL anywhere?',
    answer:
      'No. It runs entirely in your browser, with no backend, and never sends the URL you type anywhere.',
  },
]

// The FAQ page's own canonical URL - the single literal both this module's JSON-LD and
// faq.html's <link rel="canonical">/og:url/sitemap entry must agree with.
export const FAQ_URL = 'https://url.themkvz.com/faq'

export function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: FAQ_URL,
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
