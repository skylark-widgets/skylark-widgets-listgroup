/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-langx-events","skylark-domx-eventer","skylark-domx-query","skylark-domx-styler","skylark-domx-plugins-interact/rotatable","skylark-domx-plugins-interact/scalable"],function(t,e,s,n,r,i,o){"use strict";return e.Emitter.inherit({options:{},_construct:function(t){this.carsouel=t,this.resetItems(),this._$threedContainer=t.$(`.${t.options.modes.rotate.classes.threedContainer}`),this._rotatable=new i(this._$threedContainer[0],{starting:function(e){return 0==n(e.target).closest(t.options.item.selector).length},started:function(){},stopped:function(){}}),this._scalable=new o(this._$threedContainer[0],{radius:t.options.modes.rotate.radius,targets:t.getItems()}),this._start=0},resetItems:function(t){let e=this.carsouel.getItems();if(e){let t=this._itemsCount=e.length,n=this._deltaDeg=360/t;for(var s=0;s<t;s++)r.css(e[s],{transform:"rotateY("+s*n+"deg)"})}},jump:function(t,e,s,n){let r=this.carsouel,i=(r.elmx(),r.options,r.$(r.findItem(e)),r.$(r.findItem(t)));return i.addClass(s),i.reflow(),r._$itemsContainer.one("transitionEnd",function(){i.removeClass(s),n()}).css("transform","rotateY("+t*this._deltaDeg+"deg)").emulateTransitionEnd(),this}})});
//# sourceMappingURL=../sourcemaps/_carousel/mode-rotate.js.map
