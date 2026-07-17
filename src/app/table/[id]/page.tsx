import { redirect } from "next/navigation";

// Legacy route kept for backward compatibility with already-printed QR codes.
// Redirects to the new secure session-token flow at /t/table-{id}.
export default async function LegacyTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const isScan = search.scan === "true";
  
  // Forward ?scan=true parameter if present
  redirect(`/t/table-${id}${isScan ? "?scan=true" : ""}`);
}

