import { SettingsLayout } from "./components/settings-container";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsLayout />;
}
