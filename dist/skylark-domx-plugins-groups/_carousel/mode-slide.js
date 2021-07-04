/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-langx-events","skylark-domx-eventer"],function(e,n,t){"use strict";return n.Emitter.inherit({_construct:function(e){this.carsouel=e},jump:function(e,n,t,s){let i=this.carsouel,a=(i.elmx(),i.options,i.$(i.findItem(n))),r=i.$(i.findItem(e)),l=i.interval,o="next"==t?"left":"right";return l&&i.pause(),r.addClass(t),r.reflow(),a.addClass(o),r.addClass(o),r.one("transitionEnd",function(){r.removeClass([t,o].join(" ")),a.removeClass(o),s()}).emulateTransitionEnd(),l&&i.cycle(),this}})});
//# sourceMappingURL=../sourcemaps/_carousel/mode-slide.js.map
