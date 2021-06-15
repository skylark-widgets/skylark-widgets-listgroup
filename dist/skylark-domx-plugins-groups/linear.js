/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","skylark-domx-plugins-toggles/collapse","./groups","./group"],function(s,e,i,l,t,o,a){var n=a.inherit({klassName:"Linear",pluginName:"domx.plugins.groups.linear",options:{multitier:{mode:"",levels:2,selectors:{children:"ul",hasChildren:":has(ul)",toggler:" > a"},classes:{collapsed:"",expanded:""},multiExpand:!0}},state:{selected:Object},_construct:function(i,l){this.overrided(i,l);var t=this.options.selectors.item,o=(this.options.multitier.mode,this.options.multitier.selectors.hasChildren,this.options.multitier.selectors.children),a=this.options.multitier.multiExpand,n=this.options.multitier.selectors.toggler;this._$items.has(o).find(n).on("click."+this.pluginName,function(i){i.preventDefault(),a&&s.scall(e(this).closest(t).siblings().removeClass("active").children(o+".in").plugin("domx.toggles.collapse"),"hide"),e(this).closest(t).toggleClass("active").children(o).plugin("domx.toggles.collapse").toggle()}),this._$items.filter(".active").has(o).children(o).addClass("collapse in"),this._$items.not(".active").has(o).children(o).addClass("collapse")}});return o.Linear=n});
//# sourceMappingURL=sourcemaps/linear.js.map
