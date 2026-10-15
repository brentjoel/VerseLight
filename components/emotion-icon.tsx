import { CloudRain, Flame, Heart, HelpCircle, Leaf, Moon, Sparkles, Sunrise } from "lucide-react";

const icons = { anxious: CloudRain, sad: Moon, angry: Flame, tired: Leaf, guilty: Heart, grateful: Sparkles, hopeful: Sunrise, doubtful: HelpCircle };

export function EmotionIcon({ emotionId }: { emotionId: string }) {
  const Icon = icons[emotionId as keyof typeof icons] ?? Heart;
  return <Icon size={22} strokeWidth={1.5} aria-hidden="true" />;
}
