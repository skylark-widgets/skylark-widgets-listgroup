 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){


  var Cascade = _MultitierList.inherit({
    klassName : "Tree",

    pluginName : "domx.plugins.lists.tree"
  });


  plugins.register(Cascade);

  return lists.Cascade = Cascade;	
});