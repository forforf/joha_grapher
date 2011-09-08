#defines the data store for holding models associated with each user
require_relative "../models/joha_model_cache"

class JohaGrapherApp < Sinatra::Application

  #user related class variable
#  @@joha_model_map = {}
  get "/user/:username" do |username|
    joha_classes = session[:joha_classes] 
    case joha_classes.size
      when 1
        joha_class_name = joha_classes.keys.first
        session[:joha_class_name] = joha_class_name
        fid = session[:friendly_id]
        redirect "/user/#{fid}/graph/#{joha_class_name}"
      when 0
        raise "Error assigning default joha graph"
      else
        redirect "/user/select_domain/#{username}"
    end
  end 
  
  get "/user/select_domain/:friendly_id" do |fr_id|
    @joha_classes = session[:joha_classes]
    @base_domain_url = "/user/#{fr_id}/graph"
    erb :choose_domains
  end
  
    #@@joha_model_map = {}
    
  get '/user/*/graph/*' do
    username = params[:splat][0]
    joha_class_name = params[:splat][1]
    session[:current_joha_class] = joha_class_name
    #ToDo: Fix the mixture of strings and symbols
    class_owner = session[:joha_classes][joha_class_name]["owner"]
    
    session[:current_owner] = class_owner
    
    #list avaialbe classes, go to next if only one class
    #username = session[:username]
    #@jm = JohaModel.new(TestClass, username)
    
    @jm = JohaModel.new(joha_class_name, session[:current_owner])
    #@@joha_model_map[username] = {joha_class_name => @jm}
    JohaModelCache.add_model(username, joha_class_name, @jm)
    @base_graph_url = "/graph/#{username}/#{joha_class_name}"

    @avail_digraphs = @jm.digraphs_with_roots
    case @avail_digraphs.size
      when 0
        #for 0 session[:top_node] should be nil (do this explicitly?)
        session[:top_node] = nil
        redirect '/joha_graph.html'
      when 1
        top_node = @avail_digraphs.keys.first
        session[:top_node] = top_node
        redirect '/joha_graph.html'
      else
        erb :avail_digraphs
    #if no nodes or only one digraph {@base_graph_url}/#{top_node}
    end
  end
  
  #called by avail_digraphs view
  get '/graph/*/*/*' do 
    username = params[:splat][0]
    joha_class_name = params[:splat][1]
    @top_node = params[:splat][2]
    session[:top_node] = @top_node
    session[:joha_class_name] = joha_class_name
    
    token = session[:token]
    #@jm = @@joha_model_map[username][joha_class_name]  #|| create it
    @jm = JohaModelCache.get_model(username, joha_class_name)
    redirect '/joha_graph.html'
  end
  
  #Called by 'Create New Graph' in the Joha Graph view
  #ToDo: Add to user landing page
  get '/configure_new_graph' do
    erb :configure_new_graph
  end

  post '/create_new_graph' do
    #TODO: People can overwrite other peoples graphs right now
    #Note that a new graph will not erase an older one, just use it.
    joha_class_name = params[:graph_name]
    joha_tinkit_id = params[:graph_id]
    new_joha_class_data = {joha_class_name => {:owner => joha_tinkit_id}}
    puts "new joha class data"
    p new_joha_class_data
    user_id = session[:user_id]
    p user_id
    user_data = UserDataStore.get(user_id)
    #This is where a defined data operation for joha_classes would have come in handy
    user_joha_classes = user_data.joha_classes
    merged_joha_classes = user_joha_classes.merge(new_joha_class_data)
    user_data.joha_classes_add merged_joha_classes
    #@@user_data[user_id][:joha_classes].merge!(new_joha_class_data)
    #puts "User Data"
    #p @@user_data
    #session[:joha_classes] = @@user_data[user_id][:joha_classes]
    session[:joha_classes] = user_data.joha_classes
    username = session[:friendly_id]
    redirect "/user/#{username}/graph/#{joha_class_name}"
  end  
  
end