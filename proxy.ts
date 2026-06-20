import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ?.split(":")[0] || "makeurfolio.com";

export function proxy(req: NextRequest) {
  const host =
    (req.headers.get("host") || "")
      .split(":")[0]
      .toLowerCase();

  const reserved = ["www", "api", "dashboard"];

  if (
    host.endsWith(ROOT_DOMAIN) &&
    host !== ROOT_DOMAIN
  ) {
    const subdomain = host.replace(
      `.${ROOT_DOMAIN}`,
      ""
    );

    if (!reserved.includes(subdomain)) {
      return NextResponse.rewrite(
        new URL(
          `/portfolio/${subdomain}`,
          req.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)",
  ],
};