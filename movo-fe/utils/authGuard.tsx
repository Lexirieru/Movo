"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/utils/auth";

export function useAuth(protectedRoute: boolean = false) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const data = await getMe(); // 🔗 panggil getMe()
      if (data && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
        if (protectedRoute) {
          router.push("/login"); // redirect kalau halaman butuh login
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [protectedRoute, router]);

  return { user, loading, authenticated: !!user };
}
