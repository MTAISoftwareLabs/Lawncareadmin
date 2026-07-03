interface AppStoreButtonsProps {
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function StoreBadge({
  href,
  label,
  sublabel,
  icon,
  size,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: "apple" | "google";
  size: "sm" | "md" | "lg";
}) {
  const height = size === "lg" ? "h-14" : size === "md" ? "h-12" : "h-10";
  const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex ${height} items-center gap-3 rounded-xl border border-white/20 bg-black px-4 text-white transition-transform hover:scale-[1.02] hover:bg-black/90 dark:border-border dark:bg-foreground dark:text-background`}
      data-testid={icon === "apple" ? "app-store-button" : "play-store-button"}
    >
      {icon === "apple" ? (
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.47-.12-1.06.46-2.2 1.177-3.01.745-.89 2.006-1.56 2.987-1.54zM20.88 17.17c-.508 1.17-1.11 2.25-1.86 3.24-.98 1.3-2.12 2.76-3.66 2.78-1.38.02-1.82-.88-3.39-.88-1.58 0-2.07.85-3.38.9-1.55.06-2.73-1.42-3.71-2.71-2.02-2.67-3.56-7.55-1.49-10.84 1.03-1.66 2.87-2.71 4.88-2.74 1.52-.03 2.95 1.02 3.88 1.02.93 0 2.68-1.26 4.52-1.08.77.03 2.94.31 4.34 2.33-.11.07-2.59 1.51-2.56 4.5.03 3.58 3.13 4.78 3.17 4.8-.03.08-.5 1.7-1.18 3.38z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          <path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.3L3.7 1.7l-.1.1zm12.4.5-2.8 2.8 3.5 3.5 2.9-1.7c.8-.5.8-1.3 0-1.8l-3.6-2.8zm-3.3 4.1L4.2 20.4c.5.5 1.3.6 2 .1l8.5-4.9-3.4-3.4zM20.3 4.5l-2.9 1.7 3.4 3.4 2.9-1.7c.6-.4.6-1 0-1.4z" />
        </svg>
      )}
      <div className={`leading-tight ${textSize}`}>
        <div className="text-[10px] uppercase opacity-80">{sublabel}</div>
        <div className="font-semibold">{label}</div>
      </div>
    </a>
  );
}

export function AppStoreButtons({
  appStoreUrl,
  playStoreUrl,
  size = "md",
  className = "",
}: AppStoreButtonsProps) {
  if (!appStoreUrl && !playStoreUrl) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {appStoreUrl && (
        <StoreBadge
          href={appStoreUrl}
          sublabel="Download on the"
          label="App Store"
          icon="apple"
          size={size}
        />
      )}
      {playStoreUrl && (
        <StoreBadge
          href={playStoreUrl}
          sublabel="Get it on"
          label="Google Play"
          icon="google"
          size={size}
        />
      )}
    </div>
  );
}
