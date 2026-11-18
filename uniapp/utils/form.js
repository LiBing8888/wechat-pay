import { systemFormData } from "@/api/user";
import dayjs from "@/plugin/dayjs/dayjs.min";

export class FormUtils {
  static async getSystemFormById(formId) {
    const res = await systemFormData(formId);
    return res.data;
  }

  static async getSystemForm(formId, defaultValues) {
    const res = await FormUtils.getSystemFormById(formId);
    const formConfig = FormUtils.processFormConfig(res.value, defaultValues);
    return formConfig;
  }

  // 根据后台表单配置，生成 base_system_form 组件需要的配置，支持通过 defaultValues 设置默认值
  static processFormConfig(values, defaultValues) {
    const formConfig = [];
    try {
      const keys = Object.keys(values).sort((a, b) => a - b);
      for (const formKey of keys) {
        const item = values[formKey];
        
        // 生成表单配置项
        const formItem = {
          key: item.key || item.titleConfig?.value,
          label: item.label || item.titleConfig?.value,
          type: item.type || item.name,
          required: item.required || (item.titleShow?.val === 1)
        };

        // 设置表单配置项的 placeholder
        if (item.tipConfig?.value) {
          formItem.placeholder = item.tipConfig.value;
        } else if (item.placeholder) {
          formItem.placeholder = item.placeholder;
        }

        // 根据 wordsConfig 生成 range
        if (item.wordsConfig) {
          formItem.range = item.wordsConfig.list;
        }

        // 判断是否存在默认值
        const defaultValue = defaultValues && (defaultValues[item.titleConfig?.value] !== undefined || defaultValues[item.label] !== undefined || defaultValues[item.key] !== undefined) ? 
          (defaultValues[item.titleConfig?.value] || defaultValues[item.label] || defaultValues[item.key]) : undefined;

        if (formItem.type === "texts") {
          // 文本类型组件
          const inputTypeMap = {
            0: "text",
            1: "tel",
            2: "idcard",
            3: "email",
            4: "digit",
          };

          formItem.value = defaultValue || item.defaultValConfig?.value || "";
          if (item.valConfig) {
            const { tabList, tabVal } = item.valConfig;
            const inputTypeLabel = tabList[tabVal]?.name;
            formItem.inputTypeLabel = inputTypeLabel;
            formItem.inputType = inputTypeMap[tabVal];
          } else {
            formItem.inputTypeLabel = "文本";
            formItem.inputType = "text";
          }
        } else if (formItem.type === "selects") {
          // 下拉选择类型组件
          formItem.index = 0;
          if (defaultValue) {
            formItem.value = defaultValue;

            // 如果配置项中含有 id 属性，则根据 id 属性查找对应的 value
            // 否则根据 val 属性查找对应的 value
            const findAttr = formItem.range[0]?.id === undefined ? 'val' : 'id';
            formItem.index = formItem.range.findIndex(item => item[findAttr] === defaultValue);

            // 如果配置项中含有 id 属性，则选择器中需要展示 val 作为内容
            if (formItem.index !== -1 && findAttr === 'id') {
              formItem.value = formItem.range[formItem.index].val;
            }
          } else {
            formItem.value = "";
            formItem.index = 0;
          }
        } else if (formItem.type === "radios") {
          // 单选类型组件
          formItem.value = defaultValue || "";
        } else if (formItem.type === "checkboxs") {
          // 多选类型组件
          if (defaultValue) {
            formItem.value = Array.isArray(defaultValue) ? defaultValue : defaultValue.split(",");
          } else {
            formItem.value = [];
          }
        } else if (formItem.type === "dates") {
          // 日期类型组件
          let initValue = "";
          if (item.valConfig && item.valConfig.tabVal === 0) {
            // 显示默认值
            if (item.valConfig.tabData === 1) {
              // 使用配置的默认值
              initValue = item.valConfig.specifyDate.replace(/\//g, "-");
            } else {
              // 使用当前时间
              initValue = dayjs().format("YYYY-MM-DD");
            }
          }
          formItem.value = defaultValue || initValue || "";
        } else if (formItem.type === "citys") {
          // 地址选择类型组件
          formItem.value = [];
          formItem.active = false;
          formItem.cityShow = item.valConfig ? item.valConfig.tabVal + 1 : 1;
          if (defaultValue) {
            formItem.value = defaultValue.split("/").map(item => {
              return {
                name: item,
              };
            });
          }
        } else if (formItem.type === "dateranges") {
          // 日期范围类型组件
          let initValue = [];
          if (item.valConfig && item.valConfig.tabVal === 0) {
            // 显示默认值
            if (item.valConfig.tabData === 1) {
              // 使用配置的默认值
              initValue = item.valConfig.specifyDate;
            } else {
              // 使用当前时间
              initValue = [
                dayjs().format("YYYY-MM-DD"),
                dayjs().format("YYYY-MM-DD"),
              ];
            }
          }
          if (defaultValue) {
            formItem.value = Array.isArray(defaultValue) ? defaultValue : defaultValue.split(",");
          } else {
            formItem.value = initValue || [];
          }
        } else if (formItem.type === "times") {
          // 时间类型组件
          let initValue = "";
          if (item.valConfig && item.valConfig.tabVal === 0) {
            // 显示默认值
            if (item.valConfig.tabData === 1) {
              // 使用配置的默认值
              initValue = item.valConfig.specifyDate;
            } else {
              // 使用当前时间
              initValue = dayjs().format("HH:mm");
            }
          }
          formItem.value = defaultValue || initValue || "";
        } else if (formItem.type === "timeranges") {
          // 时间范围类型组件
          formItem.value = [];
          formItem.indexValue = [0, 0, 0, 0];

          const generateTimeIndex = () => {
            try {
              const getHourIndex = str => Number(str.split(":")[0]);
              const getMinuteIndex = str => Number(str.split(":")[1]);

              formItem.indexValue = [
                getHourIndex(formItem.value[0]),
                getMinuteIndex(formItem.value[0]),
                getHourIndex(formItem.value[1]),
                getMinuteIndex(formItem.value[1]),
              ];
            } catch (error) {
              console.log(error);
            }
          }

          if (item.valConfig && item.valConfig.tabVal === 0) {
            // 显示默认值
            formItem.value = item.valConfig.specifyDate;
            if (item.valConfig.tabData === 1) {
              // 使用配置的默认值
              formItem.value = item.valConfig.specifyDate;
            } else {
              // 使用当前时间
              formItem.value = [
                dayjs().format("HH:mm"),
                dayjs().format("HH:mm"),
              ];
            }

            generateTimeIndex();
          } else if (defaultValue) {
            formItem.value = defaultValue.split("-").map(item => item.trim());
            generateTimeIndex();
          }
        } else if (formItem.type === "uploadPicture") {
          // 上传图片类型组件
          formItem.maxCount = item.numConfig?.val || 1;
          formItem.value = defaultValue ? (Array.isArray(defaultValue) ? defaultValue : defaultValue.split(",")) : [];
        } else if (formItem.type === "platformCategory") {
          // 平台分类类型组件
          formItem.options = item.options || [];
          formItem.cascadeData = item.cascadeData || [];
          formItem.maxCount = item.maxCount || 0;
          formItem.value = [];
          formItem.categoryIds = [];
          // 如果有默认值，将ID数组转换为名称数组
          if (defaultValue && item.options && item.options.length > 0) {
            const ids = Array.isArray(defaultValue) ? defaultValue : defaultValue.split(",");
            // 递归查找分类名称
            const findCategoryName = (options, id) => {
              if (!options || !options.length) return null;
              for (const opt of options) {
                if (opt.store_category_id == id) {
                  return opt.cate_name;
                }
                if (opt.children && opt.children.length > 0) {
                  const name = findCategoryName(opt.children, id);
                  if (name) return name;
                }
              }
              return null;
            };
            // 将ID数组转换为名称数组
            formItem.value = ids.map(id => findCategoryName(item.options, id)).filter(Boolean);
            // 同时保存ID数组用于提交
            formItem.categoryIds = ids;
          }
        } else if (formItem.type === "productType") {
          // 商品类型类型组件
          formItem.value = defaultValue ? (Array.isArray(defaultValue) ? defaultValue : defaultValue.split(",")) : [];
        }

        formConfig.push(formItem);
      }
    } catch (error) {
      console.log(error);
    }

    return formConfig;
  }
}