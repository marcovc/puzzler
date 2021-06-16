//import { PrismaClient } from '@prisma/client';
//import _ from '@prisma/client';
//const { PrismaClient } = _;
import { PrismaClient } from '@prisma/client';

import { ApolloServer } from 'apollo-server'

import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { resolvers as generatedResolvers} from "../node_modules/@generated/type-graphql";
import { resolvers as customResolvers} from "./custom_resolvers";

async function main() {
  const schema = await buildSchema({
    resolvers: [...generatedResolvers, ...customResolvers],
    validate: true,
    emitSchemaFile: true,
  });

  const prisma = new PrismaClient();

  const server = new ApolloServer({
    schema,
    context: Context => ({ prisma }),
    playground: {
      endpoint: "/dev/graphql"
    }
  });

  server.listen({ port: 4000 });
}

main();
