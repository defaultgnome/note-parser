import { HydrateClient } from "~/trpc/server";

export default async function AnalyzePage() {
  return (
    <HydrateClient>
      <h1>analyze</h1>
    </HydrateClient>
  );
}
