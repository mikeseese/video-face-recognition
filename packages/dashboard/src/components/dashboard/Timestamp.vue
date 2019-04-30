<template>
  <span>{{ timestamp }}</span>
</template>

<script>
export default {
  name: 'timestampColumn',

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
    timestamp: function () {
      return new Date(this.rowData.timestamp).toLocaleString();
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
