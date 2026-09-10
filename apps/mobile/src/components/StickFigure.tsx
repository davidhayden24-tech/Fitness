import React from "react";
import Svg, { Circle, Line } from "react-native-svg";
import { LENGTHS, type Skeleton } from "../animations/pose";
import { colors } from "../theme";

interface Props {
  skeleton: Skeleton;
  size?: number;
  color?: string;
}

const VIEW_W = 120;
const VIEW_H = 160;

export function StickFigure({ skeleton: s, size = 120, color = colors.primary }: Props) {
  const strokeProps = { stroke: color, strokeWidth: 5, strokeLinecap: "round" as const };
  return (
    <Svg width={size} height={(size * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <Line x1={s.hip.x} y1={s.hip.y} x2={s.shoulder.x} y2={s.shoulder.y} {...strokeProps} />
      <Line x1={s.shoulder.x} y1={s.shoulder.y} x2={s.leftElbow.x} y2={s.leftElbow.y} {...strokeProps} />
      <Line x1={s.leftElbow.x} y1={s.leftElbow.y} x2={s.leftHand.x} y2={s.leftHand.y} {...strokeProps} />
      <Line x1={s.shoulder.x} y1={s.shoulder.y} x2={s.rightElbow.x} y2={s.rightElbow.y} {...strokeProps} />
      <Line x1={s.rightElbow.x} y1={s.rightElbow.y} x2={s.rightHand.x} y2={s.rightHand.y} {...strokeProps} />
      <Line x1={s.hip.x} y1={s.hip.y} x2={s.leftKnee.x} y2={s.leftKnee.y} {...strokeProps} />
      <Line x1={s.leftKnee.x} y1={s.leftKnee.y} x2={s.leftFoot.x} y2={s.leftFoot.y} {...strokeProps} />
      <Line x1={s.hip.x} y1={s.hip.y} x2={s.rightKnee.x} y2={s.rightKnee.y} {...strokeProps} />
      <Line x1={s.rightKnee.x} y1={s.rightKnee.y} x2={s.rightFoot.x} y2={s.rightFoot.y} {...strokeProps} />
      <Circle cx={s.head.x} cy={s.head.y} r={LENGTHS.headRadius} fill={color} />
    </Svg>
  );
}
