import type { ReactElement } from 'react';

import type { StageTemplateSpot } from '../../../lib/track/stageSpot';
import type { DecisionOutcome } from '../decision-feedback/types';
import { EquityScaleTemplate } from './equity-scale';
import type { EquityScaleSubmission } from './equity-scale/types';
import { PeekAndPitchTemplate } from './peek-and-pitch';
import type { SpotDecision } from './peek-and-pitch/types';

type Props = {
  item: StageTemplateSpot;
  disabled: boolean;
  resetKey: number;
  outcome: DecisionOutcome | null;
  onPeekDecision: (decision: SpotDecision) => void;
  onEquitySubmit: (submission: EquityScaleSubmission) => void;
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
  2: ({ item, disabled, resetKey, outcome, onEquitySubmit, onOutcomeAnimationComplete }) => {
    if (item.templateId !== 2) throw new Error('Equity renderer received the wrong spot');
    return (
      <EquityScaleTemplate
        spot={item.table}
        outcome={outcome}
        onSubmit={onEquitySubmit}
        onOutcomeAnimationComplete={onOutcomeAnimationComplete}
        disabled={disabled}
        resetKey={resetKey}
      />
    );
  },
};

export function StageTemplateRenderer(props: Props) {
  return TEMPLATE_RENDERERS[props.item.templateId](props);
}
