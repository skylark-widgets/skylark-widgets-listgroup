/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","skylark-domx-plugins-toggles/collapse","./groups","./group"],function(e,t,l,r,a,i,s){var n=s.inherit({klassName:"Tiler",pluginName:"lark.groups.tiler",options:{alignment:"left",infiniteScroll:!1,itemRendered:null,noItemsHTML:"no items found",selectable:!1,template:'<ul class="clearfix repeater-linear" data-container="true" data-infinite="true" data-preserve="shallow"></ul>',item:{template:'<li class="repeater-item"><img  src="{{ThumbnailImage}}" class="thumb"/><h4 class="title">{{name}}</h4></div>'},viewClass:"repeater-linear",renderItem:null},_construct:function(l,r){this.overrided(l,r),this._renderItem=e.template(this.options.item.template);for(var a=0;a<r.items.length;a++){var i=this._renderItem(r.items[a]);this._velm.append(t(i))}}});return r.register(n),i.Linear=n});
//# sourceMappingURL=sourcemaps/linear.js.map
