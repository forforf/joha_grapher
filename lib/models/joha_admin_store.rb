#Persistent Storage for User Data
module JohaAdminStore
  WebAdminCouchDB = CouchRest.database!("http://127.0.0.1:5984/joha_web_app/")  

                    
  UserDataDefn = {:id => :static_ops,
                  :friendly_name => :replace_ops,
                  :friendly_id => :replace_ops,
                  :joha_classes => :replace_ops} #joha_classes should actually be :key_key_ops if it existed  
  
  def self.make_id_map_class(id_map_class_name)
    id_map_defn = {:id => :static_ops,
                   :uid => :replace_ops}

    id_map_env = TinkitNodeFactory.env_formatter("couchrest",
                                                   id_map_class_name,
                                                   "JohaUser",
                                                   WebAdminCouchDB.uri,
                                                   WebAdminCouchDB.host)
                                                   
    #hack until formatter is fixed
    id_map_env[:data_model][:field_op_set] = id_map_defn
                                                   
    id_map_class = TinkitNodeFactory.make(id_map_env)
  end
  
  def self.make_user_data_class(user_data_class_name)
    user_data_defn = {:id => :static_ops,
                  :friendly_name => :replace_ops,
                  :friendly_id => :replace_ops,
                  :joha_classes => :replace_ops} #joha_classes should actually be :key_key_ops if it existed
    
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

