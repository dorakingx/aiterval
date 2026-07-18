export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    {
      error: "feature_archived",
      message:
        "Runtime exercise generation is not part of the submitted AIterval product.",
    },
    { status: 410 },
  );
}
