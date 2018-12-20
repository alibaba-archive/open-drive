<template>
  <div class="text-xs-center pa-4"
  :style="`${fixed?'position:fixed;top:200px;width:100%;height:'+(height||100)+'px;':''}`">
    <v-progress-circular :size="size||40" indeterminate class="primary--text"></v-progress-circular>
    <div><slot></slot></div>
  </div>
</template>

<script>
export default{
  props: ['fixed','height','size']
}
</script>
