// SPDX-License-Identifier: MIT

pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

struct IntRange {
    int lb;
    int ub;
}

enum IntSetType {
    LIST,
    RANGE
}

struct IntSet {
    IntSetType kind;
    uint data;
}

enum Functor {
    INT_INDOMAIN,
    ARRAY_INT_ELEMENT,
    ARRAY_INT_MAXIMUM,
    ARRAY_INT_MINIMUM,
    ARRAY_VAR_INT_ELEMENT,
    INT_ABS,
    INT_DIV,
    INT_EQ
}

struct Constraint {
    Functor functor;
    uint[] args;
}

enum ProblemType {
    SATISFY,
    MINIMIZE,
    MAXIMIZE
}

enum VarType {
  BOOL,
  INT,
  INTSET
}

struct Problem {
    uint[] boolVars;
    uint[] intVars;
    uint[] intSetVars;
    bool[] bools;
    int[] ints;
    int[][] intLists;
    IntRange[] intRanges;
    IntSet[] intSets;
    uint[][] arrays;
    Constraint[] constraints;
    ProblemType problemType;
    VarType optimizeVarType;
    uint optimizeVar;
}

struct Solution {
    bool[] boolVals;
    int[] intVals;
    // TODO: intset's
}

contract Puzzler {

    // State:

    // Maps problemId to address of problem creator.
    mapping(bytes32 => address) public problemCreators;
    // Maps solutionId to address of solution creator.
    mapping(bytes32 => address) public problemSolvers;
    // Maps problemId to best (lowest) objective value so far.
    mapping(bytes32 => int) public problemObjValues;

    // Events:
    event NewProblem(address submitter, bytes32 problemId);
    event NewSolution(address submitter, bytes32 problemId);

    // Public methods:
    function addProblem(Problem calldata problem) public {

        // Check if well defined and not trivial.
        require(problem.boolVars.length + problem.intVars.length + problem.intSetVars.length > 0, "Problem is undefined.");
        require(problem.constraints.length > 0, "Problem is trivial.");

        // could do other sanity checks, e.g. non-empty domains

        // Get problem hash.
        bytes32 problemId = keccak256(abi.encode(problem));

        // Check if there isn't a problem with the same problemId.
        require(!hasProblem(problemId), "Problem already exists.");

        problemCreators[problemId] = msg.sender;

        emit NewProblem(msg.sender, problemId);
    }

    function addSolution(Problem memory problem, Solution calldata solution) public {
        // Get problem hash.
        bytes32 problemId = keccak256(abi.encode(problem));

        // Check if problem exists.
        require(hasProblem(problemId), "Unexisting problem.");

        // Copy values from solution into problem data
        fixVariables(problem, solution);

        // Check if constraints are satisfied.
        for (uint256 index = 0; index < problem.constraints.length; index++) {
            require(constraintIsSatisfied(problem, index), "Not a solution.");
        }

        int objectiveValue = computeObjectiveValue(problem, solution);

        // Check if objective function value is lower than best solution submitted so far.
        if (hasSolution(problemId)) {
            require(objectiveValue < problemObjValues[problemId], "Not optimal.");
        }

        problemSolvers[problemId] = msg.sender;
        problemObjValues[problemId] = objectiveValue;

        emit NewSolution(msg.sender, problemId);
    }

    function hasProblem(bytes32 problemId) public view returns (bool) {
        return problemCreators[problemId] != address(0);
    }

    function hasSolution(bytes32 problemId) public view returns (bool) {
        return problemSolvers[problemId] != address(0);
    }

    // Private methods:

    function fixVariables(Problem memory problem, Solution calldata solution) private pure {
        require(solution.boolVals.length == problem.boolVars.length, "Problem/solution mismatch.");

        for (uint256 index = 0; index < problem.boolVars.length; index++) {
            problem.bools[problem.boolVars[index]] = solution.boolVals[index];
        }

        require(solution.intVals.length == problem.intVars.length, "Problem/solution mismatch.");

        for (uint256 index = 0; index < problem.intVars.length; index++) {
            problem.ints[problem.intVars[index]] = solution.intVals[index];
        }

        // TODO: intset's
    }

    function constraintIsSatisfied(Problem memory problem, uint idx) private view returns (bool) {
        if (problem.constraints[idx].functor == Functor.INT_INDOMAIN) {
            return intIndomainIsSatisfied(problem, idx);
        }
        else 
        if (problem.constraints[idx].functor == Functor.ARRAY_INT_ELEMENT) {
            return arrayIntElementIsSatisfied(problem, idx);
        }
        else
            return false;
    }

    function computeObjectiveValue(Problem memory /*problem*/, Solution calldata /*solution*/) private pure returns (int) {
        return 0;
    }


    function intIndomainIsSatisfied(
        Problem memory problem,
        uint idx
    ) private pure returns (bool) {
        uint valIdx = problem.constraints[idx].args[0];
        int val = problem.ints[valIdx];
        uint intSetIdx = problem.constraints[idx].args[1];

        IntSetType intSetType = problem.intSets[intSetIdx].kind;
        if (intSetType == IntSetType.LIST) {
            uint intListIdx = problem.intSets[intSetIdx].data;
            for (uint256 index = 0; index < problem.intLists[intListIdx].length; index++)
                if (problem.intLists[intListIdx][index] == val)
                    return true;
            return false;
        }
        else {
            assert(intSetType == IntSetType.RANGE);
            uint intRangeIdx = problem.intSets[intSetIdx].data;
            return problem.intRanges[intRangeIdx].lb <= val && val <= problem.intRanges[intRangeIdx].ub;
        }
    }

    function arrayIntElementIsSatisfied(
        Problem memory problem,
        uint idx
    ) private pure returns (bool) {
        uint idxIdx = problem.constraints[idx].args[0];
        uint arrayIdx = problem.constraints[idx].args[1];
        uint rhsIdx = problem.constraints[idx].args[2];
        
        if (problem.ints[idxIdx] <= 0)
            return false;
        uint index = uint(problem.ints[idxIdx]);
        if (index > problem.arrays[arrayIdx].length)
            return false;
        // Arrays in flatzinc are base 1.
        int lhs = problem.ints[problem.arrays[arrayIdx][index - 1]];
        int rhs = problem.ints[rhsIdx];
        return lhs == rhs;
    }
}
