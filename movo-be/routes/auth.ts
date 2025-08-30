import express, { NextFunction, Request, Response, Router } from "express";
import { generateToken } from "../config/generateToken";
import jwt from "jsonwebtoken";
import { LoginSessionTokenModel, UserModel } from "../models/userModel";
import bcrypt from "bcrypt";

const router: Router = express.Router();

router.get(
  "/check-auth",
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.user_session;
    if (!token) {
      console.log("Token not found");
      res
        .status(401)
        .json({ authenticated: false, message: "Token not found" });
      return;
    } else {
      try {
        // console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          _id: string;
          email: string;
        };

        const user = await UserModel.findOne({
          _id : decoded._id,
          email: decoded.email,
        });

        if (!user) {
          console.log("Invalid token");
          res
            .status(401)
            .json({ authenticated: false, message: "Invalid token" });
          return;
        } else {
          res.json({message : "Successfully authenticated", authenticated : true});
          return;
        }
      } catch (err) {
        console.error("Error while verifying token:", err);
        res.status(401).json({ authenticated: false, message: "Token error" });
        return;
      }
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "Account with specified email is not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }

      const token = await generateCookiesToken(email, user);

      res.cookie("user_session", token, {
        httpOnly: false, // sebaiknya true di production
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
      });

      res.status(200).json({
        message: "Login successful",
      });

      return;
    } catch (err) {
      console.error("Error while logging in:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
);



export async function generateCookiesToken(email : string, newUser : InstanceType<typeof UserModel>, ){
  const token = generateToken({
    _id: newUser._id.toString(),
    email: newUser.email,
  });

  const tokenSession = new LoginSessionTokenModel({
    _id : newUser._id.toString(),
    email,
    token,
  });
  
  await tokenSession.save();

  return token;
}

/*
// GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.CALLBACK_URL,
      passReqToCallback: true,
    },
    async function (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) {
      try {
        const existingCompany = await UserModel.findOne({
          companyId: profile.id,
        });

        if (existingCompany) {
          return done(null, existingCompany);
        } else {
          const newCompany = await UserModel.create({
            companyId: profile.id,
            email: profile.emails?.[0]?.value,
            companyName: profile.displayName,
            profilePicture: profile.photos?.[0]?.value || "",
          });
          return done(null, newCompany);
        }
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user!);
});

// GOOGLE AUTH ENDPOINT
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// GOOGLE CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const email = user?.email ?? user?.emails?.[0]?.value;

    if (email) {
      // ambil user terbaru
      const found = await UserModel.findOne({ email });

      const userToUse = found ?? user;

      const token = generateToken({
        _id: userToUse._id?.toString(),
        email: userToUse.email,
        companyName:
          userToUse.companyName || userToUse.name || userToUse.displayName,
        profilePicture: userToUse.profilePicture || "",
      });

      const tokenSession = new LoginSessionTokenModel({
        email,
        token,
      });
      await tokenSession.save();

      res.cookie("user_session", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
      });

      res.redirect(`${process.env.FRONTEND_URL}/transfer`);
      // res.redirect(`https://nusapay.vercel.app/transfer`);
      return;
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      // res.redirect(`https://nusapay.vercel.app/auth/error`);
      return;
    }
  }
);
*/

// LOGOUT
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ message: "Logout gagal" });
      return;
    }

    req.session.destroy(() => {
      res.clearCookie("user_session");

      res.status(200).json({ message: "Logout sukses" });
      return;
    });
  });
});

export default router;
