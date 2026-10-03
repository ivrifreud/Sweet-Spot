import type { ReactElement } from 'react';

import type { ScaleResultLesson } from '../../../lib/equity-scale/resultLayout';
import type { StageTemplateSpot } from '../../../lib/track/stageSpot';
import type { DecisionOutcome } from '../decision-feedback/types';
import { EquityScaleTemplate } from './equity-scale';
import type { EquityGrade, EquityScaleSubmission } from './equity-scale/types';
import { HotSeatsTemplate } from './hot-seats/HotSeatsTemplate';
import type { HotSeatPlay } from './hot-seats/storyEngine';
import { PeekAndPitchTemplate } from './peek-and-pitch';
import type { SpotDecision } from './peek-and-pitch/types';

type Props = {
  item: StageTemplateSpot;
  disabled: boolean;
  resetKey: number;
  outcome: DecisionOutcome | null;
  grade?: EquityGrade | null;
  resultLesson?: ScaleResultLesson | null;
  forceTutorial?: boolean;
  onPeekDecision: (decision: SpotDecision) => void;
  onEquitySubmit: (submission: EquityScaleSubmission) => void;
  onHotSeatComplete: (play: HotSeatPlay) => void;
  onOutcomeAnimationComplete: () => void;
};

type Renderer = (props: Props) => ReactElement;

const TEMPLATE_RENDERERS: Record<StageTemplateSpot['templateId'], Renderer> = {
  1: ({ item, disabled, resetKey, onPeekDecision }) => {
    if (item.templateId !== 1) throw new Error('Peek renderer received the wrong spot');
    return (
      <PeekAndPitchTemplate
        spot={item.table}
        onDecision={onPeekDecision}
        showAuthoringControls={false}
        showNextHandControl={false}
        disabled={disabled}
        resetKey={resetKey}
      />
    );
  },
  2: ({
    item,
    disabled,
    resetKey,
    outcome,
    grade,
    resultLesson,
    forceTutorial,
    onEquitySubmit,
    onOutcomeAnimationComplete,
  }) => {
    if (item.templateId !== 2) throw new Error('Equity renderer received the wrong spot');
    return (
      <EquityScaleTemplate
        spot={item.table}
        outcome={outcome}
        grade={grade}
        resultLesson={resultLesson}
        onSubmit={onEquitySubmit}
        onOutcomeAnimationComplete={onOutcomeAnimationComplete}
        disabled={disabled}
        resetKey={resetKey}
        forceTutorial={forceTutorial}
      />
    );
  },
  7: ({ item, disabled, resetKey, onHotSeatComplete }) => {
    if (item.templateId !== 7) throw new Error('Hot Seats renderer received the wrong spot');
    return (
      <HotSeatsTemplate
        key={resetKey}
        story={item.table}
        disabled={disabled}
        onStoryComplete={onHotSeatComplete}
      />
    );
  },
};

export function StageTemplateRenderer(props: Props) {
  return TEMPLATE_RENDERERS[props.item.templateId](props);
}
