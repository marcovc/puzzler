
import { Resolver, Query, Ctx, Arg, Field, ObjectType} from "type-graphql";
import { exec as child_exec } from 'child_process';
import { promisify } from 'util';
import { file } from 'tmp-promise';
import { writeFile } from 'fs/promises';
import {strict as assert} from 'assert';


const exec = promisify(child_exec);

const MINIZINC_DIR = '/home/marco/other/MiniZincIDE-2.5.1-bundle-linux-x86_64';

@ObjectType()
class MznModelInfo {
  @Field()
  modelValid: Boolean

  @Field()
  instanceValid: Boolean

  @Field(type => [String])
  missingParameters: [String]

  @Field(type => [String])
  outputVariables: [String]

  @Field(type => String)
  stderr: String
}


async function runMinizinc(mznSource: String, mznArgs: String) {
  // create tmp file
  const {fd, path, cleanup} = await file({postfix: ".mzn"});
  await writeFile(path, mznSource);
  const cmd = `${MINIZINC_DIR}/bin/minizinc ${path} -Gstd ${mznArgs} --output-mode json`;
  let r;
  try {
    const {stdout, stderr} = await exec(cmd);
    r = {valid: true, stdout, stderr};
  }
  catch (e) {
    console.log("got error executing minizinc:", e);
    r = {valid: false, stdout: "", stderr: e.stderr};
  }
  cleanup();
  return r;
}

async function getMznModelInfo(modelMzn: String, instanceMzn: String): MznModelInfo {

  let modelValid = false;
  let instanceValid = false;
  let stdout = "";
  let stderr = "";
  let missingParameters = [];
  let outputVariables = [];

  // check model in isolation
  ({valid: modelValid, stdout, stderr} = await runMinizinc(modelMzn, "--model-check-only"));
  if (!modelValid) {
    return {modelValid, instanceValid, missingParameters, outputVariables, stderr}
  }

  // check instance
  const allMzn = modelMzn.concat("\n").concat(instanceMzn);

  // compute missing parameters
  ({valid: instanceValid, stdout, stderr} = await runMinizinc(allMzn, "--model-interface-only"));
  if (instanceValid) {
    const iface = JSON.parse(stdout)
    missingParameters = Object.keys(iface.input);
    outputVariables = Object.keys(iface.output);
  }

  // check if model + instance is valid
  ({valid: instanceValid, stdout, stderr} = await runMinizinc(allMzn, "--instance-check-only"));
  return {modelValid, instanceValid, missingParameters, outputVariables, stderr};
}

async function getEncodedFzn(modelMzn: String, instanceMzn: String) {
  const allMzn = modelMzn.concat("\n").concat(instanceMzn);
  
  const {valid, stdout, stderr} = await runMinizinc(allMzn, "-c --output-to-stdout");
  return stdout;
}


@Resolver()
export class MinizincResolver {

  @Query(returns => MznModelInfo)
  async getMznModelInfo(
    @Ctx() { prisma }: Context,
    @Arg("modelMzn") modelMzn: String,
    @Arg("instanceMzn") instanceMzn: String
  ): Promise<MznModelInfo> {
    return await getMznModelInfo(modelMzn, instanceMzn);
  }

  @Query(returns => String)
  async getEncodedFzn(
    @Ctx() { prisma }: Context,
    @Arg("modelMzn") modelMzn: String,
    @Arg("instanceMzn") instanceMzn: String
  ): Promise<String> {
    return await getEncodedFzn(modelMzn, instanceMzn);
  }

}

export const resolvers = [
  MinizincResolver
];

