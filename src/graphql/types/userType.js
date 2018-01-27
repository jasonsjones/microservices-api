import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} from 'graphql';

// User Type
export default new GraphQLObjectType({
    name: 'User',
    description: 'Simple user type to represent a user of the system',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        roles: {type: new GraphQLList(GraphQLString)},
        avatar: {type: GraphQLString},
        avatarUrl: {type: GraphQLString}
    })
});
