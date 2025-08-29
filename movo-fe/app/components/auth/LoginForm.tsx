"use client"

import { Mail, Lock } from "lucide-react"

interface LoginFormProps {
  switchToRegister: () => void
}

export default function LoginForm({ switchToRegister }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Login...")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="relative flex items-center">
        <Mail className="absolute left-3 text-gray-400 w-5 h-5" />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          required
          className="w-full pl-10 pr-3 py-2 rounded-md bg-transparent border border-transparent text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
        />
      </div>

      {/* Password */}
      <div className="relative flex items-center">
        <Lock className="absolute left-3 text-gray-400 w-5 h-5" />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          required
          className="w-full pl-10 pr-3 py-2 rounded-md bg-transparent border border-transparent text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
        />
      </div>

      

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-transform"
        >
          Sign In
        </button>
      </div>

      {/* Switch to register */}
      <div className="text-center text-sm text-gray-400">
        <span>Don&apos;t have an account? </span>
        <button
          type="button"
          onClick={switchToRegister}
          className="font-medium text-cyan-400 hover:text-cyan-300"
        >
          Sign Up
        </button>
      </div>
    </form>
  )
}
