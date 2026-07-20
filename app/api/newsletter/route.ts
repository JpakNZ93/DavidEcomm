import { NextResponse } from "next/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide a valid email address.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    email: parsed.data.email,
  });
}
