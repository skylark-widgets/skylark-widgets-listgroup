/**
 * skylark-domx-plugins-lists - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-lists/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins","./lists","./group"],function(e,t,i,l,r,n){var s=n.inherit({klassName:"Tiler",pluginName:"domx.plugins.lists.tiler",options:{alignment:"left",infiniteScroll:!1,itemRendered:null,noItemsHTML:"no items found",selectable:!1,viewClass:"repeater-tile",template:'<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',item:{template:'<div class="thumbnail"><img height="75" src="<%= href %>" width="65"><span><%= title %></span></div>'},renderItem:null},_construct:function(i,l){this.overrided(i,l),this._renderItem=e.template(this.options.item.template);for(var r=0;r<l.items.length;r++){var n=this._renderItem(l.items[r]);this._velm.append(t(n))}}});return l.register(s),r.Tiler=s});
//# sourceMappingURL=sourcemaps/tiler.js.map
