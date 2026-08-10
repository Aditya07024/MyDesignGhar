import type { KeyboardEvent } from 'react';
import type { IndiaInteriorState } from '../../types';
import indiaMapImage from './india.png';
import LocationPin from './LocationPin';

const MAP_WIDTH = 1536;
const MAP_HEIGHT = 1024;
const SOURCE_WIDTH = 900;
const SOURCE_HEIGHT = 900;
const SCALE_X = MAP_WIDTH / SOURCE_WIDTH;
const SCALE_Y = MAP_HEIGHT / SOURCE_HEIGHT;

interface ImageHotspot {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotate?: number;
}

const IMAGE_HOTSPOTS: Record<string, ImageHotspot> = {
  'jammu-kashmir': { x: 560, y: 88, rx: 78, ry: 58, rotate: -6 },
  ladakh: { x: 560, y: 156, rx: 50, ry: 48 },
  'himachal-pradesh': { x: 596, y: 198, rx: 42, ry: 38, rotate: 8 },
  punjab: { x: 526, y: 216, rx: 42, ry: 42, rotate: -8 },
  chandigarh: { x: 568, y: 238, rx: 18, ry: 16 },
  haryana: { x: 528, y: 270, rx: 56, ry: 42, rotate: 4 },
  delhi: { x: 584, y: 304, rx: 18, ry: 18 },
  uttarakhand: { x: 658, y: 252, rx: 72, ry: 46, rotate: 4 },
  rajasthan: { x: 448, y: 360, rx: 132, ry: 90, rotate: -8 },
  'uttar-pradesh': { x: 700, y: 350, rx: 118, ry: 72, rotate: 5 },
  sikkim: { x: 966, y: 316, rx: 30, ry: 34 },
  bihar: { x: 838, y: 396, rx: 82, ry: 52, rotate: 3 },
  'west-bengal': { x: 946, y: 470, rx: 58, ry: 86, rotate: 8 },
  jharkhand: { x: 812, y: 462, rx: 70, ry: 50, rotate: -2 },
  assam: { x: 1082, y: 350, rx: 102, ry: 44, rotate: -4 },
  'arunachal-pradesh': { x: 1184, y: 282, rx: 92, ry: 54, rotate: -5 },
  meghalaya: { x: 1054, y: 398, rx: 66, ry: 40 },
  tripura: { x: 1078, y: 462, rx: 34, ry: 46, rotate: -5 },
  nagaland: { x: 1184, y: 370, rx: 54, ry: 42, rotate: 5 },
  manipur: { x: 1164, y: 424, rx: 52, ry: 42, rotate: 5 },
  mizoram: { x: 1136, y: 482, rx: 44, ry: 58, rotate: 8 },
  gujarat: { x: 364, y: 480, rx: 96, ry: 76, rotate: -8 },
  'madhya-pradesh': { x: 586, y: 482, rx: 132, ry: 82, rotate: 3 },
  chhattisgarh: { x: 706, y: 536, rx: 66, ry: 86, rotate: -2 },
  odisha: { x: 804, y: 566, rx: 94, ry: 64, rotate: -8 },
  maharashtra: { x: 476, y: 606, rx: 112, ry: 96, rotate: -4 },
  'dadra-nagar-haveli-daman-diu': { x: 322, y: 572, rx: 24, ry: 28 },
  goa: { x: 434, y: 730, rx: 20, ry: 28 },
  telangana: { x: 590, y: 658, rx: 72, ry: 64, rotate: 6 },
  'andhra-pradesh': { x: 626, y: 734, rx: 94, ry: 72, rotate: -10 },
  karnataka: { x: 480, y: 766, rx: 92, ry: 98, rotate: -4 },
  kerala: { x: 494, y: 884, rx: 28, ry: 86, rotate: -12 },
  'tamil-nadu': { x: 582, y: 870, rx: 82, ry: 86, rotate: -4 },
  puducherry: { x: 700, y: 780, rx: 24, ry: 24 },
  lakshadweep: { x: 350, y: 884, rx: 42, ry: 66, rotate: -8 },
  'andaman-nicobar': { x: 1110, y: 870, rx: 58, ry: 100, rotate: -6 },
};

interface IndiaMapProps {
  states: IndiaInteriorState[];
  activeStateId: string;
  onStateHover: (stateId: string) => void;
  onStateClick: (stateId: string) => void;
  onMapLeave: () => void;
  reducedMotion: boolean;
}

export default function IndiaMap({
  states,
  activeStateId,
  onStateHover,
  onStateClick,
  onMapLeave,
  reducedMotion,
}: IndiaMapProps) {
  const activeState = states.find((state) => state.id === activeStateId) ?? states[0];

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, stateId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onStateClick(stateId);
    }
  };

  const scaleShape = (shape: IndiaInteriorState['shape']) => {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    return {
      x: shape.x * SCALE_X,
      y: shape.y * SCALE_Y,
      width: shape.width * SCALE_X,
      height: shape.height * SCALE_Y,
      rx: shape.rx ? shape.rx * Math.min(SCALE_X, SCALE_Y) : undefined,
      rotate: shape.rotate,
      centerX: centerX * SCALE_X,
      centerY: centerY * SCALE_Y,
    };
  };

  const getHotspot = (state: IndiaInteriorState) => {
    const hotspot = IMAGE_HOTSPOTS[state.id];

    if (hotspot) {
      return hotspot;
    }

    const scaledShape = scaleShape(state.shape);
    return {
      x: scaledShape.centerX,
      y: scaledShape.centerY,
      rx: Math.max((scaledShape.rx ?? Math.min(scaledShape.width, scaledShape.height) * 0.28), 10),
      ry: Math.max(Math.min(scaledShape.width, scaledShape.height) * 0.28, 10),
      rotate: scaledShape.rotate,
    };
  };

  const activeHotspot = getHotspot(activeState);

  return (
    <div className="india-map-shell" onMouseLeave={onMapLeave}>
      <svg
        className="india-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Interactive map of India featuring states and union territories."
      >
        <image
          className="india-map-image"
          href={indiaMapImage}
          x="0"
          y="0"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          preserveAspectRatio="none"
          aria-hidden="true"
        />

        <g className="india-hit-zones">
          {states.map((state) => {
            const isActive = state.id === activeStateId;
            const hotspot = getHotspot(state);
            const transform = hotspot.rotate
              ? `rotate(${hotspot.rotate} ${hotspot.x} ${hotspot.y})`
              : undefined;

            return (
              <g
                key={state.id}
                className={`india-state${isActive ? ' active' : ''}`}
                transform={transform}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${state.name} interiors`}
                aria-pressed={isActive}
                onMouseEnter={() => onStateHover(state.id)}
                onFocus={() => onStateHover(state.id)}
                onClick={() => onStateClick(state.id)}
                onKeyDown={(event) => handleKeyDown(event, state.id)}
              >
                <ellipse
                  className="india-state-hit-area"
                  cx={hotspot.x}
                  cy={hotspot.y}
                  rx={hotspot.rx}
                  ry={hotspot.ry}
                />
              </g>
            );
          })}
        </g>

        <LocationPin x={activeHotspot.x} y={activeHotspot.y} reducedMotion={reducedMotion} />
      </svg>
    </div>
  );
}
