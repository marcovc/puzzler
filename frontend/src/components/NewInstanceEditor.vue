<template>
<div>

  <v-row>
    <v-col cols="12">
      <editor ref="editor" :config="editorConfig" :initialized="onEditorInitialized"/>
    </v-col>
  </v-row>

    <v-row>
      <v-col align="center">
        <v-btn
          color="secondary"
          small
          :disabled="!userId"
          @click="addNewInstance()"
        >Submit
        </v-btn>
      </v-col>
    </v-row>

</div>

</template>

<script>
import CodeBox from '../3rdparty/codebox.js'

import { store } from "../store.js"

// import gql from 'graphql-tag'

export default {
  name: 'NewInstanceEditor',
  props: {
    puzzleId: Number,
  },
  data: (vm) => ({
    dialog: true,
    editor: null,    
    editorConfig: {
      minHeight: 0,
      tools: {
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
        vm.updateDescription()
      },
      data: {
        "blocks": [
          {
            "data": {
              "code": "% Insert instance parameter assignments here, in minizinc.\n\n% Example:\nn = 2;\nm = 5;",
              "theme": "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/atom-one-light.min.css",
              "language": "Minizinc"
            },
            "type": "codeBox"
          },
        ]
      },
    },
    description: null,
    authorId: null,
    hasValidName: true,
    editorIsReadOnly: true,  // temporary while editorjs doesn't allow querying for it
    store
  }),
  computed: {
    userId() {
      return this.store.userId
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
      if (!this.editorConfig.data)
        return
      await this.syncReadOnly()
      this.editor.render(this.editorConfig.data)
    },
    getInstanceParameters(description) {
      const codeBlocks = description.blocks.filter(b=>b.type=='codeBox')
      if (codeBlocks.length == 0)
        return ''
      else
        return codeBlocks.map(b=>b.data.text).join("\n")
    },
    async updateDescription() {
      this.description = await this.editor.save();
    },
  },
  beforeDestroy() {
    if (this.editor)
      this.editor.destroy()
  }
}
</script>

<style>

</style>