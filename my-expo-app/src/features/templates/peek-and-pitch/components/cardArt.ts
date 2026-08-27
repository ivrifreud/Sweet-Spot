import type { ImageSourcePropType } from 'react-native';

import type { Card, CardCode } from '@/lib/cards';
import { formatCard } from '@/lib/cards';

/** Kenney Playing Cards Pack (CC0), via Python Arcade's bundled copy. */
const FACES: Record<CardCode, ImageSourcePropType> = {
  '2s': require('../../../../../assets/tables/playing-cards/cardSpades2.png'),
  '3s': require('../../../../../assets/tables/playing-cards/cardSpades3.png'),
  '4s': require('../../../../../assets/tables/playing-cards/cardSpades4.png'),
  '5s': require('../../../../../assets/tables/playing-cards/cardSpades5.png'),
  '6s': require('../../../../../assets/tables/playing-cards/cardSpades6.png'),
  '7s': require('../../../../../assets/tables/playing-cards/cardSpades7.png'),
  '8s': require('../../../../../assets/tables/playing-cards/cardSpades8.png'),
  '9s': require('../../../../../assets/tables/playing-cards/cardSpades9.png'),
  'Ts': require('../../../../../assets/tables/playing-cards/cardSpades10.png'),
  'Js': require('../../../../../assets/tables/playing-cards/cardSpadesJ.png'),
  'Qs': require('../../../../../assets/tables/playing-cards/cardSpadesQ.png'),
  'Ks': require('../../../../../assets/tables/playing-cards/cardSpadesK.png'),
  'As': require('../../../../../assets/tables/playing-cards/cardSpadesA.png'),
  '2h': require('../../../../../assets/tables/playing-cards/cardHearts2.png'),
  '3h': require('../../../../../assets/tables/playing-cards/cardHearts3.png'),
  '4h': require('../../../../../assets/tables/playing-cards/cardHearts4.png'),
  '5h': require('../../../../../assets/tables/playing-cards/cardHearts5.png'),
  '6h': require('../../../../../assets/tables/playing-cards/cardHearts6.png'),
  '7h': require('../../../../../assets/tables/playing-cards/cardHearts7.png'),
  '8h': require('../../../../../assets/tables/playing-cards/cardHearts8.png'),
  '9h': require('../../../../../assets/tables/playing-cards/cardHearts9.png'),
  'Th': require('../../../../../assets/tables/playing-cards/cardHearts10.png'),
  'Jh': require('../../../../../assets/tables/playing-cards/cardHeartsJ.png'),
  'Qh': require('../../../../../assets/tables/playing-cards/cardHeartsQ.png'),
  'Kh': require('../../../../../assets/tables/playing-cards/cardHeartsK.png'),
  'Ah': require('../../../../../assets/tables/playing-cards/cardHeartsA.png'),
  '2d': require('../../../../../assets/tables/playing-cards/cardDiamonds2.png'),
  '3d': require('../../../../../assets/tables/playing-cards/cardDiamonds3.png'),
  '4d': require('../../../../../assets/tables/playing-cards/cardDiamonds4.png'),
  '5d': require('../../../../../assets/tables/playing-cards/cardDiamonds5.png'),
  '6d': require('../../../../../assets/tables/playing-cards/cardDiamonds6.png'),
  '7d': require('../../../../../assets/tables/playing-cards/cardDiamonds7.png'),
  '8d': require('../../../../../assets/tables/playing-cards/cardDiamonds8.png'),
  '9d': require('../../../../../assets/tables/playing-cards/cardDiamonds9.png'),
  'Td': require('../../../../../assets/tables/playing-cards/cardDiamonds10.png'),
  'Jd': require('../../../../../assets/tables/playing-cards/cardDiamondsJ.png'),
  'Qd': require('../../../../../assets/tables/playing-cards/cardDiamondsQ.png'),
  'Kd': require('../../../../../assets/tables/playing-cards/cardDiamondsK.png'),
  'Ad': require('../../../../../assets/tables/playing-cards/cardDiamondsA.png'),
  '2c': require('../../../../../assets/tables/playing-cards/cardClubs2.png'),
  '3c': require('../../../../../assets/tables/playing-cards/cardClubs3.png'),
  '4c': require('../../../../../assets/tables/playing-cards/cardClubs4.png'),
  '5c': require('../../../../../assets/tables/playing-cards/cardClubs5.png'),
  '6c': require('../../../../../assets/tables/playing-cards/cardClubs6.png'),
  '7c': require('../../../../../assets/tables/playing-cards/cardClubs7.png'),
  '8c': require('../../../../../assets/tables/playing-cards/cardClubs8.png'),
  '9c': require('../../../../../assets/tables/playing-cards/cardClubs9.png'),
  'Tc': require('../../../../../assets/tables/playing-cards/cardClubs10.png'),
  'Jc': require('../../../../../assets/tables/playing-cards/cardClubsJ.png'),
  'Qc': require('../../../../../assets/tables/playing-cards/cardClubsQ.png'),
  'Kc': require('../../../../../assets/tables/playing-cards/cardClubsK.png'),
  'Ac': require('../../../../../assets/tables/playing-cards/cardClubsA.png'),
};

export const CARD_BACK_ART = require('../../../../../assets/tables/playing-cards/cardBack_red2.png');

export function cardFaceArt(card: Card): ImageSourcePropType {
  return FACES[formatCard(card)];
}
