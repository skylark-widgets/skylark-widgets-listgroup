 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups",
  "./linear"
],function(langx,$,elmx,plugins,groups,Linear){


  var Tree = Linear.inherit({
    klassName : "Tree",

    pluginName : "domx.plugins.groups.tree"
  });


  plugins.register(Tree);

  return groups.Tree = Tree;	
});