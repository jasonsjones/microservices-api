import { expect } from 'chai';

export const expectAvatarShape = (payload, showData) => {
    expect(payload).to.have.property('contentType');
    expect(payload).to.have.property('fileSize');
    expect(payload).to.have.property('createdAt');
    expect(payload).to.have.property('updatedAt');
    if (showData) {
        expect(payload).to.have.property('data');
    }
};

export const mockAvatars = [
    {
        _id: '59c44d83f2943200228467b0',
        contentType: 'image/png',
        fileSize: 5012,
        defaultImg: true,
        user: undefined
    },
    {
        _id: '59c44d85f2943200228467b4',
        contentType: 'image/png',
        fileSize: 62079,
        defaultImg: false,
        user: '59c44d83f2943200228467b1'
    },
    {
        _id: '59e4062a4c3bc800574e895f',
        contentType: 'image/png',
        fileSize: 138317,
        defaultImg: false,
        user: '59c44d83f2943200228467b3'
    }
];
