<!--
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 审批人节点
 * @$emit:
 * @$slot:
 * @Date: 2019-04-08 16:09:27
 * @LastEditTime: 2020-09-02 14:04:12
 -->
<template>
  <div class="approver-node">
    <!-- 错误警告 -->
    <el-tooltip class="item" effect="dark" :content="erro" placement="top">
      <div v-show="erro" class="node-erro__block">
        <i class="el-icon-warning"></i>
      </div>
    </el-tooltip>
    <!-- 删除按钮 -->
    <div
      v-show="!readonly && nodeType !== 1"
      @click="deleteClick"
      title="删除"
      class="node-close-btn"
    >
      <i class="el-icon-close"></i>
    </div>
    <!-- 节点 -->
    <div
      @click="nodeClick"
      v-if="nodeType === 1"
      class="node-wrap-box"
      :class="{ active: isSelect }"
    >
      <template>
        <div class="node-block start-node">
          <div class="approver-node__title">
            <i class="node-icon web-iconfont web-icon-start-node"></i>
            {{ nodeData.name }}
          </div>
          <div class="node-contant">
            请设置节点属性
          </div>
        </div>
      </template>
    </div>
    <div
      @click="nodeClick"
      v-else-if="/^(3|4)$/.test(nodeType)"
      class="node-wrap-box not-start-node"
      :class="{ active: isSelect }"
    >
      <template v-if="nodeType === 3">
        <div class="node-block flow-node">
          <div class="approver-node__title">
            <i class="web-iconfont node-icon web-icon-field-main-user"></i>
            {{ nodeData.name }}
          </div>
          <div class="node-contant">
            {{ mainUserText ? mainUserText : erro }}
          </div>
        </div>
      </template>
      <template v-else-if="nodeType === 4">
        <div class="node-block cc-node">
          <div class="approver-node__title">
            <i class="node-icon web-iconfont web-icon-cc-node"></i>
            {{ nodeData.name }}
          </div>
          <div class="node-contant">
            {{ ccUserText ? ccUserText : erro }}
          </div>
        </div>
      </template>
    </div>
    <!-- 连线 + 添加 -->
    <div class="add-node-btn-box">
      <AddNodeButton :readonly="!!readonly" :nodeData="nodeData" />
    </div>
  </div>
</template>

<script>
import utilMixin from "./../mixin/util-mixin";
export default {
  name: "approver-node",

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

  data() {
    return {
      // erro: null
    };
  },

  computed: {
    permissionErro: {
      get() {
        let fieldPermissionList = [];
        let fieldPermissionMap =
          (this.nodeData &&
            this.nodeData.data &&
            this.nodeData.data.fieldPermissionMap) ||
          {};
        Object.keys(fieldPermissionMap).forEach(key => {
          fieldPermissionList.push(fieldPermissionMap[key]);
        });
        let hasVisiblePermissionList = fieldPermissionList
          .map(item => item.visible)
          .filter(item => !!item);
        if (hasVisiblePermissionList.length <= 0) {
          return "请设置节点权限";
        } else {
          return null;
        }
      }
    },
    erro() {
      let permissionErro = this.permissionErro;
      if (permissionErro) {
        return permissionErro;
      }
      // || this.nodeType === 1
      if (this.nodeType === 3 && this.mainUserList.length <= 0) {
        return "请设置负责人";
      } else if (this.nodeType === 4 && this.ccUserList.length <= 0) {
        return "请设置抄送人";
      }
      return null;
    },
    nodeType() {
      // 节点类型 enum 1:开始节点 2:结束节点 3:审批阶段 4:抄送节点
      // type: Number,
      // default: 3
      return this.nodeData.type;
    },
    ccUserList() {
      let res = [];
      if (this.nodeData.data && this.nodeData.data.ccUserList) {
        res = this.nodeData.data.ccUserList;
      }
      return res;
    },
    mainUserList() {
      let res = [];
      if (this.nodeData.data && this.nodeData.data.mainUserList) {
        res = this.nodeData.data.mainUserList;
      }
      return res;
    },
    mainUserText() {
      return this.mainUserList.map(item => item.name).toString();
    },
    ccUserText() {
      return this.ccUserList.map(item => item.name).toString();
    }
  },

  created() {},

  mounted() {
    this.$set(
      this["flowIndex"].nodeList,
      this["flowIndex"].nodeList.length,
      this
    );
  },

  destroyed() {
    this["flowIndex"].nodeList.forEach((item, index) => {
      if (item === this) {
        this["flowIndex"].nodeList.splice(index, 1);
      }
    });
  },
  methods: {
    getIsSecondNode() {
      if (this.nodeData.type !== 3) {
        return false;
      }
      // 递归向上找上一个审批节点
      let nodeWrap = this.nodeWrap;
      let IsSecondNode;
      function getPreApproverNode(nodeWrap) {
        let res = false;
        if (!nodeWrap) {
          return res;
        }
        let preNodeWrap = nodeWrap.nodeWrap;
        if (!preNodeWrap) {
          return res;
        }
        if (/^(1)$/.test(preNodeWrap.nodeData.type)) {
          res = true;
        } else {
          res = getPreApproverNode(preNodeWrap);
        }
        return res;
      }
      IsSecondNode = getPreApproverNode(nodeWrap);
      return IsSecondNode;
    },
    init() {},
    /**
     * 节点点击处理
     */
    nodeClick() {
      // let isSecondNode = this.getIsSecondNode()
      // this.$store.commit('SET_IS_SECOND_NODE', isSecondNode)
      this.flowIndex.$emit("nodeClick", this.nodeData);
    },
    /**
     * 删除自己
     */
    deleteClick() {
      // 缓存自己的子节点
      let tempChildNode = this.nodeData.childNode
        ? JSON.parse(JSON.stringify(this.nodeData.childNode))
        : null;
      if (tempChildNode) {
        tempChildNode.prevId = this.parentNode.nodeId;
      }
      // 将子节点挂载在自己的父节点
      this.$set(this.parentNode, "childNode", tempChildNode);
    }
  }
};
</script>

<style lang="scss" scoped>
.approver-node {
  position: relative;
  &:hover {
    & > .node-close-btn {
      display: block;
    }
  }
  & > .node-erro__block {
    position: absolute;
    right: -40px;
    top: 0px;
    height: 24px;
    width: 24px;
    color: #e6a23c;
    font-size: 24px;
    cursor: help;
  }
  & > .node-close-btn {
    cursor: pointer;
    display: none;
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0px;
    top: 0px;
    z-index: 19;
    text-align: center;
    line-height: 24px;
    color: #eee;
  }
  & > .not-start-node {
    &::before {
      z-index: 2;
      content: "";
      position: absolute;
      top: -12px;
      left: 50%;
      -webkit-transform: translateX(-50%);
      transform: translateX(-50%);
      width: 0;
      height: 4px;
      border-style: solid;
      border-width: 8px 6px 4px;
      border-color: #cacaca transparent transparent;
      background: #f5f5f7;
    }
  }
  & > .node-wrap-box {
    position: relative;
    box-sizing: border-box;
    width: 220px;
    min-height: 78px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
    &::after {
      pointer-events: none;
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    }
    // 节点统一样式
    & > .node-block {
      display: flex;
      flex-direction: column;
      & > .node-contant {
        padding: 20px 10px 10px 10px;
        display: flex;
        align-items: center;
        flex: 1;
      }
      & > .approver-node__title {
        flex-shrink: 0;
        z-index: 2;
        position: relative;
        border-top-right-radius: 4px;
        border-top-left-radius: 4px;
        height: 24px;
        display: flex;
        align-items: center;
        color: #fff;
        padding-left: 15px;
        // background: orange;
        & > .node-icon {
          color: #fff;
          margin-right: 5px;
        }
      }
    }
    //开始节点
    & > .start-node {
      & > .approver-node__title {
        background: #7b94ba;
      }
    }
    & > .flow-node {
      & > .approver-node__title {
        background: orange;
      }
    }
    & > .cc-node {
      & > .approver-node__title {
        background: #5cc1a5;
      }
    }
  }
  & > .add-node-btn-box {
    width: 220px;
    display: inline-flex;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    -ms-flex-positive: 1;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      margin: auto;
      width: 2px;
      height: 100%;
      background-color: #cacaca;
    }
    & > .add-node-btn {
      user-select: none;
      width: 220px;
      padding: 20px 0 32px;
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      flex-shrink: 0;
      -webkit-box-flex: 1;
      flex-grow: 1;
    }
  }
}
</style>
