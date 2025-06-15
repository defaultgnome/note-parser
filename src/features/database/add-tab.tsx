"use client";
import { api } from "~/trpc/react";
import { NoteForm } from "./note-form";
import { useConsoleStore } from "../console/console-store";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export function AddTab() {
    const success = useConsoleStore(state => state.success);
    const { mutate: saveNote } = api.notes.create.useMutation({
        onSuccess: () => {
            success("Note created successfully");
        },

    });
    return (
        <Card className="space-y-6">
            <CardHeader>
                <CardTitle>Add New Note</CardTitle>
                <CardDescription>
                    Manually create a new note entry.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <NoteForm onSubmit={saveNote} />
            </CardContent>
        </Card>
    );
} 