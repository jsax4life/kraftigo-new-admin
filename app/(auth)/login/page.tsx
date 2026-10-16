"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login attempt started");
    const ok = await login({ email, password });
    console.log("Login result:", ok);
    if (ok) {
      console.log("Redirecting to /admin/dashboard");
      router.push("/admin/dashboard");
    } else {
      console.log("Login failed, error:", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1">
        {/* Left pane with image */}
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src="/images/login.jpg"
            alt="Login background"
            fill
            className="object-cover pr-20"
            priority
          />
          {/* Logo Overlay */}
          <div className="absolute left-12 top-12 z-10">
            <Image src="/log.svg" alt="Kraftigo Logo" width={150} height={50} />
          </div>
        </div>

        {/* Right pane with form */}
        <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:-ml-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[400px] space-y-8"

          >
            <div className="flex md:hidden items-center justify-center space-x-2">
              <Image src="/kraft.svg" alt="Kraftigo Logo" width={150} height={50} />

            </div>
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-garet font-extrabold text-[#000000CC] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-[#837C7C] font-poppins">
                Please login to your admin dashboard
              </p>
            </div>

            <div className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-center">
              <a href="#" className="text-sm text-[#837C7C] hover:text-slate-800 transition-colors">
                Forgot Password?
              </a>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error || "Unable to sign in. Please try again."}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              loadingText="Logging in…"
              icon={<ArrowRight className="ml-2 h-4 w-4" />}
            >
              Login Now
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="md:flex hidden items-center justify-between bg-white px-[12px] py-[18px] text-[14px] font-medium text-[#0B0B0BCC]">
        <div className="flex space-x-2">
          <span>© 2026 Kraftigo</span>
          <span>·</span>
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Admin</a>
          <span>·</span>
          <a href="#" className="hover:text-slate-800 transition-colors">Report a problem</a>
          <span>·</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors">
          Help & Resources
          <ChevronDown className="h-4 w-4" />
        </div>
      </footer>
    </div>
  );
}

