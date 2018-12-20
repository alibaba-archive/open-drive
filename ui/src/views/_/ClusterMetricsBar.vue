<template>
  <div style="width:100%;height:10px">
     <div class="info" :style="`float:left;height:100%;width:${progresses[0]}%`"></div>
     <div class="success" :style="`float:left;height:100%;width:${progresses[1]}%`"></div>
     <div class="warning" :style="`float:left;height:100%;width:${progresses[2]}%`"></div>
     <div class="error" :style="`float:left;height:100%;width:${progresses[3]}%`"></div>
     <div class="grey" :style="`float:left;height:100%;width:${progresses[4]}%`"></div>
  </div>
</template>

<script>
export default{
  props: ['metrics'],
  computed: {
    progresses(){
      var {
        TotalCount: total,
        StartingCount: starting,
        RunningCount: running,
        StoppedCount: stopped,
        StoppingCount: stopping,
        UnallocatedCount: unalloc,
      } = this.metrics
      return [
        starting/total*100,
        running/total*100,
        stopping/total*100,
        stopped/total*100,
        unalloc/total*100,
      ]
    }
  }
}
</script>
