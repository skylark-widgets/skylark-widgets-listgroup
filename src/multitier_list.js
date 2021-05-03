 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "skylark-domx-plugins-toggles/Collapsable",
  "./lists",
  "./Group"
],function(langx,$,elmx,plugins,Collapsable,lists,Group){

    var _MultitierList = Group.inherit({
        klassName : "_MultitierList",

        options : {
          multitier : {
            mode   : "",  // "tree" or "accordion" or "popover"
            levels : 2,
            selectors :  {
              children : "ul",  // "> .list-group"
              hasChildren : ":has(ul)",
              toggler : " > a"
            },
            classes : {
              collapsed : "",
              expanded : ""
            },

            multiExpand : true,
          }
        },

        state : {
          selected : Object
        },

        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                itemSelector = this.options.selectors.item;

            var multitierMode = this.options.multitier.mode,
                hasChildrenSelector = this.options.multitier.selectors.hasChildren,
                childrenSelector = this.options.multitier.selectors.children;           


              var multiExpand = self.options.multitier.multiExpand,
                  togglerSelector = self.options.multitier.selectors.toggler;

              this._$items.has(childrenSelector).find(togglerSelector).on("click" + "." + this.pluginName, function(e) {
                  e.preventDefault();

                  if (multiExpand) {
                      langx.scall($(this).closest(itemSelector).siblings().removeClass("active").children(childrenSelector+".in").plugin("domx.toggles.collapsable"),"hide");
                  }
                  $(this).closest(itemSelector).toggleClass("active").children(childrenSelector).plugin("domx.toggles.collapsable").toggle();
              });

             this._$items.filter(".active").has(childrenSelector).children(childrenSelector).addClass("collapse in");
             this._$items.not(".active").has(childrenSelector).children(childrenSelector).addClass("collapse");
        }

  });


  return lists._MultitierList = _MultitierList;

});



