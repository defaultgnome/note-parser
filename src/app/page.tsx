import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to Note Parser!
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-8">
            Your personal studio to transform semi-structured notes into clean,
            organized data, right on your local machine.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-foreground text-2xl font-bold">The Workflow</h2>
            <p className="text-muted-foreground mt-2">
              Note Parser guides you through a simple yet powerful process to
              extract value from your notes. All your data is stored locally in
              a LibSQL (SQLite) database, ensuring your information stays
              private.
            </p>
          </section>

          <section className="bg-muted rounded-lg p-6">
            <h3 className="text-foreground text-xl font-semibold">
              1. Import Your Notes
            </h3>
            <p className="text-muted-foreground mt-2">
              Head over to the{" "}
              <Link href="/import">
                <strong className="text-link">Import</strong>
              </Link>{" "}
              tab to begin. You can upload files in various formats like{" "}
              <code className="text-primary">.txt</code>,{" "}
              <code className="text-primary">.docx</code>, or simply paste raw
              text. Choose a parsing algorithm that best fits your note
              structure. The goal is to get your notes into a basic "raw" table
              format, for example, by tagging each row with a corresponding
              title from your document.
            </p>
            <p className="text-muted-foreground mt-2">
              If a parse isn't perfect, you can manually edit the text. For
              deeper debugging, check the console with{" "}
              <kbd className="text-primary">Ctrl</kbd>+
              <kbd className="text-primary">;</kbd>. For advanced users, you can
              even write your own parsing algorithms to fit unique note-taking
              styles.
            </p>
          </section>

          <section className="bg-muted rounded-lg p-6">
            <h3 className="text-foreground text-xl font-semibold">
              2. Enrich with AI
            </h3>
            <p className="text-muted-foreground mt-2">
              Next, in the{" "}
              <Link href="/enrich">
                <strong className="text-link">Enrich</strong>
              </Link>{" "}
              tab, we use the power of AI to bring structure to your raw data.
              We leverage a local AI model through Ollama to parse the raw text
              into structured columns.
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Important:</strong> Please ensure you have{" "}
              <Link
                href="https://ollama.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                Ollama
              </Link>{" "}
              installed and are running the{" "}
              <code className="text-primary">gemma3:latest</code> model.
            </p>
          </section>

          <section className="bg-muted rounded-lg p-6">
            <h3 className="text-foreground text-xl font-semibold">
              3. View and Confirm Your Data
            </h3>
            <p className="text-muted-foreground mt-2">
              The{" "}
              <Link href="/database">
                <strong className="text-link">Database</strong>
              </Link>{" "}
              tab is where you can see your structured data. It's split into two
              parts:
            </p>
            <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2">
              <li>
                <strong>Explore:</strong> Freely browse all your parsed and
                enriched data in a table view.
              </li>
              <li>
                <strong>Confirm:</strong> This is a crucial step for data
                quality. Go through each unconfirmed entry one-by-one. You'll
                see the original raw text side-by-side with the AI-parsed data.
                You can edit and save each entry to ensure it's accurate.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-2xl font-bold">What's Next?</h2>
            <p className="text-muted-foreground mt-2">
              We're constantly working on making Note Parser more powerful.
              Here's a glimpse of what's on the horizon:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-muted rounded-lg p-6">
                <h4 className="text-foreground text-lg font-semibold">
                  Analyze Tab
                </h4>
                <p className="text-muted-foreground mt-2">
                  The upcoming{" "}
                  <Link href="/analyze">
                    <strong className="text-link">Analyze</strong>
                  </Link>{" "}
                  tab will feature a variety of charts and visualizations. We're
                  also exploring machine learning models to help you uncover
                  deeper insights from your notes. We're also working on a
                  "chat" interface to help you query your data.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <h4 className="text-foreground text-lg font-semibold">
                  Enhanced Enrichment
                </h4>
                <p className="text-muted-foreground mt-2">
                  We plan to add more enrichment capabilities, such as
                  integrating the Google Maps API to find latitude and longitude
                  for any locations mentioned in your notes. Imagine creating
                  heatmaps of places you've documented!
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
