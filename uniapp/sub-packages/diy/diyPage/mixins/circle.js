import { mapGetters } from "vuex";
import { mergeUrlQuery } from "@/utils/url";

export default {
  computed: {
    ...mapGetters(["circleId"]),
  },
  inject: {
    isPlatformPage: {
      default: false
    }
  },
  watch: {
    circleId() {
      if (!this.isPlatformPage) return;
      this.refreshData?.();
    }
  },
  methods: {
    mergeParams(params) {
      if (!this.isPlatformPage || !this.circleId || !params || params.region_id) return params;
      return {
        ...params,
        region_id: this.circleId || '',
      };
    },
    mergeUrl(url) {
      if (!this.isPlatformPage || !this.circleId) return url;
      return mergeUrlQuery(url, {
        circle_id: this.circleId,
      });
    }
  }
}