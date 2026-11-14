import { notFound } from "next/navigation";
import { CREW_IDS, type CrewId } from "@/lib/types";
import MissionApp from "@/components/mission-v2/app";
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
  return <MissionApp crewId={id} />;
}
