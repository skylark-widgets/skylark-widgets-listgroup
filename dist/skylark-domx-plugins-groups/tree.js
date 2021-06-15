/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-lists","skylark-domx-plugins-base","./groups","./group","skylark-domx-plugins-toggles/collapse"],function(e,r,s,i,l,n,o){var t=o.inherit({klassName:"Tree",pluginName:"lark.groups.tree",_construct:function(r,s){this.overrided(r,s),i.multitier(r,e.mixin({hide:function(e){},toggle:function(e){}},this.options))}});return l.register(t),n.Tree=t});
//# sourceMappingURL=sourcemaps/tree.js.map
