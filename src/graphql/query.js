import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} from 'graphql';

import UserType from './types/userType';
import AvatarType from './types/avatarType';

import * as userRepository from '../user/user.repository';
import Avatar from '../avatar/avatar.model';

// Root Query
export default new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'The root query type',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLString}
            },
            resolve: (parentValue, args) => userRepository.getUser(args.id)
        },
        users: {
            type: new GraphQLList(UserType),
            resolve: () => userRepository.getUsers()
        },
        avatars: {
            type: new GraphQLList(AvatarType),
            resolve: () => Avatar.find({}).exec()
        }
    }
});
