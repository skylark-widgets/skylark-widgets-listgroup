/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-lists","skylark-domx-plugins-base","./groups","./group","skylark-domx-plugins-toggles/collapse"],function(l,e,r,s,i,o,g){var n=g.inherit({klassName:"Tree",pluginName:"lark.groups.tree",_construct:function(e,r){this.overrided(e,r),s.multitier(e,l.mixin({hide:function(l){l.plugin("lark.toggles.collapse").hide()},toggle:function(l){l.plugin("lark.toggles.collapse").toggle()}},this.options))}});return i.register(n),o.Tree=n});
//# sourceMappingURL=sourcemaps/tree.js.map
