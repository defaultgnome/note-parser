export const algorithms = [
  {
    name: "trim",
    label: "Trim Whitespaces",
    description: "Trim whitespaces and new lines from the text",
    isDisabled: false,
    process: async (rawText: string) => {
      return rawText
        .trim()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .join("\n");
    },
    config: undefined,
  },
  {
    name: "simple-pack-with-title",
    label: "Simple Pack with Title",
    description:
      "Pack all items with title. The title is the line that starts with the keyword.",
    isDisabled: false,
    process: async (rawText: string, config: { keyword: string }) => {
      const keyword = config.keyword;
      let title = "";
      let content: string[] = [];
      for (const line of rawText.split("\n")) {
        if (line.trim().startsWith(keyword)) {
          title = line;
          continue;
        } else {
          content.push(`${title}, ${line}`);
        }
      }
      return content.join("\n");
    },
    config: {
      keyword: {
        type: "text" as const,
        label: "Keyword",
        defaultValue: "גזרת",
        description:
          "The keyword to match the title lines. If a match is found line will be considered as a title, and all items below will be packed with title.",
      },
    },
  },
  {
    name: "simple-prefix",
    label: "Simple Prefix",
    description: "Add a prefix to each line.",
    isDisabled: false,
    process: async (rawText: string, config: { prefix: string }) => {
      return rawText
        .split("\n")
        .map((v) => `${config.prefix} ${v}`)
        .join("\n");
    },
    config: {
      prefix: {
        type: "text" as const,
        label: "Prefix",
        defaultValue: "",
      },
    },
  },
] as const;
export type AlgorithmName = (typeof algorithms)[number]["name"];
