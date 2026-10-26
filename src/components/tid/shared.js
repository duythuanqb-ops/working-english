// Shared helpers for the TID module.

// Public-folder asset URL that works both in Vite dev and in the Electron file:// build (vite base './').
export const asset = p => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
