<!--
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 节点的布局组件（主要是为了控制连接线）
 * @$emit:
 * @$slot:
 * @Date: 2019-04-08 16:20:27
 * @LastEditTime: 2020-09-02 14:33:49
 -->
<template>
  <div class="node-wrap">
    <!-- 分支节点 -->
    <template v-if="nodeData.type === 6">
      <BranchWrap
        :selectItem="selectItem"
        :parentNode="parentNode"
        :nodeData="nodeData"
      />
    </template>
    <!-- 普通节点 -->
    <template v-else>
      <ApproverNode
        :selectItem="selectItem"
        :parentNode="parentNode"
        :nodeData="nodeData"
      />
    </template>

    <!-- 子节点 -->
    <template v-if="nodeData.childNode">
      <NodeWrap
        name="NodeWrap"
        :selectItem="selectItem"
        :parentNode="nodeData"
        :nodeData="nodeData.childNode"
      />
    </template>
  </div>
</template>

<script>
import utilMixin from "./../mixin/util-mixin";
export default {
  name: "NodeWrap",
  provide: function() {
    return {
      nodeWrap: this // 向下注入自己
    };
  },

  filters: {
    // 动态渲染warp
    warpName(type) {
      let res;
      switch (type) {
        case 1:
          res = "NodeWrap";
          break;
        case 5:
          res = "BranchWrap";
          break;
        default:
          break;
      }
      return res;
    }
  },

  mixins: [utilMixin],

  props: {
    nodeData: {
      /**
       * 节点数据对象
       */
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  methods: {
    init() {}
  }
};
</script>

<style lang="scss">
.node-wrap {
  display: inline-flex;
  width: 100%;
  flex-direction: column;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  // padding: 0 50px;
  position: relative;
  .active {
    &::after {
      border: 1px solid orange !important;
      box-shadow: 0 0 6px 0 rgba(176, 213, 250, 0.3) !important;
    }
  }
}
</style>
