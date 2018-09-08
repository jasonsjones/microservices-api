export const normalizeRandomUserData = randomUserData => {
    return {
        name: `${titleCase(randomUserData.name.first)} ${titleCase(randomUserData.name.last)}`,
        email: randomUserData.email,
        isEmailVerified: false,
        emailVerificationToken: 'randomstringofchars4',
        avatarUrl: randomUserData.picture.medium,
        avatar: 'mock avatar id',
        roles: ['user']
    };
};

const titleCase = word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
};
