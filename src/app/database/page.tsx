import { HydrateClient } from "~/trpc/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddTab } from "~/features/database/add-tab";
import { ConfirmTab } from "~/features/database/confirm-tab";

export default async function DatabasePage() {
  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            Add new notes or confirm imported notes.
          </p>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add">Add</TabsTrigger>
            <TabsTrigger value="confirm">Confirm</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <AddTab />
          </TabsContent>
          <TabsContent value="confirm">
            <ConfirmTab />
          </TabsContent>
        </Tabs>
      </div>
    </HydrateClient>
  );
}
