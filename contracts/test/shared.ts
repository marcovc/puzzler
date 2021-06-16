
import {
    BigNumberish,
} from "ethers";

export interface IProblem  {
    boolVars: BigNumberish[];
    intVars: BigNumberish[];
    intSetVars: BigNumberish[];
    bools: boolean[];
    ints: BigNumberish[];
    intLists: BigNumberish[][];
    intRanges: { lb: BigNumberish; ub: BigNumberish }[];
    intSets: { kind: BigNumberish; data: BigNumberish }[];
    arrays: BigNumberish[][];
    constraints: { functor: BigNumberish; args: BigNumberish[] }[];
    problemType: BigNumberish;
    optimizeVarType: BigNumberish;
    optimizeVar: BigNumberish;
  }

export interface ISolution  {
    boolVals: boolean[];
    intVals: BigNumberish[];
}
