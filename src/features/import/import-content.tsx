"use client";

import { useState } from "react";
import { ImportCard } from "./import-card";
import { RawNotesTable } from "./raw-notes-table";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { useConsoleStore } from "../console/console-store";

export function ImportContent() {
  const warn = useConsoleStore((s) => s.warning);
  const success = useConsoleStore((s) => s.success);
  const [rawText, setRawText] = useState("");
  const rawNotes =
    rawText.trim().length > 0
      ? rawText
          .trim()
          .split("\n")
          .map((v) => ({ value: v }))
      : [];
  const saveNotesMuatation = api.notes.saveRawNotes.useMutation();
  const saveNotes = async () => {
    if (rawNotes.length === 0) {
      warn("No notes to save");
      return;
    }
    await saveNotesMuatation.mutateAsync(rawNotes);
    success(`${rawNotes.length} notes saved`);
    setRawText("");
  };
  return (
    <>
      <ImportCard rawText={rawText} setRawText={setRawText} />
      <Separator />
      <RawNotesTable rawNotes={rawNotes} saveNotes={saveNotes} />
    </>
  );
}
