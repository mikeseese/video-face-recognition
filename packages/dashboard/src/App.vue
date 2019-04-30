<template>
  <div id="app" class="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  created: function () {
    this.$http.interceptors.response.use(undefined, function (err) {
      return new Promise(function (resolve, reject) {
        if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
          this.$store.dispatch("logout")
        }
        throw err;
      });
    });
  }
}
</script>

<style lang="scss">
@import "sass/main";

body {
  height: 100%;
  #app {
    height: 100%;
  }
}
</style>
