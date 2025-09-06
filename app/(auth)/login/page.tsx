import { GalleryVerticalEnd } from "lucide-react";
import Logo from "@/components/logo";
import AuthenticationCard from "./components/authentication-card";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <AuthenticationCard />
      </div>
    </div>
  );
}
