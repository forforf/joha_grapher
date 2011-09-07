#defines UserDataStore
require_relative "../models/joha_admin_store"



class JohaGrapherApp < Sinatra::Application
  get '/new_user' do
    erb :sign_up
  end

  post '/user_sign_up' do
    user_id = session[:user_id]
    #Test to see if we need uniq friendly ids (I don't think so)
    #so fid and friendly_name are currently equal
    
    default_joha_class = {"JohaTestClass" => {:owner => "joha_test_user"}}
    fid = params[:fid]
    new_user_data = {:id => user_id,
                     :friendly_id => fid,
                     :friendly_name => fid,
                     :joha_classes => default_joha_class}
    new_user = UserDataStore.new( new_user_data )
    new_user.__save
    
    session[:joha_classes] = new_user.joha_classes
    session[:friendly_id] = new_user.friendly_id
    friendly_id = session[:friendly_name] = new_user.friendly_name
    session[:stored] = true
    redirect "/user/#{friendly_id}"
  end
end
