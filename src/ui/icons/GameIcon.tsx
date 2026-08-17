import { gameIconUrl } from './gameIcons';

type GameIconProps = {
  path: string;
  alt?: string;
  size?: number;
  className?: string;
};

export function GameIcon({ path, alt = '', size = 32, className = '' }: GameIconProps) {
  return (
    <img
      className={`game-icon ${className}`.trim()}
      src={gameIconUrl(path)}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}

type IconRowProps = {
  paths: string[];
  alt?: string;
  size?: number;
};

export function IconRow({ paths, alt = '', size = 24 }: IconRowProps) {
  if (paths.length === 0) return null;
  return (
    <span className="icon-row" aria-hidden={alt ? undefined : true}>
      {paths.map((path) => (
        <GameIcon key={path} path={path} alt={alt} size={size} />
      ))}
    </span>
  );
}
