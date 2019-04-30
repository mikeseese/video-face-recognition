<template>
  <span class="circle" :class="classObject"></span>
</template>

<script>
export default {
  name: 'badgeColumn',

  props: {
    rowData: {
      type: Object,
      required: true,
    },

    rowIndex: {
      type: Number,
    },
  },

  computed: {
    classObject: function () {
      return {
        'badge-warning': this.rowData.authorized === true && this.rowData.confidence < 60,
        'badge-primary': this.rowData.authorized === true && this.rowData.confidence >= 80,
        'badge-danger': this.rowData.authorized !== true,
        'badge-info': this.rowData.authorized === true && this.rowData.confidence >= 60 && this.rowData.confidence < 80
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.circle {
  width: .75rem;
  height: .75rem;
  border-radius: 50%;
  display: inline-block;
}
</style>
