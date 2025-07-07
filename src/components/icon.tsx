import * as LucideIcons from "lucide-react";

type IconProps = {
  name: string;
  className?: string;
  [key: string]: any;
};

export function Icon({ name, className, ...props }: IconProps) {
  if (name.startsWith("data:image") || name.startsWith("http")) {
    return (
      <img
        src={name}
        alt=""
        className={className}
        {...props}
      />
    );
  }

  const LucideIcon = (LucideIcons as any)[name];

  if (!LucideIcon) {
    return <LucideIcons.Globe className={className} {...props} />;
  }

  return <LucideIcon className={className} {...props} />;
}
