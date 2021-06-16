
import { parse } from './fzn.js';

import fs from "fs";

//const parsed = parse("array [1..10] of var int: mark:: output_array([1..10]) = [0,X_INTRODUCED_1_,X_INTRODUCED_2_,X_INTRODUCED_3_,X_INTRODUCED_4_,X_INTRODUCED_5_,X_INTRODUCED_6_,X_INTRODUCED_7_,X_INTRODUCED_8_,X_INTRODUCED_9_]; solve satisfy;");


//const parsed = parse(`var {3,5,6}: i = 0x2; solve satisfy;`)

const stdinBuffer = fs.readFileSync('/dev/stdin');

const parsed = parse(stdinBuffer.toString());


//const parsed = parse(`array [1..10] of var int: mark = [0,X_INTRODUCED_1_,X_INTRODUCED_2_,X_INTRODUCED_3_,X_INTRODUCED_4_,X_INTRODUCED_5_,X_INTRODUCED_6_,X_INTRODUCED_7_,X_INTRODUCED_8_,X_INTRODUCED_9_];solve satisfy;`)
//const parsed = parse(`0x23`)

/*
const parsed = parse(
`array [1..2] of int: X_INTRODUCED_10_ = [1,-1];`
)*/

//console.log(JSON.stringify(parsed, null, 2))

import pkg from './abi.js';
const { Encoder } = pkg;

const encoder = new Encoder();
encoder.encodeProblem(parsed);

console.log(JSON.stringify(encoder.instance(), null, 2));

console.log(JSON.stringify(encoder.varMap(), null, 2));
