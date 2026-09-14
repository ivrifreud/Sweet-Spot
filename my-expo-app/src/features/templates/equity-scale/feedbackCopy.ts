import type { DecisionFeedbackCopy } from '../../decision-feedback/types';
import type { EquityGrade, EquityScaleSpot } from './types';

function holeLabel(spot: EquityScaleSpot): string {
  return `${spot.heroCards[0]}${spot.heroCards[1]}`;
}

function boardLabel(spot: EquityScaleSpot): string {
  return spot.board.join(' ');
}

function evRule(potOddsPercent: number, trueEquityPercent: number): string {
  if (trueEquityPercent > potOddsPercent) {
    return `Equity > Pot Odds → +EV (profitable long-term, worth calling).`;
  }
  if (trueEquityPercent < potOddsPercent) {
    return `Equity < Pot Odds → -EV (losing long-term, better to fold).`;
  }
  return `Equity equals Pot Odds → a break-even call.`;
}

export function buildEquityFeedbackCopy(input: {
  spot: EquityScaleSpot;
  grade: EquityGrade;
  continueLabel?: string;
}): DecisionFeedbackCopy {
  const { spot, grade } = input;
  const continueLabel = input.continueLabel ?? 'Deal me the next';
  const texture = spot.textureLine ? ` ${spot.textureLine}.` : '';
  const outsLine = grade.outsCorrect
    ? `You counted ${spot.correctOuts} outs.`
    : `You counted a different number; the draw has ${spot.correctOuts} outs.`;
  const equityLine = grade.equityCorrect
    ? `You priced ${grade.trueEquityPercent}% equity.`
    : `The draw has ${grade.trueEquityPercent}% equity.`;
  const explanation = [
    `Your hand: ${holeLabel(spot)}. Board: ${boardLabel(spot)}.${texture}`,
    outsLine,
    equityLine,
    `Pot odds ${grade.potOddsPercent}%. ${evRule(grade.potOddsPercent, grade.trueEquityPercent)}`,
    spot.takeaway,
  ].join(' ');

  if (grade.stagesCorrect === 3) {
    return {
      outcome: 'correct',
      title: 'SWEET SPOT!',
      kicker: '3/3 on the scale.',
      explanation,
      continueLabel,
    };
  }

  if (grade.decisionCorrect) {
    return {
      outcome: 'correct',
      title: grade.stagesCorrect === 2 ? 'CLOSE CUT!' : 'ONE BEAT',
      kicker: `${grade.stagesCorrect}/3 locked in. Call or fold still paid.`,
      explanation,
      continueLabel,
    };
  }

  return {
    outcome: 'incorrect',
    title: 'STILL IN IT',
    kicker: `${grade.stagesCorrect}/3. ${spot.correctDecision === 'fold' ? 'Fold' : 'Call'} was the leak to plug.`,
    explanation,
    continueLabel,
  };
}
