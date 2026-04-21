/**
 * Form-builder workspace (welcome stub). Dashboard / onboarding lives at `/overview`.
 */
export default function FormBuilderWelcomePage(): React.JSX.Element {
  return (
    <main
      style={{
        padding: "1.5rem",
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.75rem" }}>Form Builder</h1>
      <p style={{ margin: 0, color: "#303030" }}>
        Welcome. Field layout, design, and publishing controls will live here. For setup progress,
        analytics, and plan usage, open{" "}
        <strong style={{ fontWeight: 600 }}>Overview</strong> from the app navigation (BuyEase COD
        Form home).
      </p>
    </main>
  );
}
