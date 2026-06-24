import { createElementBlock as e, openBlock as t } from "vue";
//#region \0plugin-vue:export-helper
var n = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, r = {};
function i(n, r) {
	return t(), e("div", null, " 测试按钮 ");
}
var a = /*#__PURE__*/ n(r, [["render", i]]);
//#endregion
export { a as Button };
