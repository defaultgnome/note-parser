import { HydrateClient } from "~/trpc/server";

export default async function DatabasePage() {
  return (
    <HydrateClient>
      <h1>database</h1>
    </HydrateClient>
  );
}
