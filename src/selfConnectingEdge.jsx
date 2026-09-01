import { BaseEdge, BezierEdge } from '@xyflow/react';
 
export default function SelfConnecting(props) {
  if (props.source !== props.target) {
    return <BezierEdge {...props} />;
  }
 
  const { id, sourceX, sourceY, targetX, targetY, label, markerEnd, data } = props;

  const radiusX = 90;
  const radiusY = 30;

  const edgePath = `M ${sourceX} ${targetY} C ${sourceX - radiusX} ${sourceY - radiusY*2}, ${sourceX - radiusX} ${sourceY + radiusY}, ${sourceX} ${sourceY + 1}`;

  const labelX = sourceX - radiusX + 15; 
  const labelY = sourceY;
  return(
    <>
      <BaseEdge path={edgePath} label={label} labelX={labelX} labelY={labelY} markerEnd={markerEnd} />
      <circle r="4" cx={sourceX} cy={targetY} fill="#ff0073" style={{ display: data?.animatedCircle ? 'block' : 'none' }}>
        <animateMotion key={`${id}-${edgePath}`} dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  ) 
} 