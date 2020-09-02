/*
 * @Author: xuwang.bao
 * @LastEditors: xuwang.bao
 * @Description: 一些公共逻辑mixin
 * @$emit:
 * @$slot:
 * @Date: 2019-04-09 09:43:07
 * @LastEditTime: 2020-09-02 13:47:50
 */
// @ts-ignore
import AddNodeButton from "./../components/add-node-button.vue";
export default {
  inject: {
    flowIndex: { default: null },
    branchWrap: { default: null },
    nodeWrap: { default: null },
    parentApproverNode: { default: null }
  },
  props: {
    selectItem: {
      // 当前选中项
    },
    parentNode: {
      // 父节点
      required: true,
      default: () => ({})
    }
  },
  components: {
    AddNodeButton
  },
  computed: {
    readonly() {
      return this.flowIndex.readonly;
    },
    isSelect() {
      // 自己是否被选中
      return this.nodeData === this.selectItem;
    }
  },
  methods: {}
};
