<template>
  <div>
    <h2>Home</h2>

    <section>
      <label>Admin Button:</label>
      <!-- only create the button for 'admin' -->
      <button v-roles="['admin']">Admin Button</button>
    </section>

    <section>
      <label>User Button:</label>
      <!-- only create the button for 'user' -->
      <button v-roles="['user']">User Button</button>
    </section>

    <section>
      <label>Super Buttons:</label>
      <!-- only create the button for 'super' -->
      <button v-roles="['super']">Super Button(remove)</button>
      <!-- action available value: 'remove', 'hidden , 'disable' -->
      <button v-roles:action.remove="['super']">Super Button(remove)</button>
      <button v-roles:action.hidden="['super']">Super Button(hidden)</button>
      <button v-roles:action.disable="['super']">Super Button(disable)</button>

      <!-- add class 'my-class-name' for those are not 'super' -->
      <button v-roles:class.my-class-name="['super']">Super Button(add class)</button>
    </section>
  </div>
</template>

<style scoped>
  section {
    margin: 15px auto;
    max-width: 600px;
    text-align: left;
  }

  label {
    display: inline-block;
    width: 120px;
  }

  button {
    margin-right: 5px;
  }
</style>

