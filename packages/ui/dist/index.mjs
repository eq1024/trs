import { createElementBlock as r, openBlock as _ } from "vue";
const s = (t, n) => {
  const o = t.__vccOpts || t;
  for (const [c, e] of n)
    o[c] = e;
  return o;
}, a = {};
function f(t, n) {
  return _(), r("div", null, " 测试按钮 ");
}
const u = /* @__PURE__ */ s(a, [["render", f]]);
export {
  u as Button
};
