/**
 * Routes that render fullscreen call shells without the doctor app Sidebar.
 * Sidebar is opt-in per page today; keep this list in sync when adding call UIs.
 */
export const FULLSCREEN_CALL_ROUTES = [
  '/digital-clinic',
  '/session/call',
  '/doctor/meetings',
];

export function isFullscreenCallRoute(pathname) {
  return FULLSCREEN_CALL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
