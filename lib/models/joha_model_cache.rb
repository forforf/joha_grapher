
#just a namespaced hash map to hold the
#graphs associated with given users
module JohaModelCache
  @store = {}  #initialized when server is reset
  class << self
    attr_accessor :store
  end
  
  def self.add_model(uid, model_name, model)
    raise "Invalid UID: #{uid}" unless uid.length == 32
    self.store[uid] ||= {}
    self.store[uid][model_name] ||= model_name
    self.store[uid][model_name] = model
  end
  
  def self.get_model(uid, model_name)
    rtn_val = if self.store && self.store[uid]
      self.store[uid][model_name]
    else
      nil
    end
    return rtn_val
  end
end