<template>
  <li class="item">
    <div
      :class="{bold: isFolder}">
      <v-icon @click.stop="toggle" v-if="isFolder" class="toggle" :class="{'close': !open}">arrow_drop_down</v-icon>
      <div @click.stop="itemClick" :class="`label ${active?'active':''} ${model.class}`"> {{ model.name }} </div>
    </div>
    <ul v-show="open" v-if="isFolder">
      <tree
        v-for="(model, index) in model.children"
        :key="index"
        :model="model">
      </tree>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'tree',
  props: {
    model: Object
  },
  data: function () {
    return {
      open: true
    }
  },
  mounted(){
    this.open = !this.model.collapse
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    },
    active: function() {
      return this.$route.params.docPath === this.model.action;
    }
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    itemClick: function(e) {
      if(this.model.action){
        this.$router.push({name:'Docs',params:{docPath: this.model.action }});
        $(document).scrollTop(0)
      }
    }
  }
}
</script>

<style scoped>
.item {
  cursor: pointer;
}
.label{
  line-height: 26px;
  display: inline-block;
}
.label:hover{
  color: rgb(120, 120, 120);
}
.label.active{
  color: #25b864;
}
.bold {
  position: relative;
}
.toggle{
  position: absolute;
  left: -25px;
  top: 0;
}
.close {
  transform: rotate(-90deg);
}
ul {
  color: rgb(89, 89, 89);
  font-size: 12px;
  padding-left: 1em;
  line-height: 26px;
  list-style-type: none;
  font-weight: bold;
}
ul>li{
  list-style: none;
  font-size: 12px;
}
</style>
