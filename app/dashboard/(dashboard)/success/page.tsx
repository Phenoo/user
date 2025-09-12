"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard"); // 👈 change this to where you want to redirect
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="rounded-2xl  p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600">
          🎉 Payment Successful!
        </h1>
        <p className="mt-4 text-gray-600">
          Thank you for subscribing. You’ll be redirected to your dashboard in 5
          seconds...
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-green-600 px-4 py-2 text-foreground hover:bg-green-700"
          >
            Go Now
          </button>
        </div>
      </div>
    </div>
  );
}
