import type { ElementType } from "react";
import {
  ApartmentRounded,
  DashboardRounded,
  LayersRounded,
  PeopleAltRounded,
  SettingsRounded,
} from "@mui/icons-material";

export type BongoSidebarSubMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ElementType;
  status?: "active" | "planned";
};

export type BongoSidebarMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  status?: "active" | "planned";
  children?: BongoSidebarSubMenuItem[];
};

const buildBongoHref = (segments?: string[]) => {
  if (!segments) return undefined;
  return segments.length
    ? `/bongo/dashboard/${segments.join("/")}`
    : "/bongo/dashboard";
};

export const bongoSidebarMenuItems: BongoSidebarMenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: DashboardRounded,
    href: buildBongoHref([]),
    status: "active",
  },
  {
    key: "tenants",
    label: "Tenants",
    icon: ApartmentRounded,
    href: buildBongoHref(["tenants"]),
    status: "active",
  },
  {
    key: "subscriptions",
    label: "Subscription Plans",
    icon: LayersRounded,
    href: buildBongoHref(["subscriptions"]),
    status: "active",
  },
  {
    key: "users",
    label: "Platform Users",
    icon: PeopleAltRounded,
    href: buildBongoHref(["users"]),
    status: "planned",
  },
  {
    key: "settings",
    label: "Platform Settings",
    icon: SettingsRounded,
    href: buildBongoHref(["settings"]),
    status: "planned",
  },
];
