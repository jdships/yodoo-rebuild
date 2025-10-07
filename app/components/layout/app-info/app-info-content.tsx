export function AppInfoContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground leading-relaxed">
        <span className="font-medium">Yodoo</span> is the interface
        for AI chat.
        <br />
        Multi-model, BYOK-ready.
        <br />
        Use Claude, OpenAI, Gemini, local models, and more, all in one place.
        <br />
      </p>
      <p className="text-foreground leading-relaxed">
        The code is available on{" "}
        <a
          className="underline"
          href="https://github.com/jdships/yodoo"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
