import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  RANKS,
  SUITS,
  SUIT_GLYPH,
  formatCard,
  isRedSuit,
  randomHoleCards,
  sameCard,
  type Card,
  type HoleCards,
  type Rank,
  type Suit,
} from '@/lib/cards';

import { SKINS } from '../config';
import { STRINGS } from '../strings';
import type { TableSkin } from '../types';
import { CardFace } from './PlayingCard';

type CardPickerProps = {
  visible: boolean;
  cards: HoleCards;
  skin: TableSkin;
  onClose: () => void;
  /** `cards === null` means "deal a random hand from now on". */
  onApply: (cards: HoleCards | null, skin: TableSkin) => void;
};

/**
 * Authoring control: pins the exact two cards the player will find under their fingers.
 * Any rank/suit combination is allowed, which is what makes the template reusable for
 * scripted spots (pocket aces, a trash hand, a suited connector...).
 */
export function CardPicker({ visible, cards, skin, onClose, onApply }: CardPickerProps) {
  const [draft, setDraft] = useState<HoleCards>(cards);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [draftSkin, setDraftSkin] = useState<TableSkin>(skin);

  const duplicate = sameCard(draft[0], draft[1]);

  const setSlot = (patch: Partial<Card>) => {
    setDraft((current) => {
      const next: HoleCards = [current[0], current[1]];
      next[activeSlot] = { ...next[activeSlot], ...patch };
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} bounces={false}>
          <Text style={styles.title}>{STRINGS.cardPickerTitle}</Text>

          <View style={styles.slots}>
            {draft.map((card, index) => (
              <Pressable
                key={index}
                testID={`card-slot-${index}`}
                onPress={() => setActiveSlot(index as 0 | 1)}
                style={[
                  styles.slot,
                  activeSlot === index && styles.slotActive,
                  duplicate && styles.slotError,
                ]}>
                <CardFace card={card} width={64} />
              </Pressable>
            ))}
            <View style={styles.slotHint}>
              <Text style={styles.slotHintText}>
                {duplicate
                  ? 'Two identical cards — pick a different one.'
                  : `Editing card ${activeSlot + 1} \u00b7 ${formatCard(draft[0])} ${formatCard(draft[1])}`}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Rank</Text>
          <View style={styles.grid}>
            {RANKS.map((rank: Rank) => (
              <Pressable
                key={rank}
                testID={`rank-${rank}`}
                onPress={() => setSlot({ rank })}
                style={[styles.cell, draft[activeSlot].rank === rank && styles.cellActive]}>
                <Text style={styles.cellText}>{rank === 'T' ? '10' : rank}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Suit</Text>
          <View style={styles.grid}>
            {SUITS.map((suit: Suit) => (
              <Pressable
                key={suit}
                testID={`suit-${suit}`}
                onPress={() => setSlot({ suit })}
                style={[styles.cell, draft[activeSlot].suit === suit && styles.cellActive]}>
                <Text style={[styles.cellText, isRedSuit(suit) && styles.cellTextRed]}>
                  {SUIT_GLYPH[suit]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{STRINGS.skinLabel}</Text>
          <View style={styles.grid}>
            {(Object.keys(SKINS) as TableSkin[]).map((key) => (
              <Pressable
                key={key}
                testID={`skin-${key}`}
                onPress={() => setDraftSkin(key)}
                style={[styles.wideCell, draftSkin === key && styles.cellActive]}>
                <Text style={styles.cellText}>{SKINS[key].label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              testID="picker-random"
              style={[styles.button, styles.buttonGhost]}
              onPress={() => {
                setDraft(randomHoleCards());
                onApply(null, draftSkin);
              }}>
              <Text style={styles.buttonGhostText}>{STRINGS.cardPickerRandom}</Text>
            </Pressable>

            <Pressable
              testID="picker-apply"
              disabled={duplicate}
              style={[styles.button, styles.buttonPrimary, duplicate && styles.buttonDisabled]}
              onPress={() => onApply(draft, draftSkin)}>
              <Text style={styles.buttonPrimaryText}>{STRINGS.cardPickerApply}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    marginTop: 'auto',
    maxHeight: '82%',
    backgroundColor: '#0e1117',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  sheetContent: {
    padding: 18,
    paddingBottom: 34,
    rowGap: 10,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '800',
  },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginVertical: 4,
  },
  slot: {
    width: 72,
    height: 100,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#f7f4ee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotActive: {
    borderColor: '#f0c15c',
  },
  slotError: {
    borderColor: '#f87171',
  },
  slotRank: {
    fontSize: 30,
    fontWeight: '800',
  },
  slotSuit: {
    fontSize: 22,
    marginTop: -4,
  },
  slotHint: {
    flex: 1,
  },
  slotHintText: {
    color: 'rgba(244,244,245,0.65)',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionLabel: {
    color: 'rgba(244,244,245,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    minWidth: 44,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wideCell: {
    flexGrow: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellActive: {
    backgroundColor: 'rgba(240,193,92,0.18)',
    borderColor: '#f0c15c',
  },
  cellText: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '700',
  },
  cellTextRed: {
    color: '#ff6b6b',
  },
  actions: {
    flexDirection: 'row',
    columnGap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonGhost: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  buttonGhostText: {
    color: '#f4f4f5',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonPrimary: {
    backgroundColor: '#f0c15c',
  },
  buttonPrimaryText: {
    color: '#171412',
    fontWeight: '800',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
