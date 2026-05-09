import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  badge?: React.ReactNode;
  isOnline?: boolean;
}

const sizes: Record<AvatarSize, { container: string; text: string; online: string }> = {
  xs: { container: "h-6 w-6", text: "text-[10px]", online: "h-1.5 w-1.5" },
  sm: { container: "h-8 w-8", text: "text-xs", online: "h-2 w-2" },
  md: { container: "h-10 w-10", text: "text-sm", online: "h-2.5 w-2.5" },
  lg: { container: "h-12 w-12", text: "text-base", online: "h-3 w-3" },
  xl: { container: "h-16 w-16", text: "text-xl", online: "h-3.5 w-3.5" },
  "2xl": { container: "h-20 w-20", text: "text-2xl", online: "h-4 w-4" },
};

const gradients = [
  "from-brand-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
];

function getGradient(name: string) {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function Avatar({
  src,
  name = "",
  size = "md",
  className,
  isOnline,
}: AvatarProps) {
  const { container, text, online } = sizes[size];

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center",
          container
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "Avatar"}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center bg-gradient-to-br font-semibold text-white",
              getGradient(name)
            )}
          >
            <span className={text}>{getInitials(name)}</span>
          </div>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-zinc-900",
            online,
            isOnline ? "bg-emerald-500" : "bg-zinc-400"
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, i) => (
        <div key={i} className="ring-2 ring-white dark:ring-zinc-900 rounded-full">
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900",
            sizes[size].container
          )}
        >
          <span className={cn("font-medium text-zinc-600 dark:text-zinc-300", sizes[size].text)}>
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}
