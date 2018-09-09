import fetch from 'node-fetch';

export const fetchRandomUsers = () => {
    return fetch('https://randomuser.me/api?nat=us').then(response => response.json());
};
