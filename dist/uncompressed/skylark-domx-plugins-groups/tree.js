 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-lists",
  "skylark-domx-plugins-base",
  "./groups",
  "./group",
  "skylark-domx-plugins-toggles/collapse"
],function(langx,$,elmx,lists,plugins,groups,Group){


  var Tree = Group.inherit({
    klassName : "Tree",

    pluginName : "lark.groups.tree",

    _construct : function(elm,options) {
        this.overrided(elm,options);

        lists.multitier(elm,langx.mixin({
          hide : function($el) {

          },
          toggle : function($el) {

          }
        },this.options));
    }

  });


  plugins.register(Tree);

  return groups.Tree = Tree;	
});