import { HydrateClient } from "~/trpc/server";
import { ImportContent } from "~/features/import/import-content";

export default async function ImportPage() {
  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Import Raw Notes</h1>
          <p className="text-muted-foreground">
            Import, parse, and pre-process your notes into a raw format.
          </p>
        </div>
        <ImportContent />
      </div>
    </HydrateClient>
  );
}
