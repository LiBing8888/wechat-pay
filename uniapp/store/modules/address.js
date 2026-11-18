import { getAddressList } from "@/api/user.js";

const ADDRESS_MUTATIONS = {
  SET_ADDRESS_LIST: 'SET_ADDRESS_LIST'
};

let loadTask = null;

function getAddressListTask() {
  if (!loadTask) {
    loadTask = getAddressList({
      page: 1,
      limit: 20
    });

    loadTask.finally(() => {
      loadTask = null;
    });
  }

  return loadTask;
}

export default {
  state() {
    return {
      addressList: []
    };
  },
  mutations: {
    [ADDRESS_MUTATIONS.SET_ADDRESS_LIST](state, list) {
      state.addressList = list;
    }
  },
  actions: {
    async refreshAddressList({ commit, state }, payload = {}) {
      const { force = false } = payload;
      if (state.addressList.length && !force) return;
      try {
        const res = await getAddressListTask();
        commit(ADDRESS_MUTATIONS.SET_ADDRESS_LIST, res.data.list);
      } catch (error) {
        throw error;
      }
    }
  }
}