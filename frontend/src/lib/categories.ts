export const CATEGORIES = [
  "Love",
  "Relationships",
  "College",
  "Career",
  "Family",
  "Mental Health",
  "Work",
  "Gaming",
  "Technology",
  "Random",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MOODS = ["😊", "😔", "😡", "😢", "😂", "😍", "😭", "🤔", "😮", "🙏"] as const;

export const REACTIONS = [
  { kind: "like", emoji: "❤️" },
  { kind: "funny", emoji: "😂" },
  { kind: "sad", emoji: "😢" },
  { kind: "wow", emoji: "😮" },
  { kind: "support", emoji: "👏" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["kind"];
