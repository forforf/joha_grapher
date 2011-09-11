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
    def get_user
      uid = session[:user_id]
      raise "No session found for user" unless uid
      user = JohaUserCache.get_user_node(uid)
      #convert strings to symbols
      p user._user_data
      if user.joha_model_names
        user.joha_model_names.each do |model_name, model_data|
          user.joha_model_names[model_name] = HashKeys.str_to_sym model_data
        end
      end
      return user
    end
  end
  
  def get_joha_model
    user = get_user
    uid = user.id
    joha_model_name = user.current_joha_model_name
    puts "Getting Joha Model"
    puts "uid: #{uid}"
    puts "model name: #{joha_model_name}"
    #check cache first
    jm = JohaModelCache.get_model(uid, joha_model_name)

    unless jm
      puts "Cache was nil, creating jm"
      tinkit_id = user.joha_model_names[joha_model_name][:tinkit_id]
      model_owner = user.joha_model_names[joha_model_name][:owner]
      tinkit_class_name = user.joha_model_names[joha_model_name][:tinkit_class_name]
      jm = JohaModel.new(joha_model_name, tinkit_class_name, model_owner, tinkit_id)
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
