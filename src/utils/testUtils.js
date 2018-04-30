import { expect } from 'chai';

export const expectJSONShape = (json, modelName) => {
    expect(json).to.be.an('Object');
    expect(json).to.have.property('success');
    expect(json).to.have.property('message');
    expect(json).to.have.property('payload');
    if (modelName) {
        expect(json.payload).to.have.property(modelName);
    }
};
