import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { FileUp, Trash2 } from "lucide-react";
import mammoth from "mammoth";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useConsoleStore } from "~/features/console/console-store";

export function ImportCard({ rawText, setRawText }: Props) {
  const [isProcessing, startProcessingTransition] = useTransition();
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithms | null>(null);
  const { info, error } = useConsoleStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectAlgo = (algo: string) => {
    if (!algorithms.some((alg) => alg.name === algo)) {
      throw new Error(
        "UNREACHABLE: algo in select must match predefined algos",
      );
    }
    setSelectedAlgo(algo as Algorithms);
  };

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
        } catch (err) {
          console.error(err);
          error("Failed to parse .docx file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawText(text);
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = () => {
    if (!rawText.trim()) {
      error("Cannot process empty text.");
      return;
    }
    if (!selectedAlgo) {
      error("Please select a processing algorithm.");
      return;
    }
    startProcessingTransition(async () => {
      const processedText = await algorithms
        .find((alg) => alg.name === selectedAlgo)
        ?.process(rawText);
      if (!processedText) {
        error("Failed to process text.");
        return;
      }
      setRawText(processedText);
    });
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
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <Select onValueChange={selectAlgo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((alg) => (
                <SelectItem
                  key={alg.name}
                  value={alg.name}
                  disabled={alg.isDisabled}
                >
                  {alg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={processFile} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Process"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const algorithms = [
  {
    name: "trim",
    label: "Trim Whitespaces",
    isDisabled: false,
    process: async (rawText: string) => {
      return rawText
        .trim()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .join("\n");
    },
  },
  {
    name: "pack-with-title",
    label: "Pack with Title",
    isDisabled: false,
    process: async (rawText: string) => {
      return rawText;
    },
  },
] as const;
type Algorithms = (typeof algorithms)[number]["name"];

interface Props {
  rawText: string;
  setRawText: Dispatch<SetStateAction<string>>;
}
