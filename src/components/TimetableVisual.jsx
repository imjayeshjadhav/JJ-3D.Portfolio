// A representative week of solver output for the timetable project, which
// has no public deployment to screenshot. Each programme gets a ramp colour;
// no cell holds two programmes, which is the point of the solver.
const programmes = [
  { code: "BSc", color: "#5a4630" },
  { code: "B.Ed", color: "#8c6a3f" },
  { code: "M.Ed", color: "#a88a57" },
  { code: "ITEP", color: "#c9a96e" },
  { code: "FY", color: "#e6d3a8" },
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periods = ["9:00", "10:00", "11:00", "12:00", "Lunch", "2:00", "3:00"];

// One hand-laid week; letters index programmes, "." is a free slot.
const byLetter = { B: programmes[0], E: programmes[1], M: programmes[2], I: programmes[3], F: programmes[4] };
// Six teaching periods; the lunch row (period index 4) is skipped.
const rows = ["BEMFI.", "IFBE.M", "E.IBMF", ".BFMIE", "MIEFB.", "F.MIEB"];
const cell = (d, p) => {
  if (p === 4) return "lunch";
  const row = rows[p > 4 ? p - 1 : p];
  return byLetter[row[d]] ?? null;
};

const TimetableVisual = () => (
  <div
    role="img"
    aria-label="Sample week of a generated timetable: six days by six teaching periods plus lunch, each slot assigned to one of BSc, B.Ed, M.Ed, ITEP or FY with no clashes."
    className="flex aspect-[16/10] w-full flex-col justify-center bg-surface p-4 sm:p-8"
  >
    <div className="grid grid-cols-[3rem_repeat(6,1fr)] gap-1 text-[0.65rem] sm:gap-1.5 sm:text-xs" aria-hidden="true">
      <span />
      {days.map((d) => (
        <span key={d} className="pb-1 text-center text-muted">{d}</span>
      ))}
      {periods.map((time, p) => (
        <div key={time} className="contents">
          <span className="self-center text-muted">{time}</span>
          {days.map((d, di) => {
            const c = cell(di, p);
            if (c === "lunch")
              return <span key={d} className="h-4 rounded-sm border border-dashed border-rule sm:h-5" />;
            return (
              <span
                key={d}
                className="flex h-6 items-center justify-center rounded-sm font-medium sm:h-9"
                style={c ? { background: c.color, color: c.code === "BSc" ? "#f4efe4" : "#0e0f11" } : { border: "1px solid #2a2d33" }}
              >
                {c?.code}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

export default TimetableVisual;
