
"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Sparkles, Map } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useConsoleStore } from "../console/console-store";

export function EnrichContent() {
    const [radioValue, setRadioValue] = useState("new");
    const [selectedId, setSelectedId] = useState("");
    const [model, setModel] = useState("gemma3:latest");
    const enrichMutation = api.notes.enrichRawNotes.useMutation();
    const error = useConsoleStore((s) => s.error);

    const enrich = () => {
        if (radioValue === "id" && !selectedId) {
            error("Please select an ID");
            return;
        }
        if (radioValue === "id") {
            enrichMutation.mutate({
                model,
                mode: "id",
                id: parseInt(selectedId),
            });
        } else {
            enrichMutation.mutate({
                model,
                mode: "new",
            });
        }
    };

    return (
        <Tabs defaultValue="ai" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger className="cursor-pointer" value="ai">
                    <Sparkles className="mr-2" /> AI
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="geo" disabled>
                    <Map className="mr-2" /> Geo
                </TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
                <div className="space-y-6 max-w-md">
                    <div>
                        <label className="block text-sm font-medium mb-1">LLM Model</label>
                        <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemma3:latest">gemma3:latest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-lg border p-4 bg-muted/50">
                        <RadioGroup value={radioValue} onValueChange={setRadioValue} className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="radio-new" />
                                <label htmlFor="radio-new" className="text-sm font-medium cursor-pointer">
                                    Enrich new raw notes
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="id" id="radio-id" />
                                <label htmlFor="radio-id" className="text-sm font-medium cursor-pointer">
                                    Select one
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="id"
                                    className="w-20 ml-2"
                                    value={selectedId}
                                    onChange={e => setSelectedId(e.target.value)}
                                    disabled={radioValue !== "id"}
                                />
                            </div>
                        </RadioGroup>
                    </div>
                    <Button
                        className="w-full h-14 text-lg font-bold"
                        size="lg"
                        color="primary"
                        disabled={enrichMutation.isPending}
                        onClick={enrich}
                    >
                        {enrichMutation.isPending ? "Running..." : "RUN"}
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="geo">
                <div className="text-center text-muted-foreground py-8">
                    Geo enrichment coming soon.
                </div>
            </TabsContent>
        </Tabs>
    );
}
