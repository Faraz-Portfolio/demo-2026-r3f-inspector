import pkg from "../../package.json";

const isInIframe = window.self !== window.top;
const author = (pkg as { author?: { name: string; email: string } }).author;

export function UI() {
  if (isInIframe) return null;

  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        padding: "1.5rem",
        color: "white",
        userSelect: "none",
        fontFamily: "sans-serif",
        zIndex: 100,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1.125rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {pkg.name}
      </h1>
      <p
        style={{
          margin: "0.25rem 0 0",
          maxWidth: "20rem",
          fontSize: "0.875rem",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        {pkg.description}
      </p>
      {author ? (
        <a
          href={`mailto:${author.email}`}
          style={{
            display: "inline-block",
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.4)",
            textDecoration: "underline",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          by {author.name} ({author.email})
        </a>
      ) : null}
      <a
        href="https://farazzshaikh.com/demos/"
        style={{
          pointerEvents: "auto",
          display: "block",
          width: "fit-content",
          marginTop: "0.75rem",
          padding: "0.375rem 0.75rem",
          borderRadius: "0.375rem",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontSize: "0.75rem",
          color: "rgba(255, 255, 255, 0.8)",
          textDecoration: "none",
        }}
      >
        View all demos →
      </a>
    </div>
  );
}
