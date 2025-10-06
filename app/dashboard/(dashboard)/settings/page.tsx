import type { Metadata } from "next";
import SettingsPageContainer from "./components/main-settings-container";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsPageContainer />;
}
