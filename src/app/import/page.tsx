import { HydrateClient } from "~/trpc/server";

export default async function ImportPage() {
  return (
    <HydrateClient>
      <h1>Import</h1>
    </HydrateClient>
  );
}
