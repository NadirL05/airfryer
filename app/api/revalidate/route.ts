import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Remplacez 'MON_SUPER_SECRET' par un mot de passe que vous seul connaissez
  if (
    secret !== process.env.REVALIDATION_SECRET &&
    secret !== "mon-code-admin-123"
  ) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag");

  if (tag) {
    revalidateTag(tag, "max");
    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  }

  return NextResponse.json({
    revalidated: false,
    now: Date.now(),
    message: "Missing tag param",
  });
}
