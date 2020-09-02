<!--
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 添加按钮
 * @$emit:
 * @$slot:
 * @Date: 2019-04-09 12:29:25
 * @LastEditTime: 2020-09-02 14:17:56
 -->
<template>
  <div class="add-node-button add-node-btn">
    <el-popover
      placement="right-start"
      width="220"
      v-model="popoverShow"
      popper-class="add-node-button__popper"
      trigger="click"
    >
      <!-- 按钮 -->
      <el-button
        v-show="!readonly"
        slot="reference"
        type="primary"
        icon="el-icon-plus"
        circle
      ></el-button>

      <!-- 选项 -->
      <div class="add-node-button_item" @click="approverAdd">
        <div class="add-node-button_item-img approver_img"></div>
        <p>审批节点</p>
      </div>
      <div class="add-node-button_item" @click="ccAdd">
        <div class="add-node-button_item-img cc_img"></div>
        <p>抄送节点</p>
      </div>
      <div class="add-node-button_item" @click="branchAdd">
        <div class="add-node-button_item-img branch_img"></div>
        <p>条件分支</p>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { guid } from "@/utils/index";
export default {
  name: "add-node-button",
  inject: {
    flowIndex: { default: {} },
    branchWrap: { default: null }
  },

  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    isWrapBtn: {
      // 是否是wrap下面的按钮
      type: Boolean,
      default: false
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
      popoverShow: false
    };
  },

  computed: {
    summaryArr() {
      let summary = this.flowIndex.summary || [];
      return summary.map(item => item.attr);
    }
  },

  methods: {
    init() {},
    /**
     * 添加审批
     */
    approverAdd() {
      // flowIndex
      let fieldPermissionMap = {};
      let explainList = this.flowIndex.explainList || [];
      let fieldPermissionList = [];
      explainList.forEach(item => {
        fieldPermissionList.push({
          attr: item.attr,
          subAttr: "",
          editable: 0,
          fieldType: item.fieldType,
          summary: this.summaryArr.includes(item.attr) ? 1 : 0,
          visible: 1
        });
        fieldPermissionMap[item.attr] = {
          attr: item.attr,
          subAttr: "",
          editable: 0,
          fieldType: item.fieldType,
          summary: this.summaryArr.includes(item.attr) ? 1 : 0,
          visible: 1
        };
        if (/^(10006|20003)$/.test(item.fieldType)) {
          let subFields = item.subForm.items;
          subFields.forEach(sub => {
            fieldPermissionList.push({
              attr: item.attr,
              subAttr: sub.attr,
              editable: 0,
              fieldType: sub.fieldType,
              summary: 0,
              visible: 1
            });
            fieldPermissionMap[`${item.attr}.${sub.attr}`] = {
              attr: item.attr,
              subAttr: sub.attr,
              editable: 0,
              fieldType: sub.fieldType,
              summary: 0,
              visible: 1
            };
          });
        }
      });

      let newNodeId = guid();
      let newNode = {
        type: 3,
        name: "审批节点",
        prevId: this.nodeData.nodeId,
        nodeId: newNodeId,
        wrapperId:
          this.branchWrap && !this.isWrapBtn
            ? this.branchWrap.nodeData.nodeId
            : undefined,
        data: {
          fieldPermissionMap,
          commitVerifyFlag: 1, // 节点提交验证，1所有数据均可提交，2满足条件的数据才可提交，具体条件参考验证条件字段
          type: 3,
          opinionFlag: 0, // 是否必填审批意见 2：选填，1必填，0不填
          commitFlag: 1, // 是否开启提交（1：开启；0：不开启）
          commitText: "提交", // 提交文案
          storageFlag: 1, // 是否开启暂存（1：开启；0：不开启）
          storageText: "暂存", // 暂存文案
          commitPrintFlag: 0, // 是否开启提交并打印（1：开启；0：不开启）
          commitPrintText: "提交并打印", // 提交并打印文案
          backFlag: 0, // 是否开启回退（1：开启；0：不开启）
          backType: 0, // 0 上一节点 1：所选节点
          backText: "回退", // 回退文案
          transferFlag: 0, // 是否开启转交（1：开启；0：不开启）
          transferText: "转交", // 转交文案
          transferUserList: [], // 转交人
          endFlag: 1, // 是否开启结束流程（1：开启；0：不开启）
          endText: "结束", // 结束流程文案
          signType: 1, // 会签/或签，1或签(任意负责人提交后进入下一节点), 2会签(所有负责人提交后进入下一节点)  流转规则
          mainUserList: [], // 节点负责人
          enableCCFlag: 0, // 流程节点是否启用抄送，如果启用，则抄送人保存在ccUser中
          ccUserList: [], // 抄送人
          // 'fieldPermissionList': fieldPermissionList, // 字段权限
          ccPrintFlag: 0 // 是否开启抄送打印（1：开启；0：不开启）
        }
      };
      let tempChildrenNode = this.nodeData.childNode
        ? JSON.parse(JSON.stringify(this.nodeData.childNode))
        : null;
      if (tempChildrenNode) {
        tempChildrenNode.prevId = newNodeId;
        newNode.childNode = tempChildrenNode;
      }

      this.$set(this.nodeData, "childNode", newNode);
      this.popoverShow = false;
    },
    /**
     * 添加抄送
     */
    ccAdd() {
      let fieldPermissionMap = {};
      let explainList = this.flowIndex.explainList || [];
      let fieldPermissionList = [];
      explainList.forEach(item => {
        fieldPermissionList.push({
          attr: item.attr,
          subAttr: "",
          editable: 0,
          fieldType: item.fieldType,
          summary: this.summaryArr.includes(item.attr) ? 1 : 0,
          visible: 1
        });
        fieldPermissionMap[item.attr] = {
          attr: item.attr,
          subAttr: "",
          editable: 0,
          fieldType: item.fieldType,
          summary: this.summaryArr.includes(item.attr) ? 1 : 0,
          visible: 1
        };
        if (/^(10006|20003)$/.test(item.fieldType)) {
          let subFields = item.subForm.items;
          subFields.forEach(sub => {
            fieldPermissionList.push({
              attr: item.attr,
              subAttr: sub.attr,
              editable: 0,
              fieldType: sub.fieldType,
              summary: 0,
              visible: 1
            });
            fieldPermissionMap[`${item.attr}.${sub.attr}`] = {
              attr: item.attr,
              subAttr: sub.attr,
              editable: 0,
              fieldType: sub.fieldType,
              summary: 0,
              visible: 1
            };
          });
        }
      });
      let newNodeId = guid();
      let newNode = {
        type: 4,
        name: "抄送节点",
        prevId: this.nodeData.nodeId,
        nodeId: newNodeId,
        wrapperId:
          this.branchWrap && !this.isWrapBtn
            ? this.branchWrap.nodeData.nodeId
            : undefined,
        data: {
          opinionFlag: 0, // 是否必填审批意见 2：选填，1必填，0不填
          commitPrintFlag: 0, // 是否开启提交并打印（1：开启；0：不开启）
          type: 4,
          enableCCFlag: 1, // 流程节点是否启用抄送，如果启用，则抄送人保存在ccUser中
          ccUserList: [], // 抄送人
          // 'fieldPermissionList': fieldPermissionList, // 字段权限
          fieldPermissionMap: fieldPermissionMap,
          ccPrintFlag: 0, // 是否开启抄送打印（1：开启；0：不开启）
          commitVerifyFlag: 1, // 节点提交验证，1所有数据均可提交，2满足条件的数据才可提交，具体条件参考验证条件字段
          commitFlag: 1, // 是否开启提交（1：开启；0：不开启）
          commitText: "提交", // 提交文案
          storageFlag: 1, // 是否开启暂存（1：开启；0：不开启）
          storageText: "暂存", // 暂存文案
          commitPrintText: "提交并打印", // 提交并打印文案
          backFlag: 0, // 是否开启回退（1：开启；0：不开启）
          backType: 0, // 0 上一节点 1：所选节点
          backText: "回退", // 回退文案
          transferFlag: 0, // 是否开启转交（1：开启；0：不开启）
          transferText: "转交", // 转交文案
          transferUserList: [], // 转交人
          endFlag: 0, // 是否开启结束流程（1：开启；0：不开启）
          endText: "结束流程", // 结束流程文案
          signType: 1, // 会签/或签，1或签(任意负责人提交后进入下一节点), 2会签(所有负责人提交后进入下一节点)  流转规则
          mainUserList: [] // 节点负责人
        }
      };
      let tempChildrenNode = this.nodeData.childNode
        ? JSON.parse(JSON.stringify(this.nodeData.childNode))
        : null;
      if (tempChildrenNode) {
        tempChildrenNode.prevId = newNodeId;
        newNode.childNode = tempChildrenNode;
      }

      this.$set(this.nodeData, "childNode", newNode);
      this.popoverShow = false;
    },
    /**
     * 添加条件分支
     */
    branchAdd() {
      let newNodeId = guid();
      let newNode = {
        type: 6,
        name: "",
        prevId: this.nodeData.nodeId,
        nodeId: newNodeId,
        conditionNodes: [
          {
            name: "条件1",
            priority: 1,
            type: 5,
            wrapperId: newNodeId,
            prevId: newNodeId,
            nodeId: guid(),
            data: {
              // sUid: connection.getUuids()[0],
              // tUid: connection.getUuids()[1],
              conditionType: 1, // 流转条件 1：使用自定义流转条件判断；0：使用else条件
              conditions: [] // 流转条件
            }
          },
          {
            name: "条件2",
            type: 5,
            priority: 2,
            prevId: newNodeId,
            wrapperId: newNodeId,
            nodeId: guid(),
            data: {
              // sUid: connection.getUuids()[0],
              // tUid: connection.getUuids()[1],
              conditionType: 1, // 流转条件 1：使用自定义流转条件判断；0：使用else条件
              conditions: [] // 流转条件
            }
          }
        ]
      };
      let tempChildrenNode = this.nodeData.childNode
        ? JSON.parse(JSON.stringify(this.nodeData.childNode))
        : null;
      if (tempChildrenNode) {
        tempChildrenNode.prevId = newNode.conditionNodes[0].nodeId;
        newNode.conditionNodes[0].childNode = tempChildrenNode;
      }

      this.$set(this.nodeData, "childNode", newNode);
      this.popoverShow = false;
    }
  }
};
</script>

<style lang="scss">
body {
  .add-node-button__popper {
    padding: 20px;
    display: flex;
    justify-content: space-around;
    .add-node-button_item {
      font-size: 12px;
      cursor: pointer;
      width: 50px;
      &:hover {
        color: orange;
      }
      & > .add-node-button_item-img {
        width: 100%;
        height: 50px;
        box-sizing: border-box;
        // border: 1px solid #999;
        margin-bottom: 5px;
      }
      & > .approver_img {
        background: url("./../imgs/shenpi@2x.png");
        background-size: 100% 100%;
      }
      & > .cc_img {
        background: url("./../imgs/chaosong@2x.png");
        background-size: 100% 100%;
      }
      & > .branch_img {
        background: url("./../imgs/tiaojian@2x.png");
        background-size: 100% 100%;
      }
    }
  }
}
.add-node-button {
  user-select: none;
  width: 240px;
  padding: 20px 0 32px;
  display: flex;
  position: relative;
  z-index: 3;
  -webkit-box-pack: center;
  justify-content: center;
  flex-shrink: 0;
  -webkit-box-flex: 1;
  flex-grow: 1;
  & > .btn {
    height: 32px;
    position: relative;
    z-index: 3;
  }
}
</style>
