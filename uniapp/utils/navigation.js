// 回到首页
export function handleToHomePage() {
	const pages = getCurrentPages();

	const normalize = route =>
		route.replace(/^\//, "").split("?")[0];

	const homePath = "pages/index/index";
	
	// 找到首页所在的页面栈位置
	const homeIndex = pages.findIndex(
		page => normalize(page.route) === homePath
	);

	if (homeIndex !== -1) {
		const delta = pages.length - 1 - homeIndex;
		if (delta > 0) {
			return uni.navigateBack({ delta });
		} else if (delta === 0) {
			// 已经在首页，无需操作
			return;
		}
	}

	uni.switchTab({
		url: "/pages/index/index"
	});
}

export function handleBack() {
	const pages = getCurrentPages();
	if (pages.length > 1) {
		uni.navigateBack();
	} else {
		uni.reLaunch({
			url: "/pages/index/index"
		});
	}
}