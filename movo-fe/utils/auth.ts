// utils/auth.ts
import axios from "axios";

export const getMe = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/check-auth`,
      {
        withCredentials: true, // penting untuk kirim cookie `user_session`
      },
    );

    return res.data;
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("getMe error:", err.message || err);
    }
    return null;
  }
};
