import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTelemetry } from "@/lib/repository";
import { CREW_IDS, type CrewId } from "@/lib/types";
import Mission from "@/components/mission";
export function generateStaticParams() {
  return CREW_IDS.map((id) => ({ id }));
}
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!CREW_IDS.includes(id as CrewId)) notFound();
  return (
    <Suspense
      fallback={
        <main id="main" className="page">
          Loading crew profile…
        </main>
      }
    >
      <Mission rows={getTelemetry()} crewId={id as CrewId} detail />
    </Suspense>
  );
}
