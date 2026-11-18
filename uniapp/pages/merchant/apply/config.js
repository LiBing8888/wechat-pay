import { getStoreTypeApi, merClassifly, getCategoryList } from "@/api/store";

export const RECORD_STATUS = {
  Cancelled: -2, // 已撤销
  Rejected: -1, // 已拒绝
  Pending: 0, // 待审核
  Approved: 1, // 审核通过
};

export async function getDefaultFormConfig() {
  let storeTypeList = [];
  let merClassiflyList = [];
  let platformCategoryList = [];
  try {
    const [typeRes, merRes, categoryRes] = await Promise.all([getStoreTypeApi(), merClassifly(), getCategoryList()]);
    storeTypeList = typeRes.data;
    merClassiflyList = merRes.data;
    platformCategoryList = categoryRes.data.list;
  } catch (error) {
    console.log(error);
  }
  
  // 商品类型
  const productTypeList = [
    { type_name: '普通商品', product_type: 0 },
    { type_name: '虚拟商品', product_type: 1 },
    { type_name: '卡密商品', product_type: 2 },
    { type_name: '云盘商品', product_type: 3 },
    { type_name: '预约商品', product_type: 4 }
  ];
  
  return {
    1: {
      name: "texts",
      key: "business_name",
      titleConfig: {
        value: "商户名称"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "请输入商户名称",
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
      key: "name",
      titleConfig: {
        value: "联系人姓名"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "请输入联系人姓名",
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
    3: {
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
    4: {
      name: "selects",
      key: "business_store_category",
      titleConfig: {
        value: "店铺分类"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "请选择商户类型",
      },
      wordsConfig: {
        title: "选项",
        list: merClassiflyList.map(item => ({
          id: item.merchant_category_id,
          val: item.category_name
        }))
      }
    },
    5: {
      name: "selects",
      key: "business_store_type",
      titleConfig: {
        value: "店铺类型"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      wordsConfig: {
        title: "选项",
        list: storeTypeList.map(item => ({
          id: item.mer_type_id,
          val: item.type_name
        }))
      }
    },
    6: {
      name: "platformCategory",
      key: "platform_category",
      label: "平台分类",
      type: "platformCategory",
      required: true,
      placeholder: "请选择平台分类",
      value: [],
      categoryIds: [],
      options: platformCategoryList,
      cascadeData: platformCategoryList.map(item => ({
        name: item.cate_name,
        value: item.store_category_id,
        checkbox: false,
        children: item.children && item.children.length > 0 ? item.children.map(child => ({
          name: child.cate_name,
          value: child.store_category_id,
          checkbox: false,
          children: child.children && child.children.length > 0 ? child.children.map(grandchild => ({
            name: grandchild.cate_name,
            value: grandchild.store_category_id,
            checkbox: false,
            children: []
          })) : []
        })) : []
      })),
      maxCount: 0
    },
    7: {
      name: "productType",
      key: "mer_product_type",
      label: "商品类型",
      type: "productType",
      required: true,
      placeholder: "请选择商品类型",
      value: []
    },
    8: {
      name: "uploadPicture",
      key: "qualification",
      titleConfig: {
        value: "申请资质"
      },
      titleShow: {
        title: "是否必填",
        val: 1,
        type: "form"
      },
      tipConfig: {
        value: "图片格式支持JPG、PNG、JPEG",
      },
      numConfig: {
        val: 10
      }
    },
    9: {
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