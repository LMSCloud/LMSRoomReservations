// Set lang before any module imports read document.documentElement.lang
document.documentElement.lang = "en";

// Stub global.fetch so loadTranslations (fired at import time) doesn't fail
global.fetch = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({}), { status: 200 })),
) as unknown as typeof fetch;
