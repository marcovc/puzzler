
export const DEFAULT_PUZZLE_DESCRIPTION = {
  "time": 1614527433262,
  "blocks": [
    {
      "data": {
        "text": "Replace with puzzle name",
        "level": 1
      },
      "type": "header"
    },
    {
        "data": {
        "text": "Replace with a short description of the puzzle (this first paragraph will appear in the puzzle list)."
        },
        "type": "paragraph"
    },
    {
        "data": {
        "text": "Model",
        "level": 2
        },
        "type": "header"
    },
    {
        "data": {
        "code": "% Insert formal model describing the puzzle here, in minizinc.",
        "theme": "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/atom-one-light.min.css",
        "language": "Minizinc"
        },
        "type": "codeBox"
    },
    {
        "data": {
        "text": "<i>See the minizinc <a href=\"https://www.minizinc.org\">website</a> for documentation and examples.</i>"
        },
        "type": "paragraph"
    }
    ],
    "version": "2.19.1"
}

import gql from 'graphql-tag'

export const PUZZLES_QUERY = gql`query puzzles {
  puzzles{
    id
    name
    description
    instances {id}
  }
}`

export const PUZZLE_QUERY = gql`query puzzle($id: Int!) {
  puzzle(where: {id: $id}) {id, description, authorId, instances {id}}
}`
