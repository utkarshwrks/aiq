import { describe, expect, it } from 'vitest';
import { SUMMARY_MAX, summarise } from '../../worker/pipeline/summarise';

describe('summarise', () => {
  it('takes the leading sentence', () => {
    expect(
      summarise(
        'Researchers demonstrated a new gate. Further work is planned for next year.',
        'A headline about gates',
      ),
    ).toBe('Researchers demonstrated a new gate.');
  });

  it('never exceeds the character cap', () => {
    const long = `${'word '.repeat(200)}.`;
    const result = summarise(long, 'Some unrelated headline');
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(SUMMARY_MAX);
  });

  it('truncates on a word boundary', () => {
    const long = `${'quantum '.repeat(60)}end.`;
    const result = summarise(long, 'Headline')!;

    expect(result.endsWith('...')).toBe(true);

    // The real property: what survives is a prefix of the source that
    // ends where a space was, so no word is ever cut in half.
    const body = result.slice(0, -3);
    expect(long.startsWith(body)).toBe(true);
    expect(long[body.length]).toBe(' ');
  });

  it('strips the arXiv abstract preamble', () => {
    const result = summarise(
      'Abstract: We present a scheme for suppressing decoherence in trapped ions.',
      'Suppressing decoherence',
    );
    expect(result?.startsWith('We present')).toBe(true);
  });

  it('removes feed boilerplate', () => {
    expect(
      summarise('The post Some Title appeared first on Example Blog.', 'x'),
    ).toBeNull();
  });

  it('returns null rather than padding when there is nothing usable', () => {
    expect(summarise('', 'A headline')).toBeNull();
    expect(summarise('short', 'A headline')).toBeNull();
    expect(summarise(undefined, 'A headline')).toBeNull();
  });

  it('returns null when the description merely restates the headline', () => {
    const title = 'IBM announces a new quantum processor roadmap update';
    expect(summarise(`${title} for the coming year.`, title)).toBeNull();
  });
});
