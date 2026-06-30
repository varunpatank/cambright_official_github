const lines = [
  "FREE.",
  "CAMBRIDGE.",
  "INTELLIGENT.",
  "FOR STUDENTS.",
  "ALWAYS ON.",
];

const Manifesto = () => {
  return (
    <section className="py-12 md:py-16" id="manifesto">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80 mb-5">
          Manifesto
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
          {lines.map((line) => (
            <div
              key={line}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 text-center"
            >
              <span className="text-lg md:text-xl font-semibold tracking-wide text-white">
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
