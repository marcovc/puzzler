<template>
  <div>
    <v-row>
      <v-col>
        <h1 class="ce-header">Instances</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="instance in instances"
        :key="instance.id"
        cols=12
      >
      {{instance.id}}
      </v-col>

    </v-row>

    <v-row>
      <v-col align="center">
        <v-btn
          color="secondary"
          small
          :disabled="!store.userId"
          @click="addNewInstance()"
        >Add instance
        </v-btn>
      </v-col>
    </v-row>

  </div>
</template>

<script>
// import gql from 'graphql-tag'
import { store } from "../store.js"

export default {
  name: 'InstanceList',
  props: {
    instances: Array,
  },
  data: () => ({
    addInstanceDialogIsOpen: false,
    store
  }),
  methods: {
    async addNewInstance() {
      /*
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
      */
    }
  }
}
</script>
