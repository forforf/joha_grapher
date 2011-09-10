
#a namespaced hash map to hold the
#user data associated with given uid
module JohaUserCache
  @store = {}  #initialized when server is reset
  class << self
    attr_accessor :store
  end
  
  def self.add_user_node(uid, user_tinkit_node)
    self.store[uid] = user_tinkit_node
    #self.store[user][model_name] ||= model_name
    #self.store[user][model_name] = model
  end
  
  def self.get_user_node(uid)
    self.store[uid]
  end
end