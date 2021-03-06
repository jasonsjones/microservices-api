import { generateRandomToken } from '../common/auth.utils';

export const normalizeRandomUserData = randomUserData => {
    return {
        name: {
            first: titleCase(randomUserData.name.first),
            last: titleCase(randomUserData.name.last)
        },
        email: randomUserData.email,
        isEmailVerified: false,
        emailVerificationToken: generateRandomToken(),
        avatarUrl: randomUserData.picture.medium,
        avatar: 'mock avatar id',
        roles: ['user']
    };
};

const titleCase = word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
};
