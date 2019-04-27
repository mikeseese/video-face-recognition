<template>
  <vuestic-navbar>
    <header-selector slot="selector" :isOpen.sync="valueProxy"/>

    <notification-dropdown class="col nav-item"/>
    <profile-dropdown class="col nav-item">
      <img src="https://i.imgur.com/nfa5itq.png"/>
    </profile-dropdown>
  </vuestic-navbar>

</template>

<script>
import VuesticNavbar
  from '../../../vuestic-theme/vuestic-components/vuestic-navbar/VuesticNavbar'
import HeaderSelector from './components/HeaderSelector'

import ProfileDropdown from './components/dropdowns/ProfileDropdown'
import NotificationDropdown from './components/dropdowns/NotificationDropdown'

export default {
  name: 'app-navbar',

  components: {
    VuesticNavbar,
    HeaderSelector,
    NotificationDropdown,
    ProfileDropdown,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    valueProxy: {
      get () {
        return this.isOpen
      },
      set (opened) {
        this.$emit('toggle-menu', opened)
      },
    },
  },
}
</script>
