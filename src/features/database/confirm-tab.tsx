"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { NoteForm } from "./note-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";

export function ConfirmTab() {
    const [currentPage, setCurrentPage] = useState(0);
    const { data: unconfirmedNotes, refetch } = api.notes.getUnconfirmed.useInfiniteQuery({
        limit: 1,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const { mutate: updateAndConfirm } = api.notes.updateAndConfirm.useMutation();

    const currentNote = unconfirmedNotes?.pages[currentPage]?.items[0];
    const totalPages = unconfirmedNotes?.pages[0]?.items.length ?? 0;

    const handleNext = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(0, prev - 1));
    };

    if (!currentNote) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No unconfirmed notes found.</p>
            </div>
        );
    }

    return (
        <Card className="space-y-6">
            <CardHeader>
                <CardTitle>Confirm Notes</CardTitle>
                <CardDescription>
                    Review and confirm notes from raw imports.
                </CardDescription>

                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Note {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={!unconfirmedNotes?.pages[currentPage]?.hasMore}
                    >
                        Next
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Raw Note</h3>
                    <p className="text-muted-foreground">{currentNote.rawNote.value}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Note</h3>
                    <NoteForm
                        initialValues={{
                            description: currentNote.note.description,
                            date: currentNote.note.date ?? undefined,
                            time: currentNote.note.time ?? undefined,
                            eventType: currentNote.note.eventType ? [currentNote.note.eventType] : undefined,
                            sector: currentNote.note.sector ?? undefined,
                            location: currentNote.note.location ?? undefined,
                            lat: currentNote.note.lat ?? undefined,
                            lng: currentNote.note.lng ?? undefined,
                        }}
                        onSubmit={(data) => {
                            updateAndConfirm({
                                noteId: currentNote.note.id,
                                ...data,
                            });
                            refetch();
                        }}
                        submitLabel="Confirm"
                    />
                </div>
            </CardContent>
        </Card>

    );
} 