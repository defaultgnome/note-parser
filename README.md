# Note Parser

Note Parser is here to help you parse semi-structured notes into strict JSONs.

## Prerequisites

Make sure you have `ollama` installed and running, with your model downloaded, by default
it uses the `gemma3:latest` model.

Also have `bun` installed.

Run:

```sh
bun install
bun run dev
```

Then open `http://localhost:5173` in your browser.

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
