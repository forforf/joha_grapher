#defines the data store for holding models associated with each user
require_relative "../models/joha_model_cache"
require_relative "../models/user_session_cache"

class JohaGrapherApp < Sinatra::Application

  #Flow
 
  # /user/dave
  # sends directly to graph if there is only one tinkit
  #   format /user/dave/graph/my_joha
  # otherwise let user choose the tinkit
  
  # /user/select_domain/dave
  # choose the tinkit
  # return format /user/dave/graph/my_joha
  
  #user/dave/graph/my_joha
  #TODO: Change class_owner to tinkit_id


  #ToDo: Configure so that one can go directly to a model (and/or graph) by default (with way to return from graph screen
  get "/select_model" do 
    user = get_user
    #fr_id = user.friendly_id
    @joha_models = user.joha_model_names
    #@base_domain_url = "/user/#{fr_id}/graph"
    @base_domain_url = "/model"
    erb :choose_model   #sends /model/:joha_model_name
  end
    
  post '/delete_model' do
  #remove model name from user node
  #and save
  #remove from model cache
  #go back to select domain
  end
  
  #ToDo: See if joha_model_cache can be consolidated into user data
  get '/model/:joha_model_name' do |joha_model_name|
    #Set the current model (in memory)
    #ToDo: Is there any reason to persist the current model in storage?
    user = get_user
    user.current_joha_model_name_add joha_model_name
    #username = params[:splat][0]
    #joha_model_name = params[:splat][1]
    #user = get_user
    #uid = user.id
    #username = user.friendly_id
    #user.current_joha_model_name_add joha_model_name #params[:splat][1]
    #tinkit_class_name = user.joha_model_names[joha_model_name][:tinkit_class_name]
    #tinkit_id = user.joha_model_names[joha_model_name][:tinkit_id]
    #model_owner = user.joha_model_names[joha_model_name][:owner]
   
    #raise "tinkit_id not set correctly for session:\n #{session.inspect}" unless tinkit_id
    #user_datastore_id = model_owner
    #jm = JohaModel.new(tinkit_class_name, user_datastore_id, tinkit_id)
    #JohaModelCache.add_model(uid, tinkit_class_name, jm)
    jm = get_joha_model
    @base_graph_url = "/graph/#{jm.model_name}"
    #this isn't really that intensive comparatively
    @avail_digraphs = jm.digraphs_with_roots
    puts "Avail Digraphs"
    puts "Size: #{@avail_digraphs.size}"
    @avail_digraphs.each do |graph|
      puts "  GRAPH"
      p graph
    end
    case @avail_digraphs.size
      when 0
        session[:top_node] = nil
        redirect '/joha_graph.html'
      when 1
        top_node = @avail_digraphs.keys.first
        session[:top_node] = top_node
        redirect '/joha_graph.html'
      else
        erb :avail_digraphs
    end
  end
  
  #Called when user selects a specfic digraph from erb :avail_digraphs
  get '/graph/*/*' do 
    #user = get_user
    #username = params[:splat][0]
    #username = user.friendly_id
    #joha_class_name = params[:splat][0]
    #@top_node = params[:splat][1]
    top_node = params[:splat][1]
    session[:top_node] = top_node
    #@jm = JohaModelCache.get_model(user.id, joha_class_name)
    jm = get_joha_model
    redirect '/joha_graph.html'
  end
  

  #Called by 'Create New Graph' in the Joha Graph view
  #ToDo: Add to user landing page
  get '/configure_new_graph' do
    erb :configure_new_graph
  end
  #TODO: FIX FOR NEW joha model arch
  
   post '/add_new_model' do
  #get model name
  #get tinkit class name (user + model name)?
  #get tinkit_id: (user + model name)?
  #get owner
  #add to user node (and save)
  #go back to select domain
  end
  
  post '/create_new_graph' do
    user = get_user
    #TODO: People can overwrite other peoples graphs right now
    #Note that a new graph will not erase an older one, just use it.
    #ToDo: Use model ids so that model names can be changed
    new_joha_model_name = params[:graph_name]
    #new_tinkit_id = params[:graph_id]
    new_tinkit_id = "joha_#{user.id}_#{new_joha_model_name}"
    new_tinkit_class_name = "Joha#{user.id}#{new_joha_model_name}"
    owner = user.id
    
    new_model_data = {new_joha_model_name => {:tinkit_class_name => new_tinkit_class_name,
                                          :owner => owner,
                                          :tinkit_id => new_tinkit_id}
                     }
    
    merged_model_data = user.joha_model_names.merge(new_model_data)
    
    user.joha_model_names_add merged_model_data
    user.__save
    
    #puts "new joha class data"
    #p new_joha_class_data
    #user_id = session[:user_id]
    #p user_id
    #user_data = UserDataStore.get(user_id)
    #This is where a defined data operation for joha_classes would have come in handy
    #user_joha_classes = user_data.joha_classes
    #merged_joha_classes = user_joha_classes.merge(new_joha_class_data)
    #user_data.joha_classes_add merged_joha_classes
    #@@user_data[user_id][:joha_classes].merge!(new_joha_class_data)
    #puts "User Data"
    #p @@user_data
    #session[:joha_classes] = @@user_data[user_id][:joha_classes]
    #session[:joha_classes] = user_data.joha_classes
    #username = session[:friendly_id]
    redirect "/select_model"
  end  
  
end