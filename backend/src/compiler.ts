import { writeFile } from 'fs/promises';
import { exec as child_exec } from 'child_process';
import { promisify } from 'util';
import { file } from 'tmp-promise';
import { Encoder } from './abi';
import { parse as parseFzn} from './fzn.js';
import { parse as parseDzn} from './dzn.js';
import { timeStamp } from 'console';

const exec = promisify(child_exec);


const MINIZINC_DIR = '/home/marco/other/MiniZincIDE-2.5.1-bundle-linux-x86_64';


async function runMinizinc(mznSource: string, mznArgs: string) {
    // create tmp file
    const { fd, path, cleanup } = await file({ postfix: ".mzn" });
    await writeFile(path, mznSource);
    const cmd = `${MINIZINC_DIR}/bin/minizinc ${path} -Gstd ${mznArgs} --output-mode json`;
    let r;
    try {
        const { stdout, stderr } = await exec(cmd);
        r = { valid: true, stdout, stderr };
    }
    catch (e) {
        console.log("got error executing minizinc:", e);
        r = { valid: false, stdout: "", stderr: e.stderr };
    }
    cleanup();
    return r;
}

async function getMznModelInfo(modelMzn: string, instanceMzn: string): Promise<object> {

    let modelValid = false;
    let instanceValid = false;
    let stdout = "";
    let stderr = "";
    let missingParameters: string[] = [];
    let outputVariables: string[] = [];

    // check model in isolation
    ({ valid: modelValid, stdout, stderr } = await runMinizinc(modelMzn, "--model-check-only"));
    if (!modelValid) {
        return { modelValid, instanceValid, missingParameters, outputVariables, stderr }
    }

    // check instance
    const allMzn = modelMzn.concat("\n").concat(instanceMzn);

    // compute missing parameters
    ({ valid: instanceValid, stdout, stderr } = await runMinizinc(allMzn, "--model-interface-only"));
    if (instanceValid) {
        const iface = JSON.parse(stdout)
        missingParameters = Object.keys(iface.input);
        outputVariables = Object.keys(iface.output);
    }

    // check if model + instance is valid
    ({ valid: instanceValid, stdout, stderr } = await runMinizinc(allMzn, "--instance-check-only"));
    return { modelValid, instanceValid, missingParameters, outputVariables, stderr };
}

async function getFzn(modelMzn: string, instanceMzn: string): Promise<string> {
    const allMzn = modelMzn.concat("\n").concat(instanceMzn);

    const { valid, stdout, stderr } = await runMinizinc(allMzn, "-c --output-to-stdout");
    return stdout;
}

export async function compileMzn(modelMzn: string, instanceMzn: string): Promise<any> {
    const fzn = await getFzn(modelMzn, instanceMzn);
    //console.log(fzn);
    const parsed = parseFzn(fzn);
    //console.log(parsed);
    const encoder = new Encoder();
    encoder.encodeProblem(parsed);
    const problem = encoder.instance();
    const varMap = encoder.varMap();

    //console.log(JSON.stringify(encoded, null, 2));
    return {problem, varMap};
}

export async function compileDzn(dzn: string): Promise<any> {
    const parsed = parseDzn(dzn);
    //console.log(parsed);
    //console.log(JSON.stringify(parsed, null, 2));

    const encoder = new Encoder();
    const solution = encoder.encodeSolution(parsed);

    console.log(JSON.stringify(solution, null, 2));
    console.log(JSON.stringify(encoder.instance(), null, 2));
    /*
    const problem = encoded.instance();
    const varMap = encoded.varMap();
    console.log(JSON.stringify(encoded, null, 2));
    return {problem, varMap};*/
}

async function test() {
    //const compiled = await compileMzn("var int: i; constraint i == 1; solve satisfy;", "");
    const compiled = await compileMzn("var int: i; var int: j; constraint i < j; solve satisfy;", "");
    //const compiled = await compileDzn("i = 1; j = 2; k = [1,2,3];");
    console.log(JSON.stringify(compiled, null, 2));
}

test();
