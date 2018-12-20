
<template>
  <v-form v-model="valid" ref="form1" lazy-validation @submit.prevent="next">

    <v-text-field label="Storage 名称" v-model.trim="item.storage_name" :rules="nameRules" :counter="10" required></v-text-field>

    <v-textarea rows="2" placeholder="备注（100字）" :rules="descRules" :counter="100" label="备注:" v-model="item.description"></v-textarea>

    <v-toolbar dense flat color="white">
      <v-spacer/>
      <v-btn type="submit"  color="info">下一步 <v-icon>arrow_forward</v-icon></v-btn>
    </v-toolbar>

  </v-form>
</template>

<script>
  export default {
    data() {
      return {
        valid: false,

        item: {
          "storage_name": "",
          "description": "",
        },

        nameRules: [
          v => !!v || 'Storage Name is required',
          v => (v && v.length <= 10) || 'It must be less than 10 characters'
        ],
        descRules: [
          v => !v || (v && v.length <= 100) || 'It must be less then 100 characters'
        ],
      }
    },
    methods: {
      next() {
        if (!this.$refs.form1.validate()) return;
        this.$emit('next', this.item)
      }
    }
  }
</script>
