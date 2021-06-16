import {strict as assert, throws} from 'assert';

const IntSetType = {
  LIST: 0,
  RANGE: 1
};

const ProblemType = {
  SATISFY: 0,
  MINIMIZE: 1,
  MAXIMIZE: 2
};

const VarType = {
  BOOL: 0,
  INT: 1,
  INTSET: 2
};

const ConstraintFunctor = {
  INT_INDOMAIN: 0,
  ARRAY_INT_ELEMENT: 1,
};

class IdIdxMap {
  constructor() {
    this.ids = [];
    this.idxs = {}; 
  }
  size() {
    return this.ids.length;
  }
  getIdx(id) {
    return this.idxs[id];
  }
  getId(idx) {
    return this.ids[idx];
  }
  addIfNotExists(id) {
    if (id in this.idxs)
      return this.idxs[id];
    else {
      const idx = this.ids.length;
      this.ids.push(id);
      this.idxs[id] = idx;
      return idx;
    }
  }
};

export class Encoder {
  constructor() {
    this.boolVarMap = {};
    this.intVarMap = {};
    this.intSetVarMap = {};
    this.boolMap = new IdIdxMap();
    this.intMap =  new IdIdxMap();
    this.intListMap = new IdIdxMap();
    this.intRangeMap = new IdIdxMap();
    this.intSetMap = new IdIdxMap();
    this.arrayMap = new IdIdxMap();
    this.constraints = [];
  }
  addBoolVar(ref, idx) {
    return this.boolVarMap[ref.identifier] = idx;
  }
  addIntVar(ref, idx) {
    return this.intVarMap[ref.identifier] = idx;
  }
  addIntSetVar(ref) {
    return this.intSetVarMap[ref.identifier] = idx;
  }
  addInt(v) {
    return this.intMap.addIfNotExists(v);
  }
  addBool(v) {
    return this.boolMap.addIfNotExists(v);
  }
  addIntList(v) {
    return this.intListMap.addIfNotExists(v);
  }
  addIntRange(v) {
    return this.intRangeMap.addIfNotExists(v);
  }
  addIntSet(v) {
    return this.intSetMap.addIfNotExists(v);
  }
  addArray(v) {
    return this.arrayMap.addIfNotExists(v);
  }
  addConstraint(c) {
    this.constraints.push(c);
  }
  setOptimizeGoal(sense, variableType, variable) {
    this.problemType = sense;
    this.optimizeVarType = variableType;
    this.optimizeVar = variable;
  }
  instance() {
    return {
      boolVars: Object.values(this.boolVarMap),
      intVars: Object.values(this.intVarMap),
      intSetVars: Object.values(this.intSetVarMap),
      bools: this.boolMap.ids,
      ints: this.intMap.ids,
      intLists: this.intListMap.ids,
      intRanges: this.intRangeMap.ids,
      intSets: this.intSetMap.ids,
      arrays: this.arrayMap.ids,
      constraints: this.constraints,
      problemType: this.problemType,
      optimizeVarType: this.optimizeVarType,
      optimizeVar: this.optimizeVar,
    };
  }
  varMap() {
    return {
      boolVars: Object.keys(this.boolVarMap),
      intVars: Object.keys(this.intVarMap),
      intSetVars: Object.keys(this.intSetVarMap),
    }
  }

  encodeBasicRef(expr) {
    const ref = this.vars[expr.value];
    if (ref.meta === "PAR")
      return this.encodeBasicExpr(ref.expr);
    assert.equal(ref.meta, "VAR");

    if (ref.expr)
      return this.encodeBasicExpr(ref.expr);

    if (ref.type === "BOOL") {
      const idx = this.addBool(0)
      this.addBoolVar(ref, idx);
      return idx;
    }

    if (ref.type === "INT") {
      const idx = this.addInt(0)
      this.addIntVar(ref, idx);
      return idx;
    }

    if (ref.type === "INTSET") {
      const idx = this.addIntSet([IntSetType.LIST, []]);
      this.addIntSetVar(ref, idx);
      return idx;
    }

    throw "Unreachable";
  }

  encodeBasicExpr(expr) {
    if (expr.meta === "BOOL_LIT")
      return this.addBool(expr.value) // ["BOOL_LIT", this.addBool(expr.value)];
    if (expr.meta === "INT_LIT")
      return this.addInt(expr.value) // ["INT_LIT", this.addInt(expr.value)];
    if (expr.meta === "INTSET_LIT" && expr.value.list_type === "VALUES")
      return this.addIntSet([IntSetType.LIST, this.addIntList(expr.value.values)]);
    if (expr.meta === "INTSET_LIT" && expr.value.list_type === "RANGE")
      return this.addIntSet([IntSetType.RANGE, this.addIntRange([expr.value.lb, expr.value.ub])]);
    if (expr.meta === "REF")
      return this.encodeBasicRef(expr);
  }

  encodeParExpr(expr) {
    if (expr.meta === "PAR_ARRAY_LIT")
      return this.addArray(expr.values.map(this.encodeBasicExpr.bind(this))); //this.addIntLRListLit(expr.values.map(encodeBasicExpr));
    return this.encodeBasicExpr(expr);
  }

  encodeRef(expr) {
    const ref = this.vars[expr.value];
    if (ref.meta === "PAR_ARRAY")
      return this.encodeParExpr(ref.expr);
    if (ref.meta === "VAR_ARRAY")
      return this.addArray(ref.expr.values.map(this.encodeBasicExpr.bind(this)));
  }

  encodeExpr(expr) {
    if (expr.meta === "ARRAY_LIT")
      return this.addArray(expr.values.map(this.encodeBasicExpr.bind(this)));
    else
    if (expr.meta === "REF" && this.vars[expr.value].size !== undefined)
      return this.encodeRef(expr);
    else
      return this.encodeBasicExpr(expr);
  }

  encodeConstraint(c) {
    return [ConstraintFunctor[c.identifier.toUpperCase()], c.args.map(this.encodeExpr.bind(this))]
  }
 
  encodeProblem(instance) {
    const { par_decl_items, var_decl_items, constraint_items, solve_item } = instance;
  
    // Collect all pars/vars.
    this.vars = Object.fromEntries([
      ...par_decl_items.map(
        i => [i.identifier, i]
      ),
      ...var_decl_items.map(
        i => [i.identifier, i]
      )
    ]);
  
    // Add constraints for enforcing domain relations.
    var_decl_items.filter(
        i => i.meta === "VAR" && i.domain.list_type !== "FULL"
      ).map(
        i => ({
          identifier: `${i.type.toLowerCase()}_indomain`,
          args: [
            {
              meta: "REF",
              value: i.identifier,
            },
            {
              meta: "INTSET_LIT",
              value: i.domain
            }
          ]
        })
      ).forEach(c => constraint_items.push(c));
  
  
    // ======= constraint_items =======
  
    constraint_items.map(this.encodeConstraint.bind(this)).forEach(this.addConstraint.bind(this));
  
    /*
    // collect decisions vars
    function isFunctionallyDependent(v) {
      return v.annotations.some(a => a.identifier === "is_defined_var");
    }
    const decisionVars = var_decl_items.filter(v => v.meta === "VAR" && !isFunctionallyDependent(v));
  
  
    decisionVars.map(v => {
      if (v.expr !== undefined)
    })*/
  
    // goal
  
    if (solve_item.expr !== undefined) {
      const varType = VarType[this.vars[solve_item.expr.value].type];
      this.setOptimizeGoal(ProblemType[solve_item.type], varType, this.encodeBasicExpr(solve_item.expr));
    }
    else {
      this.setOptimizeGoal(ProblemType[solve_item.type], 0, 0);
    }
  }

  encodeSolution(instance) {
    const { par_inst_items } = instance;
  
    return Object.fromEntries([
      ...par_inst_items.map(
        i => [i.identifier, this.encodeParExpr(i.expr)]
      )
    ]);
  }
    
};
