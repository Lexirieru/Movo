"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#18181B] text-white px-6 py-12">
      {/* Background effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[50rem] h-[50rem] bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* Card container */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-6">
          <Image
            src="/movo non-text.png"
            alt="Movo Logo"
            width={90}
            height={90}
            className="mx-auto drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isLoginView ? "Welcome Back" : "Create Account "}
          </h1>
          <p className="mt-2  text-gray-300 text-sm sm:text-base">
            {isLoginView
              ? "Sign in to continue your journey."
              : "Join us and explore the future."}
          </p>
        </div>

        {/* Auth form */}
        <div className="animate-fade-in">
          {isLoginView ? (
            <LoginForm switchToRegister={() => setIsLoginView(false)} />
          ) : (
            <RegisterForm switchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    </section>
  );
}
