#defines UserDataStore
require_relative "../models/joha_admin_store"



class JohaGrapherApp < Sinatra::Application
  get '/new_user' do
    erb :sign_up
  end

  post '/user_sign_up' do
    user_id = session[:user_id]
    
    #TODO: Remove joha_class data
    default_joha_class = {"JohaTestClass" => {:tinkit_id => "joha_test_user"}}
    default_joha_models = {"default_model" => {:tinkit_class_name => "JohaTestClass",
                                              :owner => "shared_scratch",
                                              :tinkit_id => "joha_test_user"}
                          } 
    friendly_name = params[:username]
    friendly_id = friendly_name + user_id[-4,4]
    
    new_user_data = {:id => user_id,
                     :friendly_id => friendly_id,
                     :friendly_name => friendly_name,
                     :joha_classes => default_joha_class,
                     :joha_model_names => default_joha_models,
                     :current_joha_model_name => nil}
                     
    new_user = UserDataStore.new( new_user_data )
    JohaUserCache.add_user_node(user_id, new_user)
    new_user.__save
    
    redirect "/select_model"
  end
end
