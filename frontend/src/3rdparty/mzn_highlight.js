export default function(hljs) {
  return {
    name: 'Minizinc',
    aliases: ['mzn'],
    case_insensitive: false,  // language is case-sensitive
    keywords: {
      $pattern: /\w+|<->|->|<-|\\\/|\/\\|<|>|<=|>=|==|=|!=/,
      item: 'annotation constraint function include op output minimize maximize predicate satisfy solve test type',
      type: 'ann array bool enum float int list of par set string tuple var',
      expression: 'for forall if then elseif else endif where let in',
      reserved: 'any case op record',
      builtin: 'abort abs acosh array_intersect array_union array1d array2d array3d '+
              'array4d array5d array6d asin assert atan bool2int card ceil concat ' +
              'cos cosh dom dom_array dom_size fix exp floor index_set index_set_1of2 ' +
              'index_set_2of2 index_set_1of3 index_set_2of3 index_set_3of3 int2float ' +
              'is_fixed joinlb lb_array length ln log log2 log10 min max pow product '+
              'round set2array show show_int show_float sin sinh sqrt sum tan tanh '+
              'trace ub ub_array',
      global: 'circuit disjoint maximum maximum_arg member minimum minimum_arg ' +
              'network_flow network_flow_cost partition_set range roots sliding_sum ' +
              'subcircuit sum_pred alldifferent all_different all_disjoint all_equal ' +
              'alldifferent_except_0 nvalue symmetric_all_different lex2 lex_greater ' +
              'lex_greatereq lex_less lex_lesseq strict_lex2 value_precede ' +
              'value_precede_chain arg_sort decreasing increasing sort int_set_channel '  +
              'inverse inverse_set link_set_to_booleans among at_least at_most at_most1 ' +
              'count count_eq count_geq count_gt count_leq count_lt count_neq distribute ' +
              'exactly global_cardinality global_cardinality_closed ' +
              'global_cardinality_low_up global_cardinality_low_up_closed bin_packing ' +
              'bin_packing_capa bin_packing_load diffn diffn_k diffn_nonstrict ' +
              'diffn_nonstrict_k geost geost_bb geost_smallest_bb knapsack alternative ' +
              'cumulative disjunctive disjunctive_strict span regular regular_nfa table',
      op_logical: ['not', '<->', '->', '<-', '\\/', 'xor', '/\\'],
      op_relation: ['<', '>', '<=', '>=', '==', '=', '!=']
    },
    contains: [
      {
        className: 'string',
        begin: '"', end: '"'
      },
      hljs.C_BLOCK_COMMENT_MODE,      
      hljs.COMMENT('%','$'),
      {
        className: 'number',
        match: /\b0o[0-7]+|\b0x[0-9A-Fa-f]+|\b\d+(?:(?:.\d+)?[Ee][-+]?\d+|.\d+)|\b\d+/
      },
      {
        className: 'boolean',
        match: /\b(?:true|false)\b/
      },
    ],
  }
}
