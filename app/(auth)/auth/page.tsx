import { GalleryVerticalEnd } from "lucide-react";
import Logo from "@/components/logo";
import AuthenticationCard from "./components/authentication-card";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen h-full w-full items-center justify-center"
      style={{
        backgroundImage: `url("https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg")`,
        backgroundSize: "cover",
      }}
    >
      <div className="w-full min-h-screen flex flex-col gap-1 items-center justify-center bg-black/70  p-6 md:p-10">
        <Logo />
        <AuthenticationCard />
      </div>
    </div>
  );
}
