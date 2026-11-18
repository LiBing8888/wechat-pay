<template>
  <view>
    <form class="record-form-container">
      <view class="form-item" :class="item.type" v-for="(item, index) of formConfig" :key="item.key">
        
				<view class="form-item-label" :class="labelClass" :data-required="item.required">{{ item.label }}</view>
        <view class="form-item-input-wrapper">
          <input v-if="item.type === 'texts'" :placeholder="item.placeholder" class="form-item-input"
            :type="item.inputType" v-model="item.value" placeholder-style="color: #ccc" />
          <textarea v-else-if="item.type === 'textarea'" :placeholder="item.placeholder" class="form-item-input"
            :type="item.inputType" v-model="item.value" placeholder-style="color: #ccc" auto-height />
          <picker v-else-if="item.type === 'selects'" :range="item.range" range-key="val" class="form-item-input"
            @change="handleSelectChange($event, item, index)" :value="item.index">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value }">
              {{ item.value || "请选择" }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </picker>
          <checkbox-group v-else-if="item.type === 'checkboxs'" @change="handleCheckboxChange($event, item, index)"
            class="form-item-checkbox-group">
            <label v-for="checkboxItem of item.range" :key="checkboxItem.val" class="form-item-checkbox-label">
              <checkbox :value="checkboxItem.val" :checked="item.value.includes(checkboxItem.val)" />
              {{ checkboxItem.val }}
            </label>
          </checkbox-group>
          <picker mode="date" v-else-if="item.type === 'dates'" class="form-item-input"
            @change="handleDateChange($event, item, index)" :value="item.value" :start="item.start">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value }">
              {{ item.value || item.placeholder }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </picker>
          <view class="form-item-input" v-else-if="item.type === 'citys'">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value.length }"
              @click="handleActiveCityPicker($event, item, index)">
              {{item.value.length ? item.value.map(i => i.name).join("/") : item.placeholder}}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
            <CityPicker class="form-item-input-city" :display="item.active"
              @submit="handleCityChange($event, item, index)" :address="item.value"
              @changeClose="handleCityChangeClose($event, item, index)" :cityShow="item.cityShow" />
          </view>
          <uni-datetime-picker class="form-item-input daterange-picker" v-else-if="item.type === 'dateranges'"
            type="daterange" :border="false" :clear-icon="false" :placeholder="item.placeholder" :value="item.value"
            @change="handleDateRangeChange($event, item, index)">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value.length }">
              {{ item.value.length ? item.value.join(" ~ ") : item.placeholder }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </uni-datetime-picker>
          <uni-datetime-picker class="form-item-input daterange-picker" v-else-if="item.type === 'datetimerange'"
            type="datetimerange" :border="false" :clear-icon="false" :placeholder="item.placeholder" :value="item.value"
            @change="handleDateTimeRangeChange($event, item, index)">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value.length }">
              {{ item.value.length ? item.value.join(" ~ ") : item.placeholder }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </uni-datetime-picker>
          <radio-group class="form-item-input radio-group" v-else-if="item.type === 'radios'"
            @change="handleRadioChange($event, item, index)">
            <label v-for="radioItem in item.range" :key="radioItem.val">
              <radio :value="radioItem.val" :checked="item.value === radioItem.val" />
              {{ radioItem.val }}
            </label>
          </radio-group>
          <picker mode="time" v-else-if="item.type === 'times'" class="form-item-input"
            @change="handleTimeChange($event, item, index)" :value="item.value">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value }">
              {{ item.value || item.placeholder }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </picker>
          <picker mode="multiSelector" v-else-if="item.type === 'timeranges'" class="form-item-input"
            @change="handleTimeRangeChange($event, item, index)" :value="item.indexValue" :range="timeRange">
            <view class="form-item-input-content" :class="{ 'is-empty': !item.value.length }">
              {{ item.value.length ? item.value.join(" ~ ") : item.placeholder }}
              <text class="iconfont icon-ic_rightarrow"></text>
            </view>
          </picker>
          <template v-else-if="item.type === 'uploadPicture'">
            <view class="form-item-image-placeholder" v-if="item.placeholder">{{ item.placeholder }}</view>
            <view class="form-item-input image-list" @click="handleImageClick($event, item, index)">
              <view class="form-item-image-item" v-for="(image, index) in item.value" :key="index">
                <image class="form-item-image-item__image" mode="aspectFill" :src="image" />
                <button class="form-item-image-item__delete" :data-event="EVENT.DELETE_IMAGE" :data-index="index">
                  <text class="iconfont icon-ic_close" :data-event="EVENT.DELETE_IMAGE" :data-index="index" />
                </button>
              </view>
              <view class="form-item-image-item form-item-image-item__add" :data-event="EVENT.ADD_IMAGE"
                v-if="item.value.length < item.maxCount">
                <text class="iconfont icon-ic_camera1"></text>
                <text>上传图片</text>
              </view>
            </view>
          </template>
          <!-- 平台分类 -->
          <template v-else-if="item.type === 'platformCategory'">
            <view class="input-value platform-category-container" @click="openCategoryCascade(item)">
              <scroll-view v-if="item.value.length > 0" scroll-x class="selected-categories-scroll">
                <view class="selected-categories">
                  <view v-for="(name, index) in item.value" :key="index" class="category-tag">
                    {{ name }}
                    <text class="iconfont icon-ic_close2" @click.stop="removeCategory(index, item)"></text>
                  </view>
                </view>
              </scroll-view>
              <view v-if="item.value.length === 0" class="input-placeholder">{{ item.placeholder }}</view>
              <view class='iconfont icon-ic_rightarrow'></view>
            </view>
            <cascade :ref="'cascade-' + item.key" :listData="item.cascadeData" title="平台分类" :maxCount="item.maxCount" @submitOk="handleCategorySubmit($event, item)" @reset="handleCategoryReset(item)" />
          </template>
          <!-- 商品类型 -->
          <template v-else-if="item.type === 'productType'">
            <view class="input-value" @click="showProductTypePopup(item)">
              <view v-if="item.value.length > 0" class="selected-types">
                <text>{{ getProductTypeNames(item.value).join(', ') }}</text>
              </view>
              <view v-else class="input-placeholder">{{ item.placeholder }}</view>
              <view class='iconfont icon-ic_rightarrow'></view>
            </view>
          </template>
        </view>
      </view>
    </form>
    
    <!-- 商品类型选择弹窗 -->
    <ProductTypePopup 
      :visible="productTypePopupVisible" 
      :productTypeArr="productTypeArr"
      :selectedValues="currentProductTypeItem ? currentProductTypeItem.value : []"
      @confirm="handleProductTypeConfirm"
      @close="productTypePopupVisible = false"
    />
  </view>
</template>

<script>
import CityPicker from "@/components/areaWindow/index.vue";
import { HTTP_REQUEST_URL as domain } from "@/config/app";
import ProductTypePopup from "@/components/product-type-popup/index.vue";
import cascade from "@/pages/store/component/cascade.vue";

const EVENT = {
  ADD_IMAGE: "addImage",
  DELETE_IMAGE: "deleteImage",
};

export default {
  components: {
    CityPicker,
    ProductTypePopup,
    cascade
  },
  props: {
    config: {
      type: Array,
      default: () => []
    },
    requireFlagPosition: {
      type: String,
      default: "after"
    }
  },
  data() {
    return {
      domain,
      EVENT,
      timeRange: this.generateTimePickerRange(),
      formConfig: JSON.parse(JSON.stringify(this.config)),
      // 商品类型弹窗
      productTypePopupVisible: false,
      currentProductTypeItem: null,
      // 商品类型列表
      productTypeArr: [
        { type_name: '普通商品', product_type: 0 },
        { type_name: '虚拟商品', product_type: 1 },
        { type_name: '卡密商品', product_type: 2 },
        { type_name: '云盘商品', product_type: 3 },
        { type_name: '预约商品', product_type: 4 },
				{ type_name: '年/次卡商品', product_type: 5 },
      ]
    }
  },
  computed: {
    labelClass() {
      return {
        "require-flag-before": this.requireFlagPosition === "before",
        "require-flag-after": this.requireFlagPosition === "after"
      };
    }
  },
  methods: {
    handleSelectChange(e, item, index) {
      const { value } = e.detail;
      this.formConfig[index].value = this.formConfig[index].range[value].val;
      this.formConfig[index].index = value;
    },
    handleCheckboxChange(e, item, index) {
      item.value = e.detail.value;
    },
    handleDateChange(e, item, index) {
      item.value = e.detail.value;
    },
    handleCityChange(e, item, index) {
      item.value = e;
    },
    handleCityChangeClose(e, item, index) {
      item.active = false;
    },
    handleActiveCityPicker(e, item, index) {
      item.active = true;
    },
    handleDateRangeChange(e, item, index) {
      item.value = e;
    },
    handleDateTimeRangeChange(e, item, index) {
      item.value = e;
    },
    handleRadioChange(e, item, index) {
      item.value = e.detail.value;
    },
    handleTimeChange(e, item, index) {
      item.value = e.detail.value;
    },
    handleTimeRangeChange(e, item, index) {
      item.indexValue = e.detail.value;
      const [startHourIndex, startMinuteIndex, endHourIndex, endMinuteIndex] = e.detail.value;
      item.value = [
        `${this.timeRange[0][startHourIndex]}:${this.timeRange[1][startMinuteIndex]}`,
        `${this.timeRange[2][endHourIndex]}:${this.timeRange[3][endMinuteIndex]}`,
      ];
    },
    handleUploadImage(list) {
      this.$util.uploadImageOne("upload/image", (res) => {
        list.push(res.data.path);
      });
    },
    handleImageClick(e, item, pindex) {
      const { event } = e.target.dataset;
      if (event === undefined) return;
      if (event === EVENT.ADD_IMAGE) {
        this.handleUploadImage(item.value);
      } else if (event === EVENT.DELETE_IMAGE) {
        const { index } = e.target.dataset;
        item.value.splice(index, 1);
      }
    },
    generateTimePickerRange() {
      const getHours = () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
      const getMinutes = () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

      return [
        getHours(),
        getMinutes(),
        getHours(),
        getMinutes(),
      ];
    },
    getData(forceCheck = false) {
      const result = {};

      for (let item of this.formConfig) {
        let value = item.value;
        if (item.required || forceCheck) {
          const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
          if (isEmpty) {
            this.$util.Tips({
              title: `${item.label}不能为空`,
              icon: "none"
            });
            return;
          }
        }

        if (item.type === "checkboxs") {
          value = value.join(",");
        } else if (item.type === "citys") {
          value = value.map(item => item.name).join("/");
        } else if (item.type === "timeranges") {
          value = value.join(" - ");
        } else if (item.type === "dateranges") {
          value = value.join(",");
        } else if (item.type === "selects") {
          const rangeItem = item.range[item.index];
          // 如果 rangeItem 的 id 存在，则将 value 设置为 id
          if (rangeItem.id !== undefined) {
            value = rangeItem.id;
          }
        } else if (item.type === "platformCategory") {
          value = item.categoryIds || [];
        } else if (item.type === "productType") {
          value = value || [];
        }

        result[item.key] = {
          label: item.label,
          value: value
        };
      }

      return result;
    },
    // 自定义渲染标签
    customRenderLabel() {
      return '';
    },
    // 打开平台分类级联选择弹窗
    openCategoryCascade(item) {
      const cascadeRef = this.$refs['cascade-' + item.key];
      if (cascadeRef) {
        const cascade = Array.isArray(cascadeRef) ? cascadeRef[0] : cascadeRef;
        if (cascade && typeof cascade.popupOpen === 'function') {
          cascade.popupOpen(item.categoryIds || []);
        }
      }
    },
    // 平台分类选择确认
    handleCategorySubmit(res, item) {
      if (res && res.value && res.value.length > 0) {
        item.categoryIds = res.value;
        item.value = res.names;
      } else {
        item.categoryIds = [];
        item.value = [];
      }
    },
    // 平台分类重置
    handleCategoryReset(item) {
      item.categoryIds = [];
      item.value = [];
    },
    // 删除平台分类
    removeCategory(index, item) {
      item.value.splice(index, 1);
      if (item.categoryIds) {
        item.categoryIds.splice(index, 1);
      }
    },
    // 显示商品类型选择弹窗
    showProductTypePopup(item) {
      this.currentProductTypeItem = item;
      this.productTypePopupVisible = true;
    },
    // 处理商品类型确认选择
    handleProductTypeConfirm(selectedValues) {
      if (this.currentProductTypeItem) {
        this.currentProductTypeItem.value = selectedValues;
      }
    },
    // 根据商品类型ID获取商品类型名称
    getProductTypeNames(ids) {
      return ids.map(id => {
        const typeItem = this.productTypeArr.find(item => item.product_type.toString() === id.toString());
        return typeItem ? typeItem.type_name : id;
      });
    }
  }
}
</script>

<style scoped lang="scss">
.record-form-container {
  --item-min-height: 90rpx;
  display: block;
  color: #282828;
}

.form-item {
  min-height: var(--item-min-height);
  display: flex;
  align-items: center;

  &.uploadPicture {
    flex-wrap: wrap;

    .form-item-label {
      flex: 0 0 100%;
      margin-top: 24rpx;
    }

    .form-item-input-wrapper {
      flex-flow: column nowrap;
    }
  }
}

.form-item-label {
  margin-right: 20rpx;
  flex-shrink: 0;

  &[data-required="true"] {

    &::before,
    &::after {
      color: red;
    }

    &.require-flag-before {
      &::before {
        content: "*";
        margin-right: 4rpx;
      }
    }

    &.require-flag-after {
      &::after {
        content: "*";
        margin-left: 4rpx;
      }
    }
  }
}

.form-item-input-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  flex: 1;
  overflow: hidden;
  text-align: right;
}

.form-item-image-placeholder {
  font-size: 24rpx;
  color: #BBBBBB;
  line-height: 34rpx;
  margin-top: 12rpx;
  text-align: left;
}

.form-item-input {
  text-align: right;
  flex: 1;
  border: none;
  outline: none;
  font-size: inherit;


  &.daterange-picker {
    /deep/.uni-date-x {
      color: inherit;
    }

    /deep/.uni-icons.icon-calendar.uniui-calendar {
      display: none;
    }
  }

  &.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    justify-content: flex-end;
  }

  &.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    padding: 20rpx 0;

    .form-item-image-item {
      position: relative;
      width: 148rpx;
      height: 148rpx;
      border-radius: 12rpx;
      background-color: #F9F9F9;

      &__add {
        border: 1rpx dashed #ddd;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        color: #999;

        .iconfont {
          font-size: 43rpx;
          pointer-events: none;
        }

        text {
          pointer-events: none;
          font-size: 24rpx;
        }
      }

      &__image {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
      }

      &__delete {
        position: absolute;
        top: 0;
        right: 0;
        width: 28rpx;
        height: 28rpx;
        background-color: #bbb;
        border-radius: 0;
        border-bottom-left-radius: 12rpx;
        border-top-right-radius: 12rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconfont {
          font-size: 24rpx;
          color: #fff;
        }
      }
    }
  }
}

.form-item-input-content {
  text-align: right;
  display: inline-flex;
  align-items: center;

  .ic_rightarrow {
    font-size: 24rpx;
    margin-left: 8rpx;
  }

  &.is-empty {
    color: #ccc;
  }
}

.form-item-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  width: initial;
}

.form-item-input-city {
  text-align: initial;
}
::v-deep .selected-categories-scroll .uni-scroll-view {
  width: 600rpx;
}
/* 平台分类和商品类型样式 */
.input-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 20rpx 0;
  position: relative;
  
  &.platform-category-container {
    .selected-categories-scroll {
      flex: 1;
      white-space: nowrap;
      position: relative;
      width: 600rpx;
      height: 60rpx;
    }
    
    /deep/ .next-xcascader {
      flex-shrink: 0;
    }
    
    /deep/ .next-xcascader .input-block {
      padding-right: 0;
    }
    
    /deep/ .next-xcascader .input-block input {
      display: none;
    }
  }
  
  .selected-categories {
    display: flex;
    flex-wrap: nowrap;
    gap: 10rpx;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
    margin-top: 6rpx;
    .category-tag {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      white-space: nowrap;
      
      .icon-ic_close2 {
        margin-left: 8rpx;
        font-size: 20rpx;
        color: #999;
      }
    }
  }
  
  .selected-types {
    flex: 1;
    text-align: right;
    
    text {
      font-size: 28rpx;
      color: #333;
    }
  }
  
  .input-placeholder {
    flex: 1;
    text-align: right;
    font-size: 28rpx;
    color: #ccc;
  }
  
  .icon-ic_rightarrow {
    font-size: 24rpx;
    color: #ccc;
    margin-left: 8rpx;
  }
}

/* 级联选择器样式 */
.next-xcascader {
  width: 100%;
}
</style>
