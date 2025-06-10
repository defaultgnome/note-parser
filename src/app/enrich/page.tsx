import { HydrateClient } from "~/trpc/server";

export default async function EnrichPage() {
  return (
    <HydrateClient>
      <h1>Enrich</h1>
    </HydrateClient>
  );
}
