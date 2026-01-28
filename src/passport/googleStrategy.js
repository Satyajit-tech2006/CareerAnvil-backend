import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import crypto from "crypto";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // User found, proceed to login
            return done(null, user);
        }

        // 2. If new user, create them
        // We generate a random password since they used Google
        const randomPassword = crypto.randomBytes(20).toString('hex');
        
        // Generate a username from email (e.g., satyajit from satyajit@gmail.com)
        const baseUsername = profile.emails[0].value.split("@")[0];
        const uniqueUsername = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;

        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: uniqueUsername,
            password: randomPassword, 
            subscription: "freemium",
            role: "user"
        });

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;