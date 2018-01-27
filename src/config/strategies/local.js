import PassportLocal from 'passport-local';
import User from '../../user/user.model';

const LocalStrategy = PassportLocal.Strategy;

const opts = {
    usernameField: 'email'
};

const verifyCb = (email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if (err) return done(err);
        if (!user) {
            return done(null, false, {message: 'Incorrect username'});
        }

        if (!user.password) {
            return done(null, false, {message: 'User does not have a local account'});
        }

        if (!user.verifyPassword(password)) {
            return done(null, false, {message: 'Incorrect password'});
        }
        return done(null, user);
    });
};

export default new LocalStrategy(opts, verifyCb);
