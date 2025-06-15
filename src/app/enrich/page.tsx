import { HydrateClient } from "~/trpc/server";
import { EnrichContent } from "~/features/enrich/EnrichContent";

export default function EnrichPage() {
  return (
   <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Enrich Notes</h1>
          <p className="text-muted-foreground">
            Enrich your notes with Various Algorithms.
          </p>
        </div>
        <EnrichContent />
      </div>
    </HydrateClient>
  );
}
