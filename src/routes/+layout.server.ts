import type { LayoutServerLoad } from './$types';
import { loadAll } from "$lib/functions/saving"

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.auth()
  }
}

// Attempt to load saved settings in browser only
try {
  if (typeof window !== 'undefined') {
    loadAll()
  }
} catch (e) {}