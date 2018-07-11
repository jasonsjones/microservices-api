import { signUpUser } from '../user/user.repository';

export const mockUsersWithAvatar = [
    {
        _id: '59c44d83f2943200228467b3',
        updatedAt: '2017-11-21T16:24:16.413Z',
        createdAt: '2017-09-21T23:38:43.338Z',
        name: 'Roy Harper',
        email: 'roy@qc.com',
        password: '$2a$12$DyizVZatjn.zMHeOhQI5nuIX64417O2zuRKXe/Ae0f06bLupmZ/d6',
        passwordLastUpdatedAt: '2018-01-21T16:24:16.413Z',
        __v: 0,
        avatar: {
            _id: '59e4062a4c3bc800574e895f',
            updatedAt: '2017-11-21T16:24:16.403Z',
            createdAt: '2017-11-21T16:24:16.403Z',
            user: '59c44d83f2943200228467b3',
            fileSize: 138317,
            contentType: 'image/png',
            defaultImg: false
        },
        avatarUrl: 'http://localhost:3000/api/avatar/5a145330e6d09600aff70ef9',
        roles: ['user']
    },
    {
        _id: '59c44d83f2943200228467b1',
        updatedAt: '2017-09-21T23:38:45.575Z',
        createdAt: '2017-09-21T23:38:43.337Z',
        name: 'Oliver Queen',
        email: 'oliver@qc.com',
        password: '$2a$12$wwUJRxZdDzpZ5uK2u.7eNelWp6y4HT/WE/zzZ6e2L4VVvv/tJE2dK',
        passwordLastUpdatedAt: '2018-01-23T16:24:16.413Z',
        __v: 0,
        avatar: {
            _id: '59c44d85f2943200228467b4',
            updatedAt: '2017-09-21T23:38:45.572Z',
            createdAt: '2017-09-21T23:38:45.572Z',
            contentType: 'image/png',
            fileSize: 62079,
            user: '59c44d83f2943200228467b1',
            defaultImg: false
        },
        avatarUrl: 'http://localhost:3000/api/avatar/59c44d85f2943200228467b4',
        roles: ['admin', 'user']
    },
    {
        _id: '59c6c317f9760b01a35c63b1',
        updatedAt: '2017-11-16T17:56:35.118Z',
        createdAt: '2017-09-23T20:24:55.748Z',
        name: 'Jason Jones',
        email: 'jsjones96@gmail.com',
        password: '$2a$12$5GCSOcQgHZ1tJHaMiOvvXOcFCoOoZCmjkQfD9hd/vIrF/dm0zrXa2',
        passwordLastUpdatedAt: '2018-03-27T16:24:16.413Z',
        __v: 0,
        avatar: null,
        avatarUrl: 'http://localhost:3000/api/avatar/default',
        roles: ['user']
    }
];

export const mockUsers = [
    {
        _id: '59c44d83f2943200228467b3',
        updatedAt: '2017-11-21T16:24:16.413Z',
        createdAt: '2017-09-21T23:38:43.338Z',
        name: 'Roy Harper',
        email: 'roy@qc.com',
        password: '$2a$12$DyizVZatjn.zMHeOhQI5nuIX64417O2zuRKXe/Ae0f06bLupmZ/d6',
        passwordLastUpdatedAt: '2018-01-21T16:24:16.413Z',
        avatar: '59e4062a4c3bc800574e895f',
        avatarUrl: 'http://localhost:3000/api/avatar/5a145330e6d09600aff70ef9',
        roles: ['user']
    },
    {
        _id: '59c44d83f2943200228467b1',
        updatedAt: '2017-09-21T23:38:45.575Z',
        createdAt: '2017-09-21T23:38:43.337Z',
        name: 'Oliver Queen',
        email: 'oliver@qc.com',
        password: '$2a$12$wwUJRxZdDzpZ5uK2u.7eNelWp6y4HT/WE/zzZ6e2L4VVvv/tJE2dK',
        passwordLastUpdatedAt: '2018-01-23T16:24:16.413Z',
        avatar: '59c44d85f2943200228467b4',
        avatarUrl: 'http://localhost:3000/api/avatar/59c44d85f2943200228467b4',
        roles: ['admin', 'user']
    },
    {
        _id: '59c6c317f9760b01a35c63b1',
        updatedAt: '2017-11-16T17:56:35.118Z',
        createdAt: '2017-09-23T20:24:55.748Z',
        name: 'Jason Jones',
        email: 'jsjones96@gmail.com',
        password: '$2a$12$5GCSOcQgHZ1tJHaMiOvvXOcFCoOoZCmjkQfD9hd/vIrF/dm0zrXa2',
        passwordLastUpdatedAt: '2018-03-27T16:24:16.413Z',
        avatar: null,
        avatarUrl: 'http://localhost:3000/api/avatar/default',
        roles: ['user']
    }
];

export const mockRandomUser = {
    gender: 'male',
    name: {
        title: 'mr',
        first: 'perry',
        last: 'lewis'
    },
    location: {
        street: '8943 wycliff ave',
        city: 'norman',
        state: 'arizona',
        postcode: 56747,
        coordinates: {
            latitude: '16.9829',
            longitude: '-123.0333'
        },
        timezone: {
            offset: '+5:00',
            description: 'Ekaterinburg, Islamabad, Karachi, Tashkent'
        }
    },
    email: 'perry.lewis@example.com',
    login: {
        uuid: 'c8aef908-fdf9-412d-8e3b-71e77edb389d',
        username: 'brownpeacock509',
        password: 'true',
        salt: '9Z9Kgl1G',
        md5: '39ff6e2e77988289b36783158cde775c',
        sha1: '5b47f0aafc79bdf0f7e9c2159403011be29034cb',
        sha256: '26985ebbbaf183d9f571dc1b421b5fd8eb24d518d1e5d863ad66ede20ca61344'
    },
    dob: {
        date: '1949-03-30T14:50:16Z',
        age: 69
    },
    registered: {
        date: '2016-10-28T12:48:48Z',
        age: 1
    },
    phone: '(498)-615-5896',
    cell: '(772)-179-7640',
    id: {
        name: 'SSN',
        value: '293-84-6915'
    },
    picture: {
        large: 'https://randomuser.me/api/portraits/men/47.jpg',
        medium: 'https://randomuser.me/api/portraits/med/men/47.jpg',
        thumbnail: 'https://randomuser.me/api/portraits/thumb/men/47.jpg'
    },
    nat: 'US'
};

export const createUser = userData => {
    return signUpUser(userData);
};
