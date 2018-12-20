<template>
<div style="width:100%;">
  <slot></slot>
</div>
</template>

<script>
export default {

  mounted() {
    var ele = this.$el;
    $(document).on('dragenter', stopPrev);
    $(document).on('dragover', stopPrev);
    $(document).on('dragleave', stopPrev);
    $(document).on('drop', stopPrev);

    function stopPrev(e) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    }

    var shadow;
    $(ele)
      .on('dragenter', () => {
        if (shadow) return;
        shadow = $('<div></div>').css({
          position: 'absolute',
          height: $(ele).height(),
          width: $(ele).width(),
          opacity: 0.5,
          top: $(ele).offset().top,
          left: $(ele).offset().left,
          background: 'yellow',
          zIndex: 20,
          boxShadow: 'inset yellow 0 0 10px'
        }).appendTo('body');

        shadow.on('dragleave', () => {
            shadow.remove();
            shadow = null;
          })
          .on('drop', (e) => {
            shadow.remove();
            shadow = null;
            this.$emit('drop', e.originalEvent);
          });
      });


      //handler scroll
      var that=this;
      $(ele).on('scroll', onScroll);
      $(window).on('resize', onScroll)
      onScroll();

      var tid;
      function onScroll(){
        if($(ele).scrollTop() >= $(ele)[0].scrollHeight-$(ele).height()){
          clearTimeout(tid)
          tid = setTimeout(function(){
            that.$emit('atbottom');
          },600);
        }
      }

  }
}
</script>
