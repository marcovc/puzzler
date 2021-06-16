<template>
  <div>
    <v-row>
      <v-col
        v-for="puzzle in puzzles"
        :key="puzzle.id"
        cols=12
      >
        <v-card elevation="1" @click="openPuzzle(puzzle.id)">
          <v-card-title>{{puzzle.name}}</v-card-title>
          <v-card-subtitle>{{puzzle.instances.length}} instances</v-card-subtitle>
          <v-card-text v-html="getPuzzleSummary(puzzle)"></v-card-text>
        </v-card>

      </v-col>

    </v-row>

    <v-row>
      <v-col align="center">
        <v-btn
          color="secondary"
          small
          :disabled="!store.userId"
          @click="addNewPuzzle()"
        >Add puzzle
        </v-btn>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import gql from 'graphql-tag'
import { store } from "../store.js"
import { DEFAULT_PUZZLE_DESCRIPTION, PUZZLES_QUERY } from "../constants.js"

export default {
  name: 'PuzzleList',
  data: () => ({
    puzzles: [],
    addPuzzleDialogIsOpen: false,
    store
  }),
  apollo: {
    puzzles: {
      query: PUZZLES_QUERY
    }
  },
  methods: {
    getPuzzleSummary(puzzle) {
      const paragraphs = puzzle.description.blocks.filter(b=>b.type=='paragraph')
      if (paragraphs.length == 0)
        return ''
      else
        return paragraphs[0].data.text
    },
    openPuzzle(puzzleId) {
      this.$router.push({ name: 'PuzzleEditor', params: {id: puzzleId} })
    },
    async addNewPuzzle() {
      const {data: {createPuzzle: {id: puzzleId}}} = await this.$apollo.mutate({
        mutation: gql`mutation ($name: String!, $authorId: String!, $description: JSON!) {
          createPuzzle(
              data: {
                name: $name
                description: $description
                author: {connect:{id:$authorId}}
              }
            ) {
              id
              name
              description
              instances {id}
            }
          }`,
        variables: {
          name: "New puzzle",
          authorId: this.store.userId,
          description: DEFAULT_PUZZLE_DESCRIPTION
        },
        update: (store, { data: { createPuzzle } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({ query: PUZZLES_QUERY })
          // Add new puzzle from the mutation to the end
          data.puzzles.push(createPuzzle)
          // Write our data back to the cache.
          store.writeQuery({ query: PUZZLES_QUERY, data })
      },
      })
      this.openPuzzle(puzzleId)
    }
  }
}
</script>
