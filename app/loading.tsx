// Shows a black screen while the page JS is loading,
// so users never see the raw homepage before the intro video kicks in.
export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
      }}
    />
  );
}
