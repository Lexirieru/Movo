"use client";
import { Mail, Lock, UserRound  } from "lucide-react"

// Definisikan tipe untuk props
interface RegisterFormProps {
  switchToLogin: () => void;
}

export default function RegisterForm({ switchToLogin }: RegisterFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Tambahkan logika register di sini
    console.log("Register submitted");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="relative flex items-center">
        <UserRound className="absolute left-3 text-gray-400 w-5 h-5" />
        <input
          type="fullName"
          id="fullName"
          name="fullName"
          placeholder="Full Name"
          required
          className="w-full pl-10 pr-3 py-2 rounded-md bg-transparent border border-transparent text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
        />
      </div>
      
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


      
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-transform"
        >
          Sign Up
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={switchToLogin}
          className="font-medium text-cyan-400 hover:text-cyan-300"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
