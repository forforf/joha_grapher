
#just a namespaced hash map to hold the
#graphs associated with given users
module JohaModelCache
  @store = {}  #initialized when server is reset
  class << self
    attr_accessor :store
  end
  
  def self.add_model(user, model_name, model)
    self.store[user] ||= {}
    self.store[user][model_name] ||= model_name
    self.store[user][model_name] = model
  end
  
  def self.get_model(user, model_name)
    self.store[user][model_name]
  end
end