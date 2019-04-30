<template>
  <div class="login">
    <h2>{{ $t('auth.welcome') }}</h2>
    <form name="login" @submit.prevent="login">
      <div class="form-group">
        <div class="input-group">
          <input type="text" id="email" required="required" v-model="email"/>
          <label class="control-label" for="email">
            {{ $t('auth.email') }}
          </label>
          <i class="bar"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input-group">
          <input type="password" id="password" required="required" v-model="password"/>
          <label class="control-label" for="password">
            {{ $t('auth.password') }}
          </label>
          <i class="bar"/>
        </div>
      </div>
      <div>
        <p class="error" v-text="error"></p>
      </div>
      <div class="d-flex align--center justify--space-between">
        <button class="btn btn-primary" type="submit">
          {{ $t('auth.login') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'login',
  created() {
    // check to see if we're authenticated with our session already
    this.$store.dispatch("login", {})
    .then(() => {
      this.$router.push("/");
    }).catch((err) => {
      console.log(err);
    });
  },
  data() {
    return {
      email: "",
      password: "",
      error: ""
    }
  },
  computed: {
    isLoggedIn: function() {
      return this.$store.getters.isLoggedIn;
    }
  },
  methods: {
    login: function() {
      this.error = "";
      this.$store.dispatch("login", {
        email: this.email,
        password: this.password
      }).then(() => {
        this.$router.push("/");
      }).catch((err) => {
        this.error = "Could not authenticate.";
        console.log(err);
      });
    }
  }
}
</script>

<style lang="scss">
.login {

  .error {
    color: red;
  }

  @include media-breakpoint-down(md) {
    width: 100%;
    padding-right: 2rem;
    padding-left: 2rem;
    .down-container {
      display: none;
    }
  }

  h2 {
    text-align: center;
  }
  width: 21.375rem;

  .down-container {
    margin-top: 3.125rem;
  }
}
</style>
