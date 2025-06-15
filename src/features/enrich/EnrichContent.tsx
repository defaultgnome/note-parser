
"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Sparkles, Map } from "lucide-react";
import { useState } from "react";
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { useConsoleStore } from "../console/console-store";
import { Card, CardContent } from "~/components/ui/card";

export function EnrichContent() {
    const [radioValue, setRadioValue] = useState("new");
    const [selectedId, setSelectedId] = useState("");
    const [model, setModel] = useState("gemma3:latest");
    const error = useConsoleStore((s) => s.error);
    const success = useConsoleStore((s) => s.success);
    const enrichMutation = api.notes.enrichRawNotes.useMutation({
        onSuccess: (data) => {
            if (!data.isSuccess) {
                error(data.message);
            } else {
                success(data.message);
            }
        },
    });

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
                <TabsTrigger className="cursor-pointer" value="geo">
                    <Map className="mr-2" /> Geo
                </TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="max-w-xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Enrichment</CardTitle>
                        <CardDescription>Use an LLM to parsed the Raw Notes into a structured format.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                </Card>
                {enrichMutation.isSuccess && !enrichMutation.data.isSuccess && <Card color="destructive">
                    <CardHeader>
                        <CardTitle>Error - {enrichMutation.data.message}</CardTitle>
                        <CardDescription>{enrichMutation.data.description}</CardDescription>
                    </CardHeader>
                </Card>}
            </TabsContent>
            <TabsContent value="geo">
                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Geo Enrichment</CardTitle>
                        <CardDescription>Use an LLM & Google Maps API to enrich the notes with geo-location.</CardDescription>
                    </CardHeader>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
