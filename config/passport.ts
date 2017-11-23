import * as passport from 'passport'
import * as passportFacebook from 'passport-facebook';
import * as passportGithub from 'passport-github2';
import User from '../src/models/user';
import config from '../config'

const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});
  
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url,
    profileFields: ["name", "email", "link", "locale", "timezone"],
    passReqToCallback: true
  }, (req: any, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      User.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          req.flash("errors", { msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
          done(err);
        } else {
          User.findById(req.user.id, (err, user: any) => {
            if (err) { return done(err); }
            user.facebook = profile.id;
            user.tokens.push({ kind: "facebook", accessToken });
            user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = user.profile.gender || profile._json.gender;
            user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.save((err: Error) => {
              req.flash("info", { msg: "Facebook account has been linked." });
              done(err, user);
            });
          });
        }
      });
    } else {
      User.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          return done(undefined, existingUser);
        }
        User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
          if (err) { return done(err); }
          if (existingEmailUser) {
            req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
            done(err);
          } else {
            const user: any = new User();
            user.email = profile._json.email;
            user.facebook = profile.id;
            user.tokens.push({ kind: "facebook", accessToken });
            user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = profile._json.gender;
            user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.profile.location = (profile._json.location) ? profile._json.location.name : "";
            user.save((err: Error) => {
              done(err, user);
            });
          }
        });
      });
    }
  }));

export default passport;