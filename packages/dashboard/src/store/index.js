import Vue from "vue"
import Vuex from "vuex"
import VuexI18n from "vuex-i18n" // load vuex i18n module
import app from "./modules/app"
import axios from "axios";

import * as getters from "./getters"

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true, // process.env.NODE_ENV !== "production",
  getters,
  modules: {
    app,
  },
  state: {
    status: "",
    user: null,
  },
  mutations: {
    auth_request(state) {
      state.status = "loading";
      state.user = null;
    },
    auth_success(state, user) {
      state.status = "success";
      state.user = user;
    },
    auth_error(state) {
      state.status = "error";
      state.user = null;
    },
    logout(state) {
      state.status = "";
      state.user = null;
    },
  },
  actions: {
    login({commit}, user) {
      return new Promise((resolve, reject) => {
        commit("auth_request")
        if (user.email) {
          axios({url: "/api/login", data: user, method: "POST" })
          .then(resp => {
            const user = resp.data.user;
            commit("auth_success", user);
            resolve(resp);
          })
          .catch(err => {
            commit("auth_error");
            reject(err);
          })
        }
        else {
          axios({url: "/api/account", method: "GET" })
          .then(resp => {
            const user = resp.data.user;
            commit("auth_success", user);
            resolve(resp);
          })
          .catch(err => {
            commit("auth_error");
            reject(err);
          })
        }
      })
    },
    logout({commit}){
      return new Promise((resolve, reject) => {
        commit('logout')
        resolve()
      })
    },
    gather({commit}, data) {
      return new Promise((resolve, reject) => {
        axios({url: "/api/gather", data, method: "POST" })
        .then(() => {
          resolve();
        })
        .catch(err => {
          console.err(err);
        })
      })
    },
    train({commit}) {
      return new Promise((resolve, reject) => {
        axios({url: "/api/train", data: {}, method: "POST" })
        .then(() => {
          resolve();
        })
        .catch(err => {
          console.err(err);
        })
      })
    },
  }
})

Vue.use(VuexI18n.plugin, store)

export default store
