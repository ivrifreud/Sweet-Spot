import type { ReactNode } from 'react';

import { BennysGardenBackground } from '../bennys-garden';
import type { LightingMode } from '../../theme/bennysGarden';
import { PokerTableOverlay } from './PokerTableOverlay';
import type { PokerTableState, QuestionTemplateId } from './types';

type Props = {
  lightingMode: LightingMode;
  templateId: QuestionTemplateId;
  table: PokerTableState;
  /** Template-specific interaction UI sits above the shared poker objects. */
  children?: ReactNode;
};

/**
 * Shared shell for all six question templates.
 *
 * The world illustration is static atmosphere. Hole cards, board cards and chips
 * are live app UI so each question can supply its own poker state.
 */
export function PokerQuestionScene({ lightingMode, table, children }: Props) {
  return (
    <BennysGardenBackground mode={lightingMode}>
      <PokerTableOverlay {...table} />
      {children}
    </BennysGardenBackground>
  );
}
