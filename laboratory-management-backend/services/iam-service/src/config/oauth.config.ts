import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuthService } from '../services/oauth.service.js';
import { userRepository } from '../repositories/index.js';
import dotenv from 'dotenv';

dotenv.config();

const oauthService = new OAuthService();

// Google OAuth configuration
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.WEB_URL}/api/google/callback`,
  proxy: true
};

// Initialize Google OAuth strategy
passport.use(
  new GoogleStrategy(
    googleConfig,
    async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
      try {
        const user = await oauthService.createOAuthUser({
          email: profile.emails?.[0]?.value || `google_${profile.id}@oauth.local`,
          fullName: profile.displayName || 'Google User',
          provider: 'google',
          providerId: profile.id,
          avatar: profile.photos?.[0]?.value || undefined,
        });

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

// Temporary storage of user stuffs (still needed for Passport)
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
export { googleConfig };
