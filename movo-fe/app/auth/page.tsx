"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function AuthPage() {
  // State untuk beralih antara form login dan register
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-8">
          <Image
            src="/movo non-text.png"
            alt="Movo Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isLoginView ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400">
            {isLoginView
              ? "Sign in to continue your journey."
              : "Join us and explore the future."}
          </p>
        </div>

        {/* Tampilkan form berdasarkan state */}
        {isLoginView ? (
          <LoginForm switchToRegister={() => setIsLoginView(false)} />
        ) : (
          <RegisterForm switchToLogin={() => setIsLoginView(true)} />
        )}
      </div>

      <style jsx global>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </section>
  );
}
