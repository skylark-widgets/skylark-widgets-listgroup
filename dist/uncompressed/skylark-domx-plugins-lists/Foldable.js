 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){

  var Foldable = _MultitierList.inherit({
    klassName : "Foldable",

    pluginName : "domx.plugins.lists.foldable"

  });

  plugins.register(Foldable);

  return lists.Foldable = Foldable;
});
