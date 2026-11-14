import { MissionProvider } from "@/components/mission-v2/provider";
import "@/components/mission-v2/mission-v2.css";
import "@/components/mission-v2/controls.css";
import { Suspense } from "react";
export default function MissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MissionProvider>
      <Suspense
        fallback={
          <main id="main" className="page">
            Loading ASTRA mission…
          </main>
        }
      >
        {children}
      </Suspense>
    </MissionProvider>
  );
}
