<template>
  <div class="home">
    <FlowDesign
      style="height: 100%"
      ref="flowDesign"
      @nodeClick="nodeClick"
      :explainList="explainList"
      :propNodeData="processTree"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import FlowDesign from "src/components/flow-design/index.vue";
import { processTree } from "src/mock/index";
export default {
  data() {
    return {
      loading: false,
      explainList: [],
      processTree: processTree
    };
  },
  name: "Home",
  components: {
    FlowDesign
  },
  methods: {
    nodeClick() {}
  }
};
</script>
<style lang="scss">
.home {
  height: 100%;
}
</style>
