import type { DecisionFeedbackCopy } from './types';

const ACTION_LABEL: Record<string, string> = {
  fold: 'Fold',
  call: 'Call',
  raise: 'Raise',
  check: 'Check',
};

export function labelForAction(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

function tidyLesson(lesson: string): string {
  return lesson.replace(/\s*(Fold|Call|Raise|Check)\.?\s*$/i, '').trim();
}

/**
 * Template-agnostic copy for the decision overlay.
 * Pass any lesson text (spot prompt, authored takeaway, etc.).
 */
export function buildDecisionFeedbackCopy(input: {
  correct: boolean;
  chosen: string;
  correctAnswer: string;
  lesson: string;
  continueLabel?: string;
}): DecisionFeedbackCopy {
  const chosen = labelForAction(input.chosen);
  const correctAnswer = labelForAction(input.correctAnswer);
  const lesson = tidyLesson(input.lesson);
  const continueLabel = input.continueLabel ?? 'Deal me the next';

  if (input.correct) {
    const explanation = lesson
      ? `${chosen} was right. ${lesson}`
      : `${chosen} was right. Trust that read.`;
    return {
      outcome: 'correct',
      title: 'SWEET SPOT!',
      kicker: `Your ${chosen} is the play.`,
      explanation,
      continueLabel,
    };
  }

  const explanation = lesson
    ? `${correctAnswer} was right. ${lesson} You went ${chosen}.`
    : `${correctAnswer} was right. You went ${chosen}. Shake it off — the next hand is how we get sharper.`;

  return {
    outcome: 'incorrect',
    title: 'STILL IN IT',
    kicker: `Not this one. ${correctAnswer} was the leak to plug.`,
    explanation,
    continueLabel,
  };
}
