#defines the data store for holding models associated with each user
require_relative "../models/joha_model_cache"
require_relative "../models/user_session_cache"

class JohaGrapherApp < Sinatra::Application

  #Flow
  #example data
  #session[:friendly_id] -> username -> dave
  #session[:joha_classes] one of is -> joha_class_name -> my_joha
  
  
  # /user/dave
  # sends directly to graph if there is only one tinkit
  #   format /user/dave/graph/my_joha
  # otherwise let user choose the tinkit
  
  # /user/select_domain/dave
  # choose the tinkit
  # return format /user/dave/graph/my_joha
  
  #user/dave/graph/my_joha
  #TODO: Change class_owner to tinkit_id

  helpers do
    def get_user
      uid = session[:user_id]
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
  
  get "/user/:username" do |username|
    #joha_classes = session[:joha_classes] 
    #joha_models = session[:joha_models]
    puts "Does fid == username?"
    puts "username: #[username]"
    user = get_user
    puts "fid: #{user.friendly_id}"
    joha_model_names = user.joha_model_names
    #case joha_classes.size
    case joha_model_names.size
      when 1
        #joha_class_name = joha_classes.keys.first
        joha_model_name = user.joha_model_names.keys.first
        #p user.joha_model_names.keys
        #p joha_model_name
        #tinkit_class_name = joha_model_names[joha_model_name][:tinkit_class_name]
        #user.friendly_name_add "add_test_to_friendly_name"
        #user.current_joha_model_name_add "test"
        user.current_joha_model_name_add joha_model_name
        #session[:joha_class_name] = joha_class_name
        #session[:tinkit_class_name] = tinkit_class_name
        #session[:joha_model_name] = joha_model_name
        #fid = session[:friendly_id]
        fid = user.friendly_id
        #tinkit_class_name = user.current_tinkit_class_name
        #redirect "/user/#{fid}/graph/#{joha_class_name}"
        redirect "/user/#{fid}/graph/#{joha_model_name}"
      when 0
        raise "Error assigning default joha graph"
      else
        redirect "/user/select_domain/#{username}"
    end
  end 
  
  get "/user/select_domain/:friendly_id" do |fr_id|
    #@joha_classes = session[:joha_classes]
    user = get_user
    #@joha_models = session[:joha_models]
    @joha_models = user.joha_model_names
    @base_domain_url = "/user/#{fr_id}/graph"
    erb :choose_domains   #sends to /user/fr_id/graph/model_name
  end
  
    #@@joha_model_map = {}
    
  get '/user/*/graph/*' do
    username = params[:splat][0]
    puts "fid and username part 2"
    puts "/user/*/graph/* username: #{username}"
    #joha_class_name = params[:splat][1]
    joha_model_name = params[:splat][1]
    user = get_user
    puts "Friednly id: #{user.friendly_id}"
    user.current_joha_model_name_add params[:splat][1]
    
    #session[:current_joha_class] = joha_class_name
    #session[:current_joha_model] = joha_model_name
    #tinkit_id = class_owner = session[:joha_classes][joha_class_name]["owner"]
    #tinkit_id = class_owner = session[:joha_classes][joha_class_name][:tinkit_id]
    #ToDo: Can joha_model_name be removed from session?
    #raise "Model name mismatch, session corrupted? \n #{session.inspect}" unless joha_model_name == session[joha_model_name]
    #tinkit_class_name = session[:tinkit_class_name]
    #tinkit_id = session[:joha_models][joha_model_name][:tinkit_id]
    p joha_model_name
    p user.joha_model_names
    p tinkit_class_name = user.joha_model_names[joha_model_name][:tinkit_class_name]
    p tinkit_id = user.joha_model_names[joha_model_name][:tinkit_id]
    p model_owner = user.joha_model_names[joha_model_name][:owner]
    #model_owner = session[:joha_models][joha_model_name][:tinkit_id]
    raise "tinkit_id not set correctly for session:\n #{session.inspect}" unless tinkit_id
    #session[:tinkit_id] = tinkit_id #session[:current_owner] = class_owner
    
    #@jm = JohaModel.new(joha_class_name, session[:current_owner], session[:current_owner])
    #@jm = JohaModel.new(joha_class_name, username, tinkit_id)
    puts "Tinkit Class Name: #{tinkit_class_name}"
    puts "Owner: #{model_owner}"
    puts "tinkit id: #{tinkit_id}"
    user_datastore_id = model_owner
    @jm = JohaModel.new(tinkit_class_name, user_datastore_id, tinkit_id)
    p @jm
    #@@joha_model_map[username] = {joha_class_name => @jm}
    
    JohaModelCache.add_model(username, tinkit_class_name, @jm)
    
    @base_graph_url = "/graph/#{username}/#{joha_model_name}"

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
  
  get '/graph/*/*/*' do 
    username = params[:splat][0]
    joha_class_name = params[:splat][1]
    @top_node = params[:splat][2]
    session[:top_node] = @top_node
    #session[:joha_class_name] = joha_class_name
    
    #token = session[:token]
    #@jm = @@joha_model_map[username][joha_class_name]  #|| create it
    @jm = JohaModelCache.get_model(username, joha_class_name)
    redirect '/joha_graph.html'
  end
  

  #Called by 'Create New Graph' in the Joha Graph view
  #ToDo: Add to user landing page
  get '/configure_new_graph' do
    erb :configure_new_graph
  end
  #TODO: FIX FOR NEW joha model arch
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