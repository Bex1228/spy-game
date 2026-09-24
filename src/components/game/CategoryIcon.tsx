import {
  Briefcase,
  Building2,
  Car,
  Clapperboard,
  Crown,
  Gamepad2,
  Globe,
  MapPin,
  Package,
  PawPrint,
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
};

interface CategoryIconProps extends LucideProps {
  name: CategoryIconName;
}

export function CategoryIcon({ name, ...rest }: CategoryIconProps) {
  const Icon = icons[name] ?? Package;
  return <Icon aria-hidden {...rest} />;
}
