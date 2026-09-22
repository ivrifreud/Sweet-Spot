export {
  advanceStep,
  allowedActionsForStep,
  currentStep,
  isComplete,
  matchesCurrentStep,
  stepFromAction,
} from './stepMachine';
export { EQUITY_SCALE_TUTORIAL, EQUITY_SCALE_TUTORIAL_ID } from './equityScaleSteps';
export { PEEK_AND_PITCH_TUTORIAL, PEEK_AND_PITCH_TUTORIAL_ID } from './peekAndPitchSteps';
export { hasSeenTemplateTutorial, markTemplateTutorialSeen, tutorialSeenKey } from './tutorialAck';
export {
  glovePoseDeg,
  horizonHeadingForDial,
  horizonHeadingForSwipe,
  pairTapProgress,
  rightHandEdgeLift,
  visualMotionForHand,
} from './visualMotion';
export type { GestureVisualMotion } from './visualMotion';
export {
  approxQuadLength,
  cometDashOffset,
  cometTailLength,
  dialArcLength,
  dialRotatePath,
  fingerPathForStep,
  fallbackTableRects,
  overlayViewport,
  POINTING_GLOVE_H,
  POINTING_GLOVE_TIP_X,
  POINTING_GLOVE_TIP_Y,
  POINTING_GLOVE_W,
  pointingGloveFrame,
  pointOnArc,
  pointOnQuad,
  rectCenter,
  rectsOverlap,
  spotlightForTarget,
  quadPathD,
  swipeArcForAction,
  tapOriginForAction,
  tapOriginForTarget,
  tangentOnDialArc,
  tangentOnQuad,
  warmthTrailLayers,
} from './tutorialGeometry';
export type {
  TutorialArc,
  TutorialControlHits,
  TutorialDialArc,
  TutorialPoint,
  TutorialRect,
  TutorialSpotlight,
  WarmthTrailLayer,
} from './tutorialGeometry';
export type {
  GestureTutorialAction,
  GestureTutorialConfig,
  GestureTutorialHand,
  GestureTutorialStep,
  GestureTutorialTarget,
} from './types';
