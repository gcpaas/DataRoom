// 事件与动作定义
export default [{
    name: "事件名称",
    code: "事件标识",
    desc: "事件描述信息，描述该事件详细信息",
    event: true,
    paramsList: [{
        name: "字段名称",
        desc: "字段描述",
        type: "字段类型",
        required: "是否必填；true、false",
        defaultValue: "默认值"
    }],
    paramsExample: [{
        newValue: '合肥'
    }]
}, {
    name: "动作名称",
    code: "动作名",
    desc: "动作描述信息，描述该动作的详细信息",
    event: false,
    paramsList: [{
        name: "字段名称",
        desc: "字段描述",
        type: "字段类型",
        required: "是否必填；true、false",
        defaultValue: "默认值"
    }],
    paramsExample: [{
        time: '2024-03-21'
    }]
}]
