import mongoose from 'mongoose';
import { expect } from 'chai';
import User from './user.model';
import * as middleware from './user.model.middleware';

mongoose.Promise = global.Promise;

describe('User model', () => {
    it('is invalid if name is empty', (done) => {
        let user = new User({
            /* no name */
            email: 'oliver@qc.com',
            password: 'arrow'
        });
        user.validate((err) => {
            expect(err.errors.name).to.exist;
            expect(err.name).to.equal('ValidationError');
            done()
        });
    });

    it('is invalid if email is empty', (done) => {
        let user = new User({
            name: 'Oliver Queen',
            /* no email */
            password: 'arrow'
        });
        user.validate((err) => {
            expect(err.errors.email).to.exist;
            expect(err.name).to.equal('ValidationError');
            done()
        });
    });

    it('is invalid if password is empty', (done) => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            /* no password */
        });
        user.validate((err) => {
            expect(err.errors.password).to.exist;
            expect(err.name).to.equal('ValidationError');
            done()
        });
    });

    it('it is valid if password is missing but there is a sfdc id', (done) => {
        let user = new User({
            name: 'Parker Harris',
            email: 'parker@salesforce.com',
            /* no password */
            sfdc: {
                id: '005360000021UcXAAU'
            }
        });
        user.validate((err) => {
            expect(err).to.not.exist;
            done()
        });

    });

    it('isAdmin() is true if user has an admin role', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['admin', 'user']
        });
        expect(user.isAdmin()).to.be.true;
    });

    it('isAdmin() is false if user does not have an admin role', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow'
        });
        expect(user.isAdmin()).to.be.false;
    });

    it('verifies a correct password', (done) => {
        const ORIG_PWD = 'arrow';
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: ORIG_PWD,
            isModified: () => {
                return true;
            }
        });
        // need to bind the middleware function to the user to ensure the
        // proper 'this' context from within the function
        middleware.hashPassword.bind(user, (err, user) => {
            expect(user.verifyPassword(ORIG_PWD)).to.be.true;
            done();
        })();
    }).timeout(6000);

    it('does not verify an incorrect password', (done) => {
        const ORIG_PWD = 'arrow';
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: ORIG_PWD,
            isModified: () => {
                return true;
            }
        });
        // need to bind the middleware function to the user to ensure the
        // proper 'this' context from within the function
        middleware.hashPassword.bind(user, (err, user) => {
            expect(user.verifyPassword('wrongPassword')).to.be.false;
            done();
        })();
    }).timeout(6000);

    it('adds a valid role to a user', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user']
        });
        user.addRole('admin');
        expect(user.roles).to.contain('user');
        expect(user.roles).to.contain('admin');
        expect(user.roles.length).to.equal(2);
    });

    it('does not add an invalid role to a user', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user']
        });
        user.addRole('superhero');
        expect(user.roles).to.contain('user');
        expect(user.roles).to.not.contain('superhero');
        expect(user.roles.length).to.equal(1);
    });

    it('does not add an empty role to a user', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user']
        });
        user.addRole('');
        expect(user.roles).to.contain('user');
        expect(user.roles.length).to.equal(1);
    });

    it('removes a valid role from a user', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'admin', 'dev']
        });
        expect(user.roles.length).to.equal(3);
        user.removeRole('admin');
        expect(user.roles.length).to.equal(2);
        expect(user.roles).to.not.contain('admin');
    });

    it('ignores removing an invalid role from a user', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'admin', 'dev']
        });
        expect(user.roles.length).to.equal(3);
        user.removeRole('invalidRole');
        expect(user.roles.length).to.equal(3);
    });

    it('ignores removing a valid role the user does not have', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'dev']
        });
        expect(user.roles.length).to.equal(2);
        user.removeRole('admin');
        expect(user.roles.length).to.equal(2);
    });

    it('toClientJSON() returns correctly shaped json when sfdc profile is not present', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'dev']
        });
        const clientJSON = user.toClientJSON();
        expect(clientJSON).to.be.an('object');
        expect(clientJSON).to.have.property('id');
        expect(clientJSON).to.have.property('name');
        expect(clientJSON).to.have.property('email');
        expect(clientJSON).to.have.property('avatarUrl');
        expect(clientJSON).to.have.property('roles');
        expect(clientJSON).to.have.property('hasSFDCProfile');
        expect(clientJSON.hasSFDCProfile).to.be.false;
    });

    it('toClientJSON() returns correctly shaped json when sfdc profile is present', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'dev'],
            sfdc: {
                id: '005D00000567AAC',
                accessToken: 'eadec234aadadcefff44532.ksoeijse44.soeindijsiehahuhw1234',
                refreshToken: null,
                profile: {
                    displayName: "Oliver Queen",
                }
            }
        });
        const clientJSON = user.toClientJSON();
        expect(clientJSON).to.be.an('object');
        expect(clientJSON).to.have.property('id');
        expect(clientJSON).to.have.property('name');
        expect(clientJSON).to.have.property('email');
        expect(clientJSON).to.have.property('avatarUrl');
        expect(clientJSON).to.have.property('roles');
        expect(clientJSON).to.have.property('hasSFDCProfile');
        expect(clientJSON.hasSFDCProfile).to.be.true;
    });

    it('hasCustomAvatar() returns false if user has default avatar', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            roles: ['user', 'dev'],
        });
        expect(user.hasCustomAvatar()).to.be.false;
    });

    it('hasCustomAvatar() returns true if user has a custom avatar', () => {
        let user = new User({
            name: 'Oliver Queen',
            email: 'oliver@qc.com',
            password: 'arrow',
            avatar: '5a4672606d106200aef2defb', // needs to be a valid mongo id
            roles: ['user', 'dev'],
        });
        expect(user.hasCustomAvatar()).to.be.true;
    });
});

