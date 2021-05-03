/**
 * skylark-domx-plugins-lists - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-lists/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins","./lists"],function(e,s,t,i,l){var a=i.Plugin.inherit({klassName:"Group",pluginName:"domx.plugins.lists.group",options:{multiSelect:!1,classes:{active:"active"},selectors:{item:"li"},item:{template:'<span><i class="glyphicon"></i><a href="javascript: void(0);"></a> </span>',checkable:!1,selectors:{icon:" > span > i",text:" > span > a"}},selected:0},state:{selected:Object},_construct:function(e,s){this.overrided(e,s);var i=this,l=this._velm=t(this._elm),a=this.options.selectors.item;this._$items=l.$(a),l.on("click",a,function(){var e=t(this);if(!e.hasClass("disabled")){var s=e.data("value");void 0===s&&(s=i._$items.index(this)),i.selected=s}return!1}),this.selected=this.options.selected},_refresh:function(s){this.overrided(s);var t=this;function i(s){return e.isNumber(s)?t._$items.eq(s):t._$items.filter('[data-value="'+s+'"]')}s.selected&&(this.options.multiSelect||(i(s.selected.oldValue).removeClass(t.options.classes.active),function(e){i(e).addClass(t.options.classes.active)}(s.selected.value)))}});return i.register(a),l.Group=a});
//# sourceMappingURL=sourcemaps/group.js.map
