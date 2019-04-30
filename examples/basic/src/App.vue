<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'home' }">Home</router-link>|
      <router-link :to="{ name: 'user' }">User</router-link>|
      <!-- <router-link :to="{ name: 'admin', params: { id: 123 }, query: {str: 'xxx'} }">Admin</router-link>| -->
      <router-link to="/admin/222">Admin</router-link>|
      <router-link :to="{ name: 'super' }">Super</router-link>

      <div class="roles-wrap">
        Select roles:
        <label>
          <input @change="setRoles" name="role-user" type="checkbox" v-model="roles" value="user">
          user
        </label>
        <label>
          <input @change="setRoles" type="checkbox" v-model="roles" value="admin">admin
        </label>
        <label>
          <input @change="setRoles" type="checkbox" v-model="roles" value="super">super
        </label>
        , then switch route, or check the button's status below.
      </div>
    </div>
    <router-view :key="viewKey"/>
  </div>
</template>

<script>
  export default {
    data: () => ({
      viewKey: 0,
      roles: ['user']
    }),

    created() {
      this.setRoles()
    },

    methods: {
      setRoles() {
        this.$vrm.setRoles(this.roles)
        console.log('Roles:', this.roles)
        this.forceRerender()
      },

      forceRerender() {
        this.viewKey++
      }
    }
  }
</script>


<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }

  .roles-wrap {
    margin: 15px 0;
  }
</style>
