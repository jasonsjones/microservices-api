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
