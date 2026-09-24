import {
  Briefcase,
  Building2,
  Car,
  Clapperboard,
  CloudSun,
  Crown,
  Gamepad2,
  Globe,
  GraduationCap,
  MapPin,
  Music,
  Package,
  Palette,
  PartyPopper,
  PawPrint,
  Shirt,
  Store,
  Trophy,
  UtensilsCrossed,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import type { CategoryIconName } from "@/types";

const icons: Record<CategoryIconName, ComponentType<LucideProps>> = {
  "map-pin": MapPin,
  briefcase: Briefcase,
  globe: Globe,
  building: Building2,
  utensils: UtensilsCrossed,
  paw: PawPrint,
  trophy: Trophy,
  clapperboard: Clapperboard,
  gamepad: Gamepad2,
  car: Car,
  package: Package,
  crown: Crown,
  "party-popper": PartyPopper,
  "cloud-sun": CloudSun,
  music: Music,
  shirt: Shirt,
  palette: Palette,
  "graduation-cap": GraduationCap,
  store: Store,
};

interface CategoryIconProps extends LucideProps {
  name: CategoryIconName;
}

export function CategoryIcon({ name, ...rest }: CategoryIconProps) {
  const Icon = icons[name] ?? Package;
  return <Icon aria-hidden {...rest} />;
}
