<template>
  <span>{{ name }}</span>
</template>

<script>
export default {
  name: 'nameColumn',

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
    name: function () {
      return this.rowData.identity != null ? this.rowData.identity.name.toUpperCase() : "UNKNOWN";
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
