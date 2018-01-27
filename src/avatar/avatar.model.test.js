import mongoose from 'mongoose';
import { expect } from 'chai';
import Avatar from './avatar.model';

mongoose.Promise = global.Promise;

describe('Avatar Model', () => {
    it('is valid when all required fields are present', (done) => {
        let avatar = new Avatar({
            contentType: 'image/png',
            data: Buffer.alloc(10, 1),
            user: mongoose.Types.ObjectId(),
            defaultImg: false
        });
        avatar.validate(function (err) {
            expect(err).to.not.exist;
            done()
        });
    });

    it('is invalid if contentType is empty', (done) => {
        let avatar = new Avatar({
            /* no contentType */
            data: Buffer.alloc(10, 1),
            defaultImg: true
        });
        avatar.validate(function (err) {
            expect(err.errors.contentType).to.exist;
            expect(err.name).to.equal("ValidationError");
            done()
        });
    });

    it('is invalid if data is empty', (done) => {
        let avatar = new Avatar({
            contentType: 'image/png',
            /* no data */
            defaultImg: true
        });
        avatar.validate(function (err) {
            expect(err.errors.data).to.exist;
            expect(err.name).to.equal("ValidationError");
            done()
        });
    });

    it('is invalid if user is empty on a non default image', (done) => {
        let avatar = new Avatar({
            contentType: 'image/png',
            data: Buffer.alloc(10, 1),
            /* no user and defaultImg is false */
            defaultImg: false
        });
        avatar.validate(function (err) {
            expect(err.errors.user).to.exist;
            expect(err.name).to.equal("ValidationError");
            done()
        });
    });
});
