#Persistent Storage for User Data

# Persistence Class Creator
module JohaAdminStore
  CouchDbPath = "http://#{JohaGrapher::CouchDbHost}:5984/joha_web_app/" 
  #WebAdminCouchDB = CouchRest.database!("http://127.0.0.1:5984/joha_web_app/")  
  WebAdminCouchDB = CouchRest.database!(CouchDbPath)

  def self.make_user_data_class(user_data_class_name)
    user_data_defn = {:id => :static_ops,
                      :friendly_name => :replace_ops,
                      :friendly_id => :replace_ops,
                      #deprecated :joha_classes => :replace_ops, #joha_classes should actually be :key_key_ops if it existed
                      :joha_model_ids => :replace_ops, #should be :key_replace_ops if it existed
                      :current_joha_model_id => :replace_ops}
                      #:persisted => :replace_ops } #should be :boolean if it existed
    
    user_data_env = TinkitNodeFactory.env_formatter("couchrest",
                                                   user_data_class_name,
                                                   "JohaUser",
                                                   WebAdminCouchDB.uri,
                                                   WebAdminCouchDB.host)         
    
    #hack until formatter is fixed
    user_data_env[:data_model][:field_op_set] = user_data_defn
    user_data_class = TinkitNodeFactory.make(user_data_env)
  end
end

#Tinkit Classes for persistant storage of user configuration data
UserDataStore = JohaAdminStore.make_user_data_class("UserDataStore")
