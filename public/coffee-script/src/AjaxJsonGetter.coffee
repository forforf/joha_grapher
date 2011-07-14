root = exports ? this

#requires jquery

class AjaxJsonGetter
  constructor: (srcUrl, callback) ->
    @srcUrl = srcUrl
    @callback = callback

  #Will do ajax get for json data from srcUrl and
  #upon success execute callback with the json data as parameter
  getData: (params) =>
    console.log('getting data', @srcUrl, @callback)
    $j.ajax @srcUrl,
      type: 'GET'
      data: (params)
      dataType: 'json'
     
      error: (xhr, status, error) =>
        console.error(xhr, status, error)
        
      success: (data, status, xhr) =>
         @callback(data)

root.AjaxJsonGetter = AjaxJsonGetter
  
