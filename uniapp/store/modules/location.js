import { getGeocoder } from "@/api/store";

let loadingTask = null;
let getGeocoderTask = null;
// 添加一个存储 key
const LOCATION_AUTO_KEY = 'location_auto_requested';
export default {
	
  state() {
    return {
      location: null,
      locationLoading: false,
      address: "",

    }
  },
  mutations: {
    SET_LOCATION(state, location) {
      state.location = location;
    },
    SET_ADDRESS(state, address) {
      state.address = address;
    },
    SET_LOADING(state, loading) {
      state.locationLoading = loading;
    },

  },

  actions: {
    async initLocation({ dispatch }, payload = {}) {
      const { force = true, auto = true } = payload;
        
			// 关键改动：自动模式下检查是否已经请求过
			if (auto) {
				const hasAutoRequested = uni.getStorageSync(LOCATION_AUTO_KEY);
				if (hasAutoRequested) {
					console.log('已自动请求过位置，不再弹出');
					return;
				}
			}

      await dispatch('updateLocation', { force });
      await dispatch('updateAddress');
    },
    async updateLocation({ commit, state }, { force = false }) {
      if (state.location && !force) return;
      if (loadingTask) return loadingTask;
      commit('SET_LOADING', true);
      loadingTask = (async () => {
        const promiseTask = new Promise((resolve, reject) => {
          let done = false;
          const timer = setTimeout(() => {
            if (done) return;
            done = true;		
            reject(new Error('获取定位超时'));
          }, 3000);

          uni.getLocation({
            type: "wgs84",
            success(result) {
							console.log("用户同意了....")
              if (done) return;
              clearTimeout(timer);
              done = true;
							uni.setStorageSync(LOCATION_AUTO_KEY, true);
              resolve(result);
            },
            fail(error) {
							console.log("用户拒绝了.....")
              if (done) return;
              clearTimeout(timer);
              done = true;
							 uni.setStorageSync(LOCATION_AUTO_KEY, true);
              reject(new Error(error.errMsg));
            }
          });
        });
        try {
          const result = await promiseTask;
          const { latitude, longitude } = result;
          commit('SET_LOCATION', {
            latitude,
            longitude
          });
        } catch (error) {
          throw error;
        } finally {
          loadingTask = null;
          commit('SET_LOADING', false);
        }
      })();
      return loadingTask;
    },
    async updateAddress({ commit, state }) {
      if (!state.location) {
        console.warn('定位信息未初始化');
        return;
      };
      if (getGeocoderTask) return getGeocoderTask;
      getGeocoderTask = (async () => {
        const { latitude, longitude } = state.location;
        try {
          const geoCoderRes = await getGeocoder({
            lat: latitude,
            long: longitude
          });
          const address = geoCoderRes.data.formatted_addresses?.recommend || geoCoderRes.data.address;
          commit('SET_ADDRESS', address);
        } catch (error) {
          throw error;
        } finally {
          getGeocoderTask = null;
        }
      })();
      return getGeocoderTask;
    }
  }
}