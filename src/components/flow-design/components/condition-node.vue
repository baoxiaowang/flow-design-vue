<!--
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 条件节点
 * @$emit:
 * @$slot:
 * @Date: 2019-04-08 16:14:30
 * @LastEditTime: 2020-09-02 14:33:56
 -->
<template>
  <div class="condition-node">
    <div
      class="condition-node-box"
      :class="{ 'han-children-condition': hasChildrenCondition }"
    >
      <div
        @click="handleClick"
        :class="{ active: isSelect }"
        class="condition-node__block"
      >
        <template v-if="!readonly">
          <!-- 删除 -->
          <div @click.stop="deleteClick" title="删除" class="node-close-btn">
            <i class="el-icon-close"></i>
          </div>
          <!-- 左移 -->
          <div @click.stop="leftSort" v-if="leftSortShow" class="sort-left">
            &lt;
          </div>
          <!-- 右移 -->
          <div @click.stop="rightSort" v-if="rightSortShow" class="sort-right">
            &gt;
          </div>
        </template>
        <!-- 头部 -->
        <div class="condition-node__top">
          <span
            class="name__span"
            @click.stop.prevent="conditionNameClick"
            v-if="!edit"
            >{{ nodeData.name }}</span
          >
          <el-input
            class="name__input"
            size="mini"
            ref="nameInput"
            @blur="edit = false"
            v-else
            v-model="nodeData.name"
            placeholder=""
          ></el-input>
          <span class="lever__span">
            {{ "优先级" + `${nodeData.priority}` }}
          </span>
        </div>
        <div class="condition-node_contant">
          <template v-if="conditionType === 2">
            使用else流转条件
          </template>
          <template v-else>
            <p :key="index" v-for="(item, index) in filterConditions">
              {{ item }}
            </p>
          </template>
        </div>
      </div>

      <!-- 添加按钮 -->
      <div class="add-node-btn">
        <AddNodeButton :readonly="!!readonly" :nodeData="nodeData" />
      </div>
      <!-- 下级节点 -->
      <template v-if="nodeData.childNode">
        <NodeWrap
          :selectItem="selectItem"
          :parentNode="nodeData"
          :nodeData="nodeData.childNode"
        />
      </template>
    </div>
  </div>
</template>

<script>
import utilMixin from "./../mixin/util-mixin";
export default {
  name: "condition-node",
  mixins: [utilMixin],

  props: {
    index: {
      // 索引
      type: Number,
      required: true
    },
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
      edit: false
    };
  },

  computed: {
    conditionType() {
      return this.nodeData.data.conditionType;
    },
    /**
     * 是否可以左移
     */
    leftSortShow() {
      let res = true;
      if (this.index === 0) {
        res = false;
      }
      return res;
    },
    /**
     * 是否可以右移
     */
    rightSortShow() {
      let res = true;
      if (this.index === this.parentNode.conditionNodes.length - 1) {
        res = false;
      }
      return res;
    },
    /**
     * 该条件下是否含有子详情
     */
    hasChildrenCondition() {
      let res = false;
      function has(node) {
        if (node.conditionNodes && node.conditionNodes.length >= 2) {
          return true;
        } else if (node.childNode) {
          return has(node.childNode);
        } else {
          return false;
        }
      }
      res = has(this.nodeData);
      return res;
    },
    conditions() {
      let res = [];
      if (this.nodeData.data && this.nodeData.data.conditions) {
        res = this.nodeData.data.conditions;
      }
      return res;
    },
    filterConditions() {
      let arr = this.conditions;
      return arr.map(item => {
        return `关于${item.name}的条件`;
      });
    }
  },

  watch: {
    index: {
      handler(val) {
        this.nodeData.priority = val + 1;
      }
    }
  },

  mounted() {},

  destroyed() {},

  methods: {
    init() {},
    /**
     * 条件块点击处理
     */
    handleClick() {
      this.flowIndex.$emit("nodeClick", this.nodeData);
    },
    /**
     * 条件名称点击
     */
    conditionNameClick() {
      if (this.readonly) {
        return;
      }
      this.edit = true;
      this.$nextTick(() => {
        this.$refs["nameInput"].focus();
      });
    },
    /**
     * 删除当前条件分支
     */
    deleteClick() {
      // 分支对象
      let conditionNodes = this.parentNode.conditionNodes;
      // 如果条件分支只有2个(分支最少存在两个)
      if (conditionNodes && conditionNodes.length === 2) {
        let branchChildren = this.parentNode.childNode;
        if (branchChildren) {
          branchChildren.prevId = this.parentNode.prevId;
        }
        // this.$set(this.parentNode, 'conditionNodes', [])
        // this.$set(this.parentNode.parentNode, 'childNode', branchChildren)
        this.$emit("deleteBranch", branchChildren);
      } else {
        if (Array.isArray(this.parentNode.conditionNodes)) {
          this.parentNode.conditionNodes.splice(this.index, 1);
        }
      }
      this.flowIndex.$emit("nodeClick", null);
    },
    /**
     * 左移
     */
    leftSort() {
      // 排序开始前
      this.$emit("beforeSort");
      let targetNode = this.parentNode.conditionNodes[this.index - 1];
      let newArrObj = {
        ...this.parentNode.conditionNodes,
        [this.index - 1]: this.nodeData,
        [this.index]: targetNode,
        length: this.parentNode.conditionNodes.length
      };
      let newArr = Array.from(newArrObj);
      this.parentNode["conditionNodes"] = newArr;

      setTimeout(() => {
        this.$emit("afterSort");
      }, 800);
    },
    /**
     * 右移
     */
    rightSort() {
      this.$emit("beforeSort");
      let targetNode = this.parentNode.conditionNodes[this.index + 1];
      let newArrObj = {
        ...this.parentNode.conditionNodes,
        [this.index + 1]: this.nodeData,
        [this.index]: targetNode,
        length: this.parentNode.conditionNodes.length
      };
      let newArr = Array.from(newArrObj);
      this.parentNode["conditionNodes"] = newArr;
      setTimeout(() => {
        this.$emit("afterSort");
      }, 800);
    }
  }
};
</script>

<style lang="scss" scoped>
.condition-node {
  position: relative;
  display: inline-flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  -webkit-box-flex: 1;
  // min-height: 220px;
  & > .han-children-condition {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  & > .condition-node-box {
    padding-top: 30px;
    padding-right: 50px;
    padding-left: 50px;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    flex-grow: 1;
    position: relative;
    display: inline-flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    -webkit-box-flex: 1;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 2px;
      height: 100%;
      background-color: #cacaca;
    }
    & > .condition-node__block {
      & > .condition-node_contant {
        padding-top: 10px;
      }
      box-sizing: border-box;
      position: relative;
      width: 220px;
      min-height: 78px;
      background: #fff;
      border-radius: 4px;
      padding: 20px 19px;
      cursor: pointer;
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
      &:hover {
        & > .node-close-btn {
          display: block;
        }
        & > .sort-right {
          display: flex;
        }
        & > .sort-left {
          display: flex;
        }
      }
      & > .sort-left {
        color: #999;
        position: absolute;
        top: 0;
        bottom: 0;
        display: none;
        z-index: 1;
        left: 0;
        border-left: 1px solid #f6f6f6;
        align-items: center;
        &:hover {
          background: #efefef;
        }
        &::after {
          border: 1px solid #3296fa;
          box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
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
      }
      & > .sort-right {
        color: #999;
        position: absolute;
        top: 0;
        bottom: 0;
        display: none;
        z-index: 1;
        right: 0;
        border-left: 1px solid #f6f6f6;
        align-items: center;
        &:hover {
          background: #efefef;
        }
        &::after {
          border: 1px solid #3296fa;
          box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
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
      }
      & > .node-close-btn {
        cursor: pointer;
        display: none;
        width: 24px;
        height: 24px;
        position: absolute;
        right: 5px;
        top: 0px;
        z-index: 19;
        text-align: center;
        line-height: 24px;
        color: #999;
        &:hover {
          color: red;
        }
      }
      & > .condition-node__top {
        & > .name__span {
          color: orange;
          text-decoration: underline;
          font-size: 13px;
          display: inline-block;
          width: 120px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        & > .name__input {
          width: 120px;
        }
        & > .lever__span {
          float: right;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
