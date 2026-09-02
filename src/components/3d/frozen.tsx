'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Deterministic capture mode.
 *
 * A scene that animates on a clock cannot be compared against a
 * reference screenshot: the frame that lands is whichever one the
 * capture happened to catch. Appending `?frozen=1` to any route holding
 * a scene pins every animation to a fixed phase and stops the render
 * loop, so the visual regression suite compares like with like.
 *
 * This exists for the test suite and for `scripts/capture.mjs`. It is
 * deliberately a URL parameter rather than a build flag so the frozen
 * pose can be inspected in a real browser, which is how the reference
 * images were reviewed in the first place.
 */

export const FrozenContext = createContext(false);

export function useFrozen(): boolean {
  return useContext(FrozenContext);
}

/**
 * The phase every frozen scene is pinned to, in seconds. Chosen so the
 * circuit's pulse sits mid-run rather than at either end, where a
 * regression that stopped the animation entirely would look correct.
 */
export const FROZEN_TIME = 1.35;

/**
 * Reads the flag from the URL after mount rather than during render.
 * Reading it during render would make the server and client disagree on
 * a page that is statically generated, and this is a test affordance -
 * not worth a dynamic render for.
 */
export function useFrozenFromUrl(): boolean {
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFrozen(params.get('frozen') === '1');
  }, []);

  return frozen;
}
