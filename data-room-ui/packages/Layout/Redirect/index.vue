<template>
<div></div>
</template>
<script>
export default {
  name: 'Redirect',
  components: {
  },
  data () {
    return {
    }
  },
  created () {
    if(this.$route.query.edit=='source'){
      this.$router.push(window.BS_CONFIG.routers?.SourceUrl||'/big-screen-source')
    }else{
      this.$router.push(window.BS_CONFIG.routers?.componentUrl || '/big-screen-components')
    }

  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
</style>
