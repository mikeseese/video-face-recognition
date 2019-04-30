<template>
  <div class="dashboard">

    <div class="va-row">
      <div class="flex md12 xs12">
        <vuestic-widget :headerText="$t('tables.logs')">
          <vuestic-data-table
            :apiUrl="apiUrl"
            :tableFields="tableFields"
            :itemsPerPage="itemsPerPage"
            :defaultPerPage="defaultTablePerPage"
            :sortFunctions="sortFunctions"
            :apiMode="apiMode"
            :paginationPath="paginationPath"
            :queryParams="queryParams"
            :filterInputShown="filterInputShown"
          >
            <spring-spinner
              slot="loading"
              :animation-duration="2500"
              :size="70"
              color="#4ae387"
            />
          </vuestic-data-table>
        </vuestic-widget>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import BadgeColumn from '../tables/BadgeColumn.vue'
import TimestampColumn from './Timestamp.vue'
import { SpringSpinner } from 'epic-spinners'
import FieldsDef
  from '../../vuestic-theme/vuestic-components/vuestic-datatable/data/fields-definition'
import ItemsPerPageDef
  from '../../vuestic-theme/vuestic-components/vuestic-datatable/data/items-per-page-definition'
import QueryParams from '../../vuestic-theme/vuestic-components/vuestic-datatable/data/query-params'

Vue.component('badge-column', BadgeColumn)
Vue.component('timestamp', TimestampColumn)

export default {
  name: 'dashboard',
  components: {
    SpringSpinner,
  },

  methods: {
  },

  data () {
    return {
      apiUrl: '/api/logs',
      apiMode: true,
      tableFields: FieldsDef.tableFields,
      itemsPerPage: ItemsPerPageDef.itemsPerPage,
      sortFunctions: FieldsDef.sortFunctions,
      paginationPath: '',
      defaultTablePerPage: 30,
      queryParams: QueryParams,
      filterInputShown: false,
    }
  },
}

</script>
<style lang="scss" scoped>
</style>
