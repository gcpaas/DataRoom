<template>
  <el-select
    ref="colorSelect"
    v-model="myColor"
    value-key="value"
    class="bs-el-select select"
    popper-class="bs-el-select"
    placeholder=""
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="(item, index) in colorList"
      :key="index"
      :label="item.label"
      :value="item.value"
    >
      <span style="float: left">{{ item.label }}</span>
      <span style="float: right">
        <span v-for="(co, ind) in JSON.parse(item.value)" :key="ind">
          <span
            :style="
              'float: left ;background-color:' +
              co +
              ';width:10px;border-radius:1px;display:inline-block;height:15px;margin-top:9px;'
            "
          />
          <span style="float: left">&nbsp; </span>
        </span>
      </span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "VChartColorSelect",
  model: {
    prop: "color",
    event: "update",
  },
  props: {
    // 父组件绑定的值
    color: {
      type: Array,
      default: undefined,
    },
  },
  data() {
    return {
      colorList: [
        {
          label: "火山蓝",
          value: JSON.stringify([
            "#006EFF",
            "#00E5E5",
            "#2E55EA",
            "#B8E7FE",
            "#00D689",
            "#B7F9F5",
            "#FBCC71",
            "#F46E50",
          ]),
        },
        {
          label: "清新蜡笔",
          value: JSON.stringify([
            "#fd7f6f",
            "#7eb0d5",
            "#b2e061",
            "#bd7ebe",
            "#ffb55a",
            "#ffee65",
            "#beb9db",
            "#fdcce5",
            "#8bd3c7",
          ]),
        },
        {
          label: "郊外",
          value: JSON.stringify([
            "#cfcfcf",
            "#ffbc79",
            "#a2c8ec",
            "#898989",
            "#c85200",
            "#5f9ed1",
            "#595959",
            "#ababab",
            "#ff800e",
            "#006ba4",
          ]),
        },
        {
          label: "汽车蓝橙",
          value: JSON.stringify([
            "#4ABEFF",
            "#E97A4B",
            "#A0D8FF",
            "#FFB99C",
            "#91A9B1",
            "#E9A94B",
            "#4BE99D",
            "#6F86FF",
          ]),
        },
        {
          label: "金融黄",
          value: JSON.stringify([
            "#FFCF67",
            "#FF9254",
            "#D7D7D7",
            "#E1C396",
            "#FFB99C",
            "#C5BEB4",
            "#96B9A8",
            "#C59C7F",
          ]),
        },
        {
          label: "文旅青",
          value: JSON.stringify([
            "#32E2CD",
            "#FFCE70",
            "#B03C3C",
            "#BEEAE4",
            "#D66E41",
            "#E1E1E1",
            "#3BC080",
            "#435BD8",
          ]),
        },
        {
          label: "电力绿",
          value: JSON.stringify([
            "#08FEF3",
            "#FF7925",
            "#FBCC71",
            "#2EC8EA",
            "#B8FEF1",
            "#F9CFB7",
            "#D43A30",
            "#5FCEA6",
          ]),
        },
        {
          label: "电商紫",
          value: JSON.stringify([
            "#734AFF",
            "#FF6960",
            "#5484FF",
            "#CDC4EC",
            "#EAC4C2",
            "#34CECC",
            "#FFB054",
            "#C13C5C",
          ]),
        },
        {
          label: "红蓝",
          value: JSON.stringify([
            "#006EFF",
            "#CC3B3B",
            "#B8E5FE",
            "#214FFF",
            "#FFCFCF",
            "#00E5E5",
            "#B7F9F5",
            "#FBCC71",
          ]),
        },
        {
          label: "党建红",
          value: JSON.stringify([
            "#E82F2F",
            "#FF9635",
            "#D7D7D7",
            "#E19B96",
            "#FFB99C",
            "#C5BEB4",
            "#B99696",
            "#C59C7F",
          ]),
        },
      ],
      colorValue: [],
      // myColor: undefined
    };
  },
  watch: {
    color: function (val) {
      this.init(val);
    },
  },
  computed: {
    myColor: {
      get() {
        return (
          JSON.stringify(this.color) ||
          JSON.stringify([
            "#006EFF",
            "#00E5E5",
            "#2E55EA",
            "#B8E7FE",
            "#00D689",
            "#B7F9F5",
            "#FBCC71",
            "#F46E50",
          ])
        );
      },
      set(val) {},
    },
  },
  created() {},
  mounted() {
    this.init(this.color);
  },
  methods: {
    // 初始化colorList,当绑定的颜色跟预设的颜色不一致时
    init(color) {
      // ,当绑定的颜色跟预设的颜色是否一致
      const flag = this.colorList.some(
        (co) => co.value === JSON.stringify(color),
      );
      // colorList是否存在自定义选项
      const f = this.colorList.some((co) => co.label === "自定义");
      if (!flag) {
        if (f) {
          this.colorList = this.colorList.map((co) => {
            if (co.label === "自定义") {
              return {
                label: "自定义",
                value: JSON.stringify(color),
              };
            } else {
              return co;
            }
          });
        } else {
          this.colorList.push({
            label: "自定义",
            value: JSON.stringify(color),
          });
        }
      }
    },
    handleChange(val) {
      const colors = JSON.parse(val);
      // 触发update事件更新父组件绑定值
      this.$emit("update", colors);
    },
  },
};
</script>

<style scoped></style>
