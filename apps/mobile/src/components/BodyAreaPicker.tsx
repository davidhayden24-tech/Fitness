import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CONTRAINDICATION_TAGS, type ContraindicationTag } from "@adaptfit/shared";
import { colors, radius, spacing } from "../theme";

const LABELS: Record<ContraindicationTag, string> = {
  knee: "Knee",
  lower_back: "Lower Back",
  shoulder: "Shoulder",
  wrist: "Wrist",
  ankle: "Ankle",
  hip: "Hip",
  neck: "Neck",
  elbow: "Elbow",
};

interface Props {
  selected: ContraindicationTag[];
  onChange: (next: ContraindicationTag[]) => void;
}

// A simple tap-to-select grid standing in for a body-map illustration -
// picks the same ContraindicationTag vocabulary the substitution engine
// uses, so what a user taps here maps directly to what gets excluded.
export function BodyAreaPicker({ selected, onChange }: Props) {
  const toggle = (tag: ContraindicationTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <View style={styles.grid}>
      {CONTRAINDICATION_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggle(tag)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {LABELS[tag]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(1),
  },
  chip: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.primaryText,
    fontWeight: "600",
  },
});
