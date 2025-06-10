import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { algorithms, type AlgorithmName } from "./algorithmes";
import {
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useConsoleStore } from "../console/console-store";

export function PreProcessingCard({ rawText, setRawText }: Props) {
  const [isProcessing, startProcessingTransition] = useTransition();
  const error = useConsoleStore((s) => s.error);
  const debug = useConsoleStore((s) => s.debug);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmName | null>(null);
  const [algoConfig, setAlgoConfig] = useState<Record<string, any>>({});

  const selectAlgo = (algoName: string) => {
    const algo = algorithms.find((alg) => alg.name === algoName);
    if (!algo) {
      throw new Error(
        "UNREACHABLE: algo in select must match predefined algos",
      );
    }
    setSelectedAlgo(algo.name as AlgorithmName);

    // Set default config for the selected algorithm
    if (algo.config) {
      const defaultConfig = Object.entries(algo.config).reduce(
        (acc, [key, value]) => {
          acc[key] = value.defaultValue;
          return acc;
        },
        {} as Record<string, any>,
      );
      setAlgoConfig(defaultConfig);
    } else {
      setAlgoConfig({});
    }
    debug(`Algorithm '${algoName}' selected`);
  };

  const handleConfigChange = (key: string, value: any) => {
    setAlgoConfig((prev) => ({ ...prev, [key]: value }));
    debug(`Algorithm config changed: '${key}' = '${value}'`);
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
      const algo = algorithms.find((alg) => alg.name === selectedAlgo);
      if (!algo) {
        error("Failed to find selected algorithm.");
        return;
      }
      const processedText = await (algo.process as any)(rawText, algoConfig);
      if (!processedText) {
        error("Failed to process text.");
        return;
      }
      setRawText(processedText);
      debug(`Text processed successfully`);
    });
  };

  const selectedAlgoData = algorithms.find((alg) => alg.name === selectedAlgo);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pre Process</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="algorithm-select">Algorithm</Label>
          <Select onValueChange={selectAlgo}>
            <SelectTrigger id="algorithm-select" className="w-[200px]">
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
          {selectedAlgoData?.description && (
            <p className="text-muted-foreground text-sm">
              {selectedAlgoData.description}
            </p>
          )}
        </div>
        {selectedAlgoData?.config && (
          <div className="max-w-sm space-y-4">
            {Object.entries(selectedAlgoData.config).map(([key, config]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{config.label}</Label>
                <Input
                  id={key}
                  type={config.type}
                  value={algoConfig[key] ?? ""}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                />
                <p className="text-muted-foreground text-sm">
                  {config.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={processFile} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface Props {
  rawText: string;
  setRawText: Dispatch<SetStateAction<string>>;
}
