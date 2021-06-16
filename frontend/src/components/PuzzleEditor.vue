<template>
<div>
  <v-alert type="error" :value="!hasValidName">A puzzle with this name already exists. Please change the topmost heading.</v-alert>

  <v-row>
    <v-col class="text-right">
      <v-btn icon :disabled="!canDelete" @click="deletePuzzle()">
        <v-icon>mdi-delete</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-col>
  </v-row>

  <editor ref="editor" :config="editorConfig" :initialized="onEditorInitialized"/>

  <instance-list :instances="instances"/>
</div>

</template>

<script>
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
// import Checklist from '@editorjs/checklist'
// import Marker from '@editorjs/marker'
// import Warning from '@editorjs/warning'
// import RawTool from '@editorjs/raw'
import Quote from '@editorjs/quote'
// import InlineCode from '@editorjs/inline-code'
import Delimiter from '@editorjs/delimiter'
import SimpleImage from '@editorjs/simple-image'
//import Math from 'editorjs-math'

import CodeBox from '../3rdparty/codebox.js'
import {PUZZLE_QUERY, PUZZLES_QUERY} from '../constants.js'

import { store } from "../store.js"
import InstanceList from "./InstanceList"

import gql from 'graphql-tag'

export default {
  name: 'PuzzleEditor',
  props: {
    id: Number,
  },
  components: {
    'instance-list': InstanceList
  },
  data: (vm) => ({
    editor: null,    
    editorConfig: {
      minHeight: 0,
      tools: {
        header: {
          class: Header,
          config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
          },
        },
        list: List,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        embed: Embed,
        table: Table,
        quote: Quote,
        delimiter: Delimiter,
        image: SimpleImage,
        // Math: Math,
        codeBox: {
          class: CodeBox,
          config: {
            themeName: 'atom-one-light',
            useDefaultTheme: 'light'
          }
        },
      },
      onReady: () => {
        vm.renderEditorContents()
      },
      onChange: () => {
        vm.updatePuzzle()
      },
      data: {},
      readOnly: true,
    },
    description: null,
    authorId: null,
    hasValidName: true,
    editorIsReadOnly: true,  // temporary while editorjs doesn't allow querying for it
    store
  }),
  apollo: {
    description: {
      query: PUZZLE_QUERY,
      variables() {
        return {id: this.id}
      },
      update: data=>data.description,
      result(r) {
        this.editorConfig.data = r.data.puzzle.description
      }
    },
    authorId: {
      query: PUZZLE_QUERY,
      variables() {
        return {id: this.id}
      },
      update: data=> data.puzzle.authorId,
    },
    instances: {
      query: PUZZLE_QUERY,
      variables() {
        return {id: this.id}
      },
      update: data=> data.puzzle.instances,
    }
  },
  computed: {
    userId() {
      return this.store.userId
    },
    canDelete() {
      return this.authorId == this.userId && this.nrInstances == 0
    },
    nrInstances() {
      if (!this.instances)
        return 0
      return this.instances.length
    }
  },
  watch: {
    userId() {
      this.syncReadOnly()
    },
  },
  methods: {
    onEditorInitialized(editor) {
      this.editor = editor
    },
    syncReadOnly() {
      const editorShouldBeReadOnly = this.authorId != this.userId

      // tmp while we cant query editorjs directly for this
      const editorIsReadonly = this.editorIsReadOnly 

      if (editorShouldBeReadOnly != editorIsReadonly) {
        this.editorIsReadOnly = !this.editorIsReadOnly
        return this.editor.readOnly.toggle();
      }
    },
    async renderEditorContents() {
      await this.syncReadOnly()
      this.editor.render(this.editorConfig.data)
    },
    getPuzzleName(description) {
      const headings = description.blocks.filter(b=>b.type=='header')
      if (headings.length == 0)
        return ''
      else
        return headings[0].data.text
    },
    async updatePuzzle() {
      if (this.editorIsReadOnly)
        return
      this.description = await this.editor.save();
      try {
        await this.$apollo.mutate({
          mutation: gql`mutation ($id: Int!, $name: String!, $description: JSON!) {
            updatePuzzle(where: {id: $id}, data: {description: $description, name: {set: $name}}) {
              id
              name
              description
            }
          }`,
          variables: {
            id: this.id,
            description: this.description,
            name: this.getPuzzleName(this.description)
          },
        })
        this.hasValidName = true
      } catch (e) {
        // TODO: implement validation the right way.
        this.hasValidName = 
          e.message.indexOf("Unique constraint failed on the fields: (`name`)") < 0
      }   
    },
    async deletePuzzle() {
      try {
        await this.$apollo.mutate({
          mutation: gql`mutation ($id: Int!) {
            deletePuzzle(where: {id: $id}) {
              id
            }
          }`,
          variables: {
            id: this.id,
          },
          update: (store, { data: { deletePuzzle } }) => {
            const data = store.readQuery({ query: PUZZLES_QUERY })
            data.puzzles = data.puzzles.filter(p => p.id != deletePuzzle.id)
            store.writeQuery({ query: PUZZLES_QUERY, data })
          },
        })
        this.$router.push({ name: 'PuzzleList' })
      } catch (e) {
        console.log("couldn't delete puzzle")
      }
    }
  },
  beforeDestroy() {
    if (this.editor)
      this.editor.destroy()
  }
}
</script>

<style>

</style>