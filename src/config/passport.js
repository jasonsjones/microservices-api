import User from '../user/user.model';
import LocalStrategy from './strategies/local';
import ForceDotComStrategy from './strategies/sfdc';

export default (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    });

    passport.use('local', LocalStrategy);
    passport.use('forcedotcom', ForceDotComStrategy);
}
