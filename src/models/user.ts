import * as mongoose from 'mongoose'
import { NextFunction } from 'express'
import * as bcrypt from 'bcrypt-nodejs'

const UserSchema = new mongoose.Schema({
    email: 
    { 
      type: String, 
      unique: true 
    },
    password: String,
    tokens: [String],
    facebook: {
        id: String,
        name: String
      },
    roles: [],
    isAdmin: Boolean,
    profile: {
        firstname: String,
        surname: String,
        gender: String,
        age: Number,
        location: String,
        website: String,
        picture: String
      },
      historyId: mongoose.Schema.Types.ObjectId,
      programs: [mongoose.Schema.Types.ObjectId],
      points: Number,
      lessons: [],
      dayLogged: Number,
      lastLogged: Date
}, { timestamps: true })

/**
 * Password hash middleware.
 */
UserSchema.pre('save', function save(next: NextFunction) {
    const user: any = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (err: any, salt: any) => {
      if (err) { return next(err); }
      bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash: string) => {
        if (err) { return next(err); }
        user.password = hash;
        next();
      });
    });
  });

UserSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: any) => {}) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    });
};

const User = mongoose.model('User', UserSchema);
export default User;