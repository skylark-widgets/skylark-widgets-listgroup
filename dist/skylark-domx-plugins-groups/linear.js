/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","skylark-domx-plugins-toggles/collapse","./groups","./group"],function(s,e,a,t,i,r,l){"use strict";var n=l.inherit({klassName:"Linear",pluginName:"lark.groups.linear",options:{item:{selectable:!0},data:{}},_construct:function(s,e){this.overrided(s,e),this.options.data.items&&this.addItems(this.options.data.items)}});return t.register(n),r.Linear=n});
//# sourceMappingURL=sourcemaps/linear.js.map
