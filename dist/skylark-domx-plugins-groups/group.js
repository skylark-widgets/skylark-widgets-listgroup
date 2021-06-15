/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","./groups"],function(e,s,t,i,a){var l=i.Plugin.inherit({klassName:"Group",pluginName:"domx.plugins.groups.group",options:{multiSelect:!1,classes:{active:"active"},selectors:{item:"li"},item:{template:'<span><i class="glyphicon"></i><a href="javascript: void(0);"></a> </span>',checkable:!1,selectors:{icon:" > span > i",text:" > span > a"}},selected:0},state:{selected:Object},_construct:function(e,s){this.overrided(e,s);var i=this,a=this._velm=t(this._elm),l=this.options.selectors.item;this._$items=a.$(l),a.on("click",l,function(){var e=t(this);if(!e.hasClass("disabled")){var s=e.data("value");void 0===s&&(s=i._$items.index(this)),i.selected=s}return!1}),this.selected=this.options.selected},_refresh:function(s){this.overrided(s);var t=this;function i(s){return e.isNumber(s)?t._$items.eq(s):t._$items.filter('[data-value="'+s+'"]')}s.selected&&(this.options.multiSelect||(i(s.selected.oldValue).removeClass(t.options.classes.active),function(e){i(e).addClass(t.options.classes.active)}(s.selected.value)))}});return i.register(l),a.Group=l});
//# sourceMappingURL=sourcemaps/group.js.map
