"use client";
import { getMe } from "@/utils/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserInfo = {
  _id: string;
  email: string;
  companyId: string;
  companyName: string;
};

type UserContextType = {
  user: UserInfo | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>; // supaya bisa update
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await getMe();
        console.log("Fetched user:", userData);
        setUser(userData);
      } catch (error) {
        console.error("User not logged in or session expired: ", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
