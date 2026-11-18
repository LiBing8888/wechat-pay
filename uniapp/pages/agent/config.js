export const RECORD_STATUS = {
  Cancelled: -2, // 已撤销
  Rejected: -1, // 已拒绝
  Pending: 0, // 待审核
  Approved: 1, // 审核通过
};

export function getDefaultFormConfig() {
  return {
    1: {
      name: "texts",
      key: "name",
      titleConfig: {
        value: "代理名称"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "请输入代理名称",
      },
      valConfig: {
        tabVal: 0,
        tabList: [
          {
            name: "文本"
          }
        ]
      }
    },
    2: {
      name: "texts",
      key: "phone",
      titleConfig: {
        value: "联系电话"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "请输入联系电话",
      },
      valConfig: {
        tabVal: 1,
        tabList: [
          {
            name: "文本"
          },
          {
            name: "手机号"
          }
        ]
      }
    },
    3: {
      name: "uploadPicture",
      key: "qualification",
      titleConfig: {
        value: "申请资质"
      },
      tipConfig: {
        value: "图片格式支持JPG、PNG、JPEG",
      },
      numConfig: {
        val: 10
      }
    },
    4: {
      name: "texts",
      key: "remark",
      titleConfig: {
        value: "说明"
      },
      tipConfig: {
        value: "请输入说明",
      },
      valConfig: {
        tabVal: 0,
        tabList: [
          {
            name: "文本"
          }
        ]
      }
    },
  }
};