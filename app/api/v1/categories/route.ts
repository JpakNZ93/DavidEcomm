import { NextResponse } from "next/server";

import { getCachedCategories } from "@/lib/categories";
import { getNavigationTree } from "@/lib/navigation";

export async function GET() {
  const [categories, navigation] = await Promise.all([
    getCachedCategories(),
    getNavigationTree(),
  ]);

  return NextResponse.json({
    data: categories,
    navigation,
  });
}
