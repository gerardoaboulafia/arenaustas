import { Suspense } from "react";
import { getTelemetry } from "@/lib/repository";
import Scenarios from "@/components/scenarios";
export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="main" className="page">
          Loading planning comparison…
        </main>
      }
    >
      <Scenarios rows={getTelemetry()} />
    </Suspense>
  );
}
