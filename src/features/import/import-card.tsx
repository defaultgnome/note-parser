import { FileUp, Trash2 } from "lucide-react";
import mammoth from "mammoth";
import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { useConsoleStore } from "~/features/console/console-store";
import { PreProcessingCard } from "./pre-processing-card";

export function ImportCard({ rawText, setRawText }: Props) {
  const error = useConsoleStore((s) => s.error);
  const debug = useConsoleStore((s) => s.debug);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFileToUpload = (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          setRawText(result.value);
          debug(".docx File parsed successfully");
        } catch (err) {
          console.error(err);
          error("Failed to parse .docx file. See DevTools for more details.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawText(text);
        debug("File parsed successfully");
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Source</CardTitle>
        <CardDescription>
          Select a file or paste raw text to begin processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".txt,.docx"
              className="hidden"
              ref={fileInputRef}
              onChange={selectFileToUpload}
            />
            <FileUp className="h-4 w-4" />
            Select File
          </Button>
          <p className="text-muted-foreground text-sm">
            Supports <kbd className="text-primary">.txt</kbd>,{" "}
            <kbd className="text-primary">.docx</kbd>, or paste raw text below.
          </p>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Paste your raw text here..."
            className="min-h-[200px] w-full resize-y"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          {rawText && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground absolute top-2 right-2"
              onClick={() => setRawText("")}
              aria-label="Clear text"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <PreProcessingCard rawText={rawText} setRawText={setRawText} />
      </CardFooter>
    </Card>
  );
}

interface Props {
  rawText: string;
  setRawText: Dispatch<SetStateAction<string>>;
}
