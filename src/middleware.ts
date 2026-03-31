import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except /api, /s (short links), /_next, /favicon.ico, static files
    "/((?!api|s|_next|favicon\\.ico|.*\\..*).*)",
  ],
};
