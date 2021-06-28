/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-langx-events","skylark-domx-eventer"],function(e,t,i){"use strict";return t.Emitter.inherit({_construct:function(e){this.carsouel=e},jump:function(e,t){let r=this.carsouel;r.elmx(),r.options;var a=r.$(r.getActiveItem()),n=t||r.getItemForDirection(e,a),s=r.interval,o="next"==e?"left":"right";if(n.hasClass("active"))return r.moving=!1;var l=n[0],c=i.create("jumping.lark.carousel",{relatedTarget:l,direction:o});if(r.trigger(c),!c.isDefaultPrevented()){r.moving=!0,s&&r.pause(),r._indicators&&r._indicators.setActiveIndicator(r.getItemIndex(n));var d=i.create("jumped.lark.carousel",{relatedTarget:l,direction:o});return n.addClass(e),n.reflow(),a.addClass(o),n.addClass(o),n.one("transitionEnd",function(){n.removeClass([e,o].join(" ")).addClass("active"),a.removeClass(["active",o].join(" ")),r.moving=!1,setTimeout(function(){r.trigger(d)},0)}).emulateTransitionEnd(),s&&r.cycle(),this}}})});
//# sourceMappingURL=../sourcemaps/_carousel/effect_slide.js.map
