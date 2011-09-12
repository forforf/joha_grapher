#load primary routes
require_relative 'interface_testing'
require_relative 'grapher_api'
require_relative 'login'
require_relative 'new_user'
require_relative 'stitch_js'
require_relative 'user_pages'


#these are only ran (I think -- needs testing) if the ones above aren't found
#default route(s)
class JohaGrapherApp < Sinatra::Application
  
  helpers do
    def camel_case(str)
      str.gsub!(/[^a-zA-Z_\- ]/," ")
      str = " " + str.split.join(" ")
      str.gsub!(/ (.)/) { $1.upcase }
      str
    end
    
    def get_user(user=nil)
      unless user
        uid = session[:user_id]
        raise "No user id found in session for user: #{user.inspect}" unless uid
        user = UserDataStore.get(uid)
      end
      #convert strings to symbols
      if user.joha_model_ids
        user.joha_model_ids.each do |model_id, model_data|
          user.joha_model_ids[model_id] = HashKeys.str_to_sym model_data
        end
      end
      return user
    end
  end
  
  def get_joha_model(user=nil)
    user = get_user(user)
    uid = user.id
    jm_id= user.current_joha_model_id
    #check cache first
    jm = JohaModelCache.get_model(uid, jm_id)

    unless jm
      puts "Cache was nil, creating jm"
      tinkit_id = user.joha_model_ids[jm_id][:tinkit_id]
      model_owner = user.joha_model_ids[jm_id][:owner]
      tinkit_class_name = user.joha_model_ids[jm_id][:tinkit_class_name]
      jm = JohaModel.new(jm_id, tinkit_class_name, model_owner, tinkit_id)
      JohaModelCache.add_model(uid, tinkit_class_name, jm)
    end
    return jm
  end
  
  def get_tinkit_class_name
    user = get_user
    joha_model_name = user.current_joha_model_name
    joha_models = user.joha_model_names
    tinkit_class_name = joha_models[joha_model_name][:tinkit_class_name]
  end

  get '/' do
    redirect '/login'
  end
end
