# Note Parser

Note Parser is here to help you parse semi-structured notes into strict JSONs.

## Prerequisites

Make sure you have [Ollama](https://ollama.com/) installed and running, with your model downloaded, by default
it uses the [`gemma3:latest`](https://ollama.com/library/gemma3) model.

Also have [Bun](https://bun.sh/) installed .

Run:

```sh
bun install
bun run dev
```

Then open `http://localhost:3000` in your browser.

## Flow

![./docs/data-pipeline.png]

In the web studio, you have two tabs: **Import**, **Edit**.
You import docx file with Import, and then Edit the entries and confirm them in the Edit page.

## TODO

- add package.json scripts
- core logic package
  - add dependecies logs (missing ollama, etc...)
  - options for config
- expose with cli
  - use config file
- expose with web frontend
  - use config file
  - add new article form?
  - add form to update data before save
- save to local sqllite db
  - db browser?
