<template>
<div>
<v-img height="200" src="static/material.jpg" :gradient="gradient" dark>
  <v-container fill-height>
    <v-layout align-center>
      <v-flex text-xs-center>
        <h3 class="display-3 white--text">Welcome</h3>
      </v-flex>
    </v-layout>
  </v-container>
</v-img>
</div>
</template>

<script>
export default {
  data(){
    return {
      gradient: 'to top right, rgba(63,81,181, .7), rgba(25,32,72, .7)'
    }
  }
}
</script>
