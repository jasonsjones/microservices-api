import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import UserType from './types/userType';
import User from '../user/user.model';

// Root Mutation
export default new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        signup: {
            type: UserType,
            args: {
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            resolve: (parentValue, args) => {
                let newUser = new User({
                    name: args.name,
                    email: args.email,
                    password: args.password
                });
                return newUser.save()
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                return User.findByIdAndRemove(args.id).exec();
            }
        }
    }
});
