<!--
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 仿钉钉流程设计 - 根组件
 * @$emit:
 * @$slot:
 * @Date: 2019-04-08 16:03:25
 * @LastEditTime: 2020-09-02 14:26:27
 -->
<template>
  <div class="flow-design">
    <div class="zoom-btns">
      <el-button
        :disabled="scale <= this.scaleRange.min"
        @click="scaleMinus"
        icon="el-icon-minus"
      ></el-button>
      <span class="scale-text">{{ parseInt(scale * 100) }}%</span>
      <el-button
        :disabled="scale >= this.scaleRange.max"
        @click="scalePlus"
        icon="el-icon-plus"
      ></el-button>
    </div>
    <div class="box-scale-box">
      <div style="width:100%;" :style="scaleStyle" class="box-scale">
        <!-- 开始节点 -->
        <NodeWrap
          :explainList="explainList"
          :selectItem="selectItem"
          :parentNode="null"
          :nodeData="nodeData"
        ></NodeWrap>
        <div class="end-node">
          <div class="end-node-circle"></div>
          <div class="end-node-text">流程结束</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import NodeWrap from "src/components/flow-design/components/node-wrap.vue";
// import BranchWrap from "src/components/flow-design/components/branch-wrap.vue";
export default {
  name: "flowDesign",
  provide: function() {
    return {
      flowIndex: this
    };
  },
  components: {
    NodeWrap
    // BranchWrap
  },

  filters: {
    // 动态渲染warp
    warpName(type) {
      let res;
      switch (type) {
        case 1:
          res = "NodeWrap";
          break;
        case "condition":
          res = "BranchWrap";
          break;
        default:
          break;
      }
      return res;
    }
  },

  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    selectItem: {
      // 当前选中项
    },
    propNodeData: {
      // 表单树初始对象
      required: true
    },
    explainList: {
      default: () => []
    },
    summary: {
      default: () => []
    }
  },

  data() {
    console.log(this);
    return {
      nodeList: [],
      scaleRange: {
        min: 0.5,
        max: 1.5
      },
      scale: 1,
      endNode: {
        type: 2
      },
      nodeData: {},
      nodeDataInit: {}
    };
  },

  computed: {
    scaleStyle() {
      return {
        transform: `scale(${this.scale})`,
        "min-height": this.scale + "px"
      };
    }
  },

  watch: {
    propNodeData: {
      deep: true,
      immediate: true,
      handler(val) {
        // eslint-disable-next-line no-debugger
        debugger;
        if (val) {
          this.nodeData = JSON.parse(JSON.stringify(val));
          this.nodeDataInit = JSON.parse(JSON.stringify(val));
        }
      }
    }
  },

  created() {},

  methods: {
    init() {},
    /**
     * @function {cb} 回调函数 arg[校验是否通过,错误信息列表]
     */
    validate(cb) {
      let vali = true;
      let errorList = [];
      this.nodeList.forEach(item => {
        if (item.erro) {
          vali = false;
          errorList.push(item.erro);
        }
      });
      cb && cb(vali, errorList);
    },
    /**
     * 对数据格式进行处理
     * 解递归
     */
    formatData() {
      let list = [];
      function fn(node, wrapperId) {
        list.push({
          ...node,
          wrapperId
        });
        if (node.childNode) {
          fn(node.childNode, wrapperId);
        }
        if (node.conditionNodes && node.conditionNodes.length > 0) {
          let { nodeId } = node;
          node.conditionNodes.forEach(item => {
            fn(item, nodeId);
          });
        }
        return false;
      }

      fn(this.nodeData);
      return list;
    },
    /**
     * 层级减一
     */
    scaleMinus() {
      if (this.scale <= this.scaleRange.min) {
        return false;
      }
      this.scale = +this.scale - 0.1;
      this.scale = this.scale.toFixed(1);
    },
    /**
     * 层级加一
     */
    scalePlus() {
      if (this.scale >= this.scaleRange.max) {
        return false;
      }
      this.scale = +this.scale + 0.1;
      this.scale = this.scale.toFixed(1);
    }
  }
};
</script>

<style lang="scss" scoped>
.box-scale-box {
  &::-webkit-scrollbar {
    /*滚动条整体样式*/

    width: 9px; /*高宽分别对应横竖滚动条的尺寸*/

    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/

    border-radius: 10px;

    //  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);

    background: #c2c2c2;
  }
  &::-webkit-scrollbar-track {
    /*滚动条里面轨道*/

    // -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);

    border-radius: 10px;

    background: #f5f5f7;
  }
}

.flow-design {
  height: 100%;
  width: 100%;
  background-color: #f5f5f7;
  position: relative;
  & > .zoom-btns {
    position: absolute;
    right: 50px;
    top: 20px;
    z-index: 10;
    & > .scale-text {
      width: 66px;
      display: inline-block;
      text-align: center;
    }
    & > button {
      width: 32px;
      text-align: center;
      padding-left: 0;
      padding-right: 0;
    }
  }
  & > .box-scale-box {
    height: 100%;
    width: 100%;
    overflow: scroll;
    & > .box-scale {
      min-height: 0;
      box-sizing: border-box;
      transform: scale(1);
      display: inline-block;
      position: relative;
      padding: 54.5px 0;
      -webkit-box-align: start;
      -ms-flex-align: start;
      align-items: flex-start;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      min-width: min-content;
      background-color: #f5f5f7;
      -webkit-transform-origin: 0 0 0;
      transform-origin: 0 0 0;
      & > .end-node {
        border-radius: 50%;
        font-size: 14px;
        color: rgba(25, 31, 37, 0.4);
        text-align: left;
        & > .end-node-circle {
          width: 10px;
          height: 10px;
          margin: auto;
          border-radius: 50%;
          background: #dbdcdc;
        }
        & > .end-node-text {
          margin-top: 5px;
          text-align: center;
        }
      }
    }
  }
}
</style>
