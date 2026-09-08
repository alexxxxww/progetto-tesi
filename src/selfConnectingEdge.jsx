import { BaseEdge, getBezierPath } from '@xyflow/react';
 
export default function SelfConnecting(props) {
  const { id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, markerEnd, data } = props;
  const isSelfConnecting = (source === target)
  const radiusX = 90;
  const radiusY = 30;

  let edgePath = ''
  let labelX = 0;
  let labelY = 0;

  if(isSelfConnecting){
    edgePath = `M ${sourceX} ${targetY} C ${sourceX - radiusX} ${sourceY - radiusY*2}, ${sourceX - radiusX} ${sourceY + radiusY}, ${sourceX} ${sourceY + 1}`;
    labelX = sourceX - radiusX + 15; 
    labelY = sourceY;
  } else {
    const [bezierPath, bX, bY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetPosition,
      targetX,
      targetY,
    });
    edgePath = bezierPath;
    labelX = bX;
    labelY = bY;
  }
  return(
    <>
      <BaseEdge path={edgePath} label={label} labelX={labelX} labelY={labelY} markerEnd={markerEnd} />
      {data?.animatedCircle &&
        <circle r="4" fill="#ff0073">
          <animateMotion key={`${id}-${edgePath}`} dur="2s" repeatCount="indefinite" fill='freeze' path={edgePath} />
        </circle>
      }
    </>
  ) 
} 