import { cleanText } from './normalize';

/**
 * Summary generation.
 *
 * The panel curates and links out; it must never republish. That places
 * a hard ceiling on what this stage may emit: a single short line whose
 * job is to tell the reader whether the link is worth following, not to
 * substitute for it.
 *
 * Without a language model in the loop this is necessarily a compression
 * rather than a paraphrase, so the constraints are enforced structurally
 * instead of trusted: one sentence, a hard character cap well below any
 * reasonable fair-use threshold, feed boilerplate removed, and the item
 * dropped rather than padded when there is nothing usable to say.
 */

export const SUMMARY_MAX = 180;

/**
 * Prefixes and suffixes that feeds attach to every description and that
 * carry no information about the specific item.
 */
const BOILERPLATE = [
  /^\s*the post .*? appeared first on .*$/i,
  /^\s*read more.*$/i,
  /^\s*continue reading.*$/i,
  /^\s*this (article|post) (originally )?appeared.*$/i,
  /^\s*share this.*$/i,
  /^\s*\[.*?\]\s*$/,
  /^\s*by [a-z .'-]+\s*$/i,
];

/**
 * arXiv abstracts open with a fixed preamble that wastes the whole
 * character budget if it is left in place.
 */
const ARXIV_PREAMBLE = /^\s*abstract:?\s*/i;

function stripBoilerplate(input: string): string {
  let text = input.replace(ARXIV_PREAMBLE, '');
  for (const pattern of BOILERPLATE) {
    text = text.replace(pattern, '');
  }
  return text.trim();
}

/**
 * Takes the leading sentence. Abbreviations that end in a period would
 * otherwise cut a sentence in half, so a candidate break is only
 * accepted when what follows looks like the start of a new sentence.
 */
function firstSentence(input: string): string {
  const match = input.match(/^.*?[.!?](?=\s+[A-Z(]|\s*$)/s);
  return (match?.[0] ?? input).trim();
}

/**
 * Truncates on a word boundary and marks the elision. Never cuts
 * mid-word: a summary that ends in half a technical term is worse than
 * one that ends early.
 */
function truncate(input: string, limit: number): string {
  if (input.length <= limit) return input;

  const clipped = input.slice(0, limit - 3);
  const lastSpace = clipped.lastIndexOf(' ');
  const body = lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped;

  return `${body.replace(/[,;:.\-\s]+$/, '')}...`;
}

/**
 * Produces the panel line for an item, or null when the source gives us
 * nothing usable. Returning null is the correct outcome: an item with no
 * summary is dropped rather than shown with an empty body or with its
 * own headline repeated underneath it.
 */
export function summarise(
  rawSummary: string | undefined | null,
  title: string,
): string | null {
  const cleaned = stripBoilerplate(cleanText(rawSummary));
  if (cleaned.length < 24) return null;

  const sentence = firstSentence(cleaned);
  const summary = truncate(sentence, SUMMARY_MAX);

  // A description that merely restates the headline adds nothing, and
  // showing it makes the panel look padded.
  const normalisedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalisedSummary = summary.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (
    normalisedSummary.startsWith(normalisedTitle.slice(0, 40)) &&
    normalisedTitle.length > 20
  ) {
    return null;
  }

  return summary;
}

/**
 * TODO: replace with a model-generated paraphrase.
 *
 * The signature is the contract: given the source's own description and
 * the headline, return one line under SUMMARY_MAX characters or null. A
 * model implementation must keep the null case - it is what stops the
 * panel padding itself with restated headlines - and must fall back to
 * the compression above when generation fails.
 */
export type Summariser = (
  rawSummary: string | undefined | null,
  title: string,
) => string | null;

export const activeSummariser: Summariser = summarise;
