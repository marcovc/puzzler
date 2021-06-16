<template>

  <v-app>

    <v-app-bar app elevation="1">
      <v-app-bar-title>Puzzler</v-app-bar-title>

      <v-spacer/>
      <v-btn
        depressed
        color="primary"
        @click="connectWallet()"
        v-text="connectButtonText"
      >        
      </v-btn>

    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main>

      <!-- Provides the application the proper gutter -->
      <v-container fluid>

        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app>
        <v-btn depressed><router-link to="/">Puzzles</router-link></v-btn>
        <v-btn depressed><router-link to="/about">About</router-link></v-btn>
    </v-footer>
  </v-app>

</template>

<script>
import { ethers } from "ethers";
import { store } from "./store.js"

export default {
  name: 'App',
  data: ()=>({
    store
  }),
  computed: {
    hasWallet() {
      return typeof window.ethereum !== 'undefined'
    },
    connectButtonText() {
      if (this.store.userId) {
        const prefix = this.store.userId.substring(0, 6)
        const suffix = this.store.userId.substring(this.store.userId.length - 4, this.store.userId.length)
        return prefix.concat('...').concat(suffix)
      }
      else
        return "Connect Wallet"
    }
  },
  methods: {
    async connectWallet() {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (e) {
        console.log("Rejected wallet connection")
      }
    },
    async setUserId() {
      const accounts = await this.$root.ethersProvider.listAccounts();
      if (accounts.length > 0)
        this.store.userId = await this.$root.ethersSigner.getAddress()
      else
        this.store.userId = null
    }
  },
  created() {
    if (this.hasWallet) {
      window.ethereum.on('accountsChanged', async accounts => {
        if (accounts.length > 0)
          await this.setUserId()
        else
          this.store.userId = null
      });
      if (!this.$root.ethersProvider)
        this.$root.ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
      if (!this.$root.ethersSigner)
        this.$root.ethersSigner = this.$root.ethersProvider.getSigner()
      this.setUserId()
    }
    else
      console.log("no wallet")
  }
}
</script>
