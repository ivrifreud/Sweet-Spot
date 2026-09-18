export {
  advanceStep,
  allowedActionsForStep,
  currentStep,
  isComplete,
  matchesCurrentStep,
  stepFromAction,
} from './stepMachine';
export { PEEK_AND_PITCH_TUTORIAL, PEEK_AND_PITCH_TUTORIAL_ID } from './peekAndPitchSteps';
export { hasSeenTemplateTutorial, markTemplateTutorialSeen, tutorialSeenKey } from './tutorialAck';
export { horizonHeadingForSwipe, visualMotionForHand } from './visualMotion';
export type { GestureVisualMotion } from './visualMotion';
export {
  approxQuadLength,
  cometDashOffset,
  cometTailLength,
  fallbackTableRects,
  pointOnQuad,
  spotlightForTarget,
  quadPathD,
  rectCenter,
  swipeArcForAction,
  tapOriginForAction,
  tangentOnQuad,
  warmthTrailLayers,
} from './tutorialGeometry';
export type {
  TutorialArc,
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
