import { expect } from 'chai';
import debug from 'debug';

const log = debug('test');

export const expectJSONShape = (json, modelName) => {
    expect(json).to.be.an('Object');
    expect(json).to.have.property('success');
    expect(json).to.have.property('message');
    expect(json).to.have.property('payload');
    if (modelName) {
        expect(json.payload).to.have.property(modelName);
    }
};

export const setupEnv = () => {
    log(`*** Running in ${process.env.NODE_ENV} mode`);
};
