import { GraphQLSchema } from 'graphql';

import RootQuery from './query';
import RootMutation from './mutation';

export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
