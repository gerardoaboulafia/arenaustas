import { Suspense } from "react";
import { getTelemetry } from "@/lib/repository";
import Mission from "@/components/mission";
export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="main" className="page">
          Loading synthetic mission…
        </main>
      }
    >
      <Mission rows={getTelemetry()} crewId="maya-torres" />
    </Suspense>
  );
}
