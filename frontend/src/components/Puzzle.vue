<template>

<v-card
    class="mx-auto"
    max-width="1000"
>
 <v-img
      :src="imageLink"
      max-height="200px"
      contain
></v-img>
<v-card-title>{{title}}</v-card-title>
<v-card-subtitle>{{subtitle}}</v-card-subtitle>
<v-card-text>
      <v-row
        align="center"
        class="mx-0"
      >
      {{summary}}
      </v-row>
</v-card-text>
</v-card>

</template>

<script>
export default {
    name: 'Puzzle',
    props: {
        title: {
        type: String
        },
        subtitle: {
        type: String
        },
        summary: {
        type: String
        },
        imageLink: {
        type: String
        },
    }
}
</script>
