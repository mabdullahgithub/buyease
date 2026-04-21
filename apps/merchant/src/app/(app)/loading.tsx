export default function AppLoading() {
  return (
    <div
      style={{
        padding: "1.5rem",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          height: "1.25rem",
          width: "12rem",
          borderRadius: 6,
          background: "#e3e3e3",
          marginBottom: "1.25rem",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          background: "#fff",
          border: "1px solid #e3e3e3",
          borderRadius: 8,
          padding: "1.25rem",
        }}
      >
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: "0.875rem",
              width: `${w}%`,
              borderRadius: 4,
              background: "#e3e3e3",
              marginBottom: i < 4 ? "0.75rem" : 0,
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
