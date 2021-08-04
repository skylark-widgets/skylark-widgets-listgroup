/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-browser","skylark-domx-eventer","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","../groups"],function(t,i,a,e,s,r,n){return r.Plugin.inherit({klassName:"Indicators",pluginName:"lark.groups.carousel.indicators",options:{thumbnail:!0,indicator:{template:"<li/>",indexAttrName:"data-index",selector:"> li",classes:{active:"active"}}},_construct:function(t,i){r.Plugin.prototype._construct.call(this,t,i),this._velm=this.elmx(),this.$indicators=this._velm.query(this.options.indicator.selector),this._velm.on("click",`[${this.options.indicator.indexAttrName}]`,t=>{var i=e(t.target).attr(this.options.indicator.indexAttrName);this.options.carousel.jump(i),t.preventDefault()})},createIndicator:function(i){return this._renderIndicatorHtml||(this._renderIndicatorHtml=t.template(this.options.indicator.template)),e(this._renderIndicatorHtml(i))[0]},addIndicator:function(t,i){var a=this.createIndicator(i);a.setAttribute("data-index",t),this._velm.append(a),this.$indicators=this.$indicators.add(a)},clearIndicators:function(){this.$indicators.remove()},setActiveIndicator:function(t){if(this.$indicators){let i=this.options.indicator.classes.active;this.activeIndicator&&this.activeIndicator.removeClass(i),this.activeIndicator=e(this.$indicators[t]),this.activeIndicator.addClass(i)}}})});
//# sourceMappingURL=../sourcemaps/_carousel/indicators.js.map
