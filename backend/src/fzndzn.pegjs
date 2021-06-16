/**
  Parser for fzn (flatzinc) and dzn (minizinc data) files.
  The two parsers can be generating via the "--allowed-start-rules" option:

  --allowed-start-rules=fzn  -> generates fzn parser
  --allowed-start-rules=dzn  -> generates dzn parser
*/
{
  function makeInteger(o) {
    return parseInt(o.join(""));
  }
  function select_ith(list, i) {
    return list.map(r => r[i])
  }
  function denest(list, start, rec) {
    return [list[start]].concat(select_ith(list[rec], rec))
  }
  function everyother(list, n) {
    return list.filter((k, i) => i % n == 0);
  }
}

fzn
  = s model:model s { return model; }

model "model"
  = (predicate_item s)*
    par_decl_items: (par_decl_item s)*
    var_decl_items: (var_decl_item s)*
    constraint_items: (constraint_item s)*
    solve_item:solve_item {
        return {
            par_decl_items: select_ith(par_decl_items, 0),
            var_decl_items: select_ith(var_decl_items, 0),
            constraint_items: select_ith(constraint_items, 0),
            solve_item
        };
    }

dzn "dzn"
  = s par_inst_items: (par_inst_item s)* {
        return {
            par_inst_items: select_ith(par_inst_items, 0)
        };
    }

predicate_item "predicate_item"
  = "predicate" identifier "(" ")" ";"
  / "predicate" identifier "(" pred_param_type ":" identifier ("," pred_param_type ":" identifier)* ")" ";"

identifier
  = id:([A-Za-z][A-Za-z0-9_]*)   {  return id.flat().join(""); }

basic_par_type
  = "bool" { return "BOOL"; }
  / "int"  { return "INT"; }
  / "set" s1 "of" s1 "int" { return "INTSET"; }

par_type
  = type:basic_par_type {
      return {meta: "PAR", type}
  }
  / "array" s "[" s size:index_set s "]" s "of" s1 element_type:basic_par_type {
    return {meta: "PAR_ARRAY", size, element_type}
  }

basic_var_type
  = "var" s1 type:basic_par_type {
      return {meta: "VAR", type, domain: {list_type: "FULL"}};
  }
  / "var" s1 lb:int_literal s ".." s ub:int_literal {
      return {meta: "VAR", type: "INT", domain: {list_type: "RANGE", lb, ub}};
  }
  / "var" s "{" s list:(int_literal s ("," s int_literal s)*) "}" {
      return {meta: "VAR", type: "INT", domain: {list_type: "VALUES", values: denest(list, 0, 2)}};
  }
  / "var" s1 "set" s1 "of" s1 lb:int_literal s ".." s ub:int_literal {
      return {meta: "VAR", type: "INTSET", domain: {list_type: "RANGE", lb, ub}};
  }
  / "var" s1 "set" s1 "of" s1 "{" s "}" {
      return {meta: "VAR", type: "INTSET", domain: {list_type: "VALUES",values: []}};
  }
  / "var" s1 "set" s1 "of" s1 "{" s list:(int_literal s ("," s int_literal s)*) "}" {
      return {meta: "VAR", type: "INTSET", domain: {list_type: "VALUES", values: denest(list, 0, 2) }};
  }

array_var_type
  = "array" s "[" s size:index_set s "]" s "of" s1 type:basic_var_type {
      return {meta: "VAR_ARRAY", size, element_type:type}
  }

index_set
  = "1" s ".." s size:int_literal {
      return size;
  }

basic_pred_param_type
  = basic_par_type
  / basic_var_type
  / int_literal ".." int_literal
  / "{" int_literal ("," int_literal)* "}"
  / "set" "of" int_literal .. int_literal
  / "set" "of" "{" "}"
  / "set" "of" "{" int_literal ("," int_literal)* "}"

pred_param_type
  = basic_pred_param_type
  / "array" "[" pred_index_set "]" "of" basic_pred_param_type

pred_index_set
  = index_set
  / "int"

basic_literal_expr
  = lit:bool_literal { return  {meta: "BOOL_LIT", value:lit}; }
  / lit:set_literal { return  {meta: "INTSET_LIT", value:lit}; }
  / lit:int_literal { return  {meta: "INT_LIT", value:lit}; }

basic_expr
  = basic_literal_expr
  / id:var_par_identifier   {   return {meta: "REF", value:id}; }

expr
  = basic_expr
  / array_literal

par_expr
  = basic_literal_expr
  / par_array_literal

var_par_identifier
  = id:([A-Za-z_] [A-Za-z0-9_]*)    {  return id.flat().join(""); }

bool_literal
  = "false" { return false; }
  / "true"  { return true; }

int_literal
  = 
    int:("-"? "0x" [0-9A-Fa-f]+) { return makeInteger(int.flat()); }
  / int:("-"? "0o" [0-7]+)       { return makeInteger(int.flat()); }
  / int:("-"? [0-9]+)            { return makeInteger(int.flat()); }

set_literal
  = "{" s "}" {  return {list_type: "VALUES", values: []}; }
  / "{" s set:(int_literal s ("," s int_literal s)*) "}" {
    const values = denest(set, 0, 2);
    return {list_type: "VALUES", values: values};
  }
  / lb:int_literal s ".." s ub:int_literal {
    return {list_type: "RANGE", lb, ub}
  }

array_literal
  = "[" s "]" {  return {meta: "ARRAY_LIT", list_type: "VALUES", values: []}; }
  / "[" s list:(basic_expr s ("," s basic_expr s)*) "]" {
    const values = denest(list, 0, 2);
    return {meta: "ARRAY_LIT", list_type: "VALUES", values};
  }

par_array_literal
  = "[" s "]" { return {meta: "PAR_ARRAY_LIT", list_type: "VALUES", values: []}; }
  / "[" s array:(basic_literal_expr s ("," s basic_literal_expr s)*) "]" {
      return {meta: "PAR_ARRAY_LIT", list_type: "VALUES", values: denest(array, 0, 2)};
  }

par_decl_item 
  = type:par_type s ":" s identifier:var_par_identifier s "=" s expr:par_expr s ";" {
        return {...type, identifier, expr}
  }

var_decl_item
  = type:basic_var_type s ":" s identifier:var_par_identifier s annotations:annotations s expr:( "=" s basic_expr s)? ";" {
      if (expr)
        return {...type, identifier, expr:expr[2], annotations};
      else
        return {...type, identifier, annotations};
  }
  / type:array_var_type s ":" s identifier:var_par_identifier s annotations:annotations s "=" s expr:array_literal s ";" {
      return {...type, identifier, expr, annotations};
  }

/* used only in dzn */
par_inst_item 
  = identifier:var_par_identifier s "=" s expr:par_expr s ";" {
        return {identifier, expr}
  }

constraint_item
  = "constraint" s identifier:identifier s "(" s args:( expr s ("," s expr s)* )? ")" s annotations:annotations s ";" {
      return {identifier, args: denest(args, 0, 2), annotations};
  }

solve_item
  = "solve" s annotations:annotations s "satisfy" s ";" { 
      return {type: "SATISFY", annotations};
    }
  / "solve" s annotations:annotations s "minimize" s expr:basic_expr s ";" { 
      return {type: "MINIMIZE", expr, annotations};
    }
  / "solve" s annotations:annotations s "maximize" s expr:basic_expr s ";" { 
      return {type: "MAXIMIZE", expr, annotations};
    }

annotations 
  = ann:( "::" s annotation s)* { 
      return select_ith(ann, 2); 
    }

annotation 
  = identifier:identifier s "(" s args:(ann_expr s ("," s ann_expr s)*) ")" {
    return {identifier, args: denest(args, 0, 2)};
  }
  / identifier:identifier {
    return {meta: "REF", identifier};
  }

ann_expr
  = basic_ann_expr
  / "[" s list:(basic_ann_expr s ("," s basic_ann_expr s)* s)? "]" {
    return denest(list, 0, 2);
  }

basic_ann_expr
  = basic_literal_expr
  / lit:string_literal { return  {meta: "STRING_LIT", value:lit}; }
  / annotation

string_contents
  = [^"\n]*

string_literal
  = '"' string_contents '"'

s
  = [ \t\n]*

s1
  = [ \t\n]+
