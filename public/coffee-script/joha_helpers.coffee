#I know its bad practice to have everything at the global level
#but I'm porting from previous code where javascript made it easy
#to do bad things like this.  It will get cleaned up at some point

window.get_keys = (obj) -> keys = key for own key of obj

window.get_values = (obj) -> 
  for own key,val of obj
    obj[key]

window.deep_equiv = (obj1, obj2) ->
  str_obj1 = JSON.stringify(obj1)
  str_obj2 = JSON.stringify(obj2)
  str_obj1 is str_obj2    
  
window.equiv = (obj1, obj2) ->
  if obj1 is obj2
    return true
  else 
    if deep_equiv(obj1, obj2)
      return true
  false
    
window.array_contains = (a, obj) ->
  for item in a
    if equiv item,obj
      return true
  false

window.array_remove_item = (a, obj) ->
  for item in a
    if item is obj
     idx = a.indexOf obj
     a.splice idx, 1
  a
  
window.array_contains_all = (a, subset) ->
  retVal = true
  for item in subset
    unless array_contains a, item
      retVal = false
  retVal 

window.obj_key_position = (obj, key) ->
  i = 0
  for k of obj
    if deep_equiv(k, key)
      return i
    i += 1
  return undefined  
  
window.objSize = (obj) ->
  size = 0
  for own key of obj
    size++
  size

window.isjQueryObject = (obj) ->
  #TODO use native coffeescript
  `obj instanceof jQuery`

window.makejQueryObj = (obj) -> 
  if isjQueryObject obj
    return obj
  else
    return `jQuery(obj)`
    


window.filterJohaData = (jQSelector) ->
  johaData = `jQuery(jQSelector).map(function() {
    var filterData = {};
    console.log('filtering Joha data');
    console.log(this.id);
    console.log(jQuery(this).data());
    
    //filter so we only get johaData keys
    var allData = jQuery(this).data();
    var allKeys = get_keys(allData);
    var johaKeys = allKeys.filter(function(i){
      if (i.split("__")[0] == "johaData"){
        return i
      }
    });
    for (var i in johaKeys) {
      thisKey = johaKeys[i];
      filterData[thisKey] = allData[thisKey];
    };
    
    return filterData;
  }).get();`
    
