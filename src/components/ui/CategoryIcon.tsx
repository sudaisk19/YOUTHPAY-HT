import { CATEGORY_CONFIG } from '@/lib/mockData';

interface CategoryIconProps {
  category: string;
  size?: number;
}

export default function CategoryIcon({ category, size = 28 }: CategoryIconProps) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Other;
  const color = cfg.color;

  return (
    <div
      className="rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}33`,
        color,
      }}
    >
      {cfg.icon}
    </div>
  );
}
