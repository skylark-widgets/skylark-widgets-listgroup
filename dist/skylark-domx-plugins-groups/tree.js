/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-lists","skylark-domx-plugins-base","./groups","./group","skylark-domx-plugins-toggles/collapse"],function(e,l,s,r,i,o,t){"use strict";var g=t.inherit({klassName:"Tree",pluginName:"lark.groups.tree",_construct:function(l,s){this.overrided(l,s),r.multitier(l,e.mixin({hide:function(e){e.plugin("lark.toggles.collapse").hide()},toggle:function(e){e.plugin("lark.toggles.collapse").toggle()}},this.options))}});return i.register(g),o.Tree=g});
//# sourceMappingURL=sourcemaps/tree.js.map
