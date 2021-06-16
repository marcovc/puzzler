import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { Puzzler__factory, Puzzler } from "../typechain";
import { compileMzn } from "../../backend/src/compiler";
import { IProblem, ISolution } from "./shared";

chai.use(solidity);
chai.use(chaiAsPromised);
chai.should();

describe("Puzzler", () => {
  let puzzler: Puzzler;

  beforeEach(async () => {
    const signers = await ethers.getSigners();

    const puzzlerFactory = (await ethers.getContractFactory(
      "Puzzler",
      signers[0]
    )) as Puzzler__factory;
    puzzler = await puzzlerFactory.deploy();
    await puzzler.deployed();
  });

  describe("create problem", async () => {
    it("should revert when problem is undefined", async () => {
      const {problem} = await compileMzn("solve satisfy;", "");
      return await puzzler.addProblem(problem).should.be.rejectedWith(Error, 'Problem is undefined');
    });
    it("should work for valid problem", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      return await puzzler.addProblem(problem).should.be.fulfilled;
    });
    it("should revert when problem already exists", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      await puzzler.addProblem(problem).should.be.fulfilled;
      return await puzzler.addProblem(problem).should.be.rejectedWith(Error, "Problem already exists.");
    });
  });

  describe("create solution", async () => {
    it("should revert when problem does not exist", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      const solution = {
        boolVals: [],
        intVals: [1], 
      } as ISolution;
      return await puzzler.addSolution(problem, solution).should.be.rejectedWith(Error, 'Unexisting problem.');
    });
    it("should revert when the solution does not match problem", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      await puzzler.addProblem(problem).should.be.fulfilled;
      const solution = {
        boolVals: [true],
        intVals: [],
      } as ISolution;
      return await puzzler.addSolution(problem, solution).should.be.rejectedWith(Error, 'Problem/solution mismatch.');
    });
    it("should revert when the solution is not a solution to the problem", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      await puzzler.addProblem(problem).should.be.fulfilled;
      const solution = {
        boolVals: [],
        intVals: [2],
      } as ISolution;
      return await puzzler.addSolution(problem, solution).should.be.rejectedWith(Error, 'Not a solution.');
    });
    it("should accept a trivial solution for int_indomain", async () => {
      const {problem} = await compileMzn("var int: i; constraint i = 1; solve satisfy;", "");
      await puzzler.addProblem(problem).should.be.fulfilled;
      const solution = {
        boolVals: [],
        intVals: [1],
      } as ISolution;
      return await puzzler.addSolution(problem, solution).should.be.fulfilled;
    });
    it("should accept a trivial solution for array_int_element", async () => {
      const {problem} = await compileMzn("array [1..3] of int: a = [4,5,9]; var int: i; constraint a[i] = 5; solve satisfy;", "");
      await puzzler.addProblem(problem).should.be.fulfilled;
      const solution = {
        boolVals: [],
        intVals: [2],
      } as ISolution;
      return await puzzler.addSolution(problem, solution).should.be.fulfilled;
    });
  });
});
