export type DecisionOutcome = 'correct' | 'incorrect';

export type DecisionFeedbackCopy = {
  outcome: DecisionOutcome;
  title: string;
  kicker: string;
  explanation: string;
  continueLabel: string;
};
