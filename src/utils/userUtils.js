export const normalizeRandomUserData = randomUserData => {
    return {
        name: `${titleCase(randomUserData.name.first)} ${titleCase(randomUserData.name.last)}`,
        email: randomUserData.email,
        avatarUrl: randomUserData.picture.medium,
        avatar: 'mock avatar id',
        roles: ['user']
    };
};

const titleCase = word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
};
