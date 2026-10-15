import { ramp } from "../constants";
import store from "../scene/store";

// Stage colour climbs the magma ramp from input to output, so colour
// carries meaning: how far along the pipeline a stage sits. Work.jsx lights
// the stages one by one as the case study scrolls through, and pointing at
// a stage lights the matching part of the particle shape behind it.
const stageColor = (i, total) => ramp[Math.round(1 + (i / Math.max(total - 1, 1)) * (ramp.length - 2))];

const PipelineDiagram = ({ stages, label, formation }) => {
  const point = (index) => () => (store.stageSpot = { key: formation, index });
  const clear = () => (store.stageSpot = null);

  return (
    <ol aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {stages.map((stage, i) => {
        const color = stageColor(i, stages.length);
        return (
          <li
            key={stage}
            tabIndex={0}
            onPointerEnter={point(i)}
            onPointerLeave={clear}
            onFocus={point(i)}
            onBlur={clear}
            className="pipeline-stage flex min-h-12 items-center rounded-md border px-3 py-2 text-sm leading-snug text-lilac transition-colors [overflow-wrap:anywhere] hover:bg-plum focus-visible:bg-plum"
            style={{ borderColor: color, boxShadow: `inset 0 3px 0 ${color}` }}
          >
            <span className="sr-only">Step {i + 1}: </span>
            {stage}
          </li>
        );
      })}
    </ol>
  );
};

export default PipelineDiagram;
