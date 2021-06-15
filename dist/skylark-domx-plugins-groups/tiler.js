/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","./groups","./group"],function(e,t,i,r,l,a){var n=a.inherit({klassName:"Tiler",pluginName:"domx.plugins.groups.tiler",options:{alignment:"left",infiniteScroll:!1,itemRendered:null,noItemsHTML:"no items found",selectable:!1,viewClass:"repeater-tile",template:'<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',item:{template:'<div class="thumbnail"><img height="75" src="<%= href %>" width="65"><span><%= title %></span></div>'},renderItem:null},_construct:function(i,r){this.overrided(i,r),this._renderItem=e.template(this.options.item.template);for(var l=0;l<r.items.length;l++){var a=this._renderItem(r.items[l]);this._velm.append(t(a))}}});return r.register(n),l.Tiler=n});
//# sourceMappingURL=sourcemaps/tiler.js.map
