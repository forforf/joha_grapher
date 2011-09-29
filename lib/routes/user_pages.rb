#defines the data store for holding models associated with each user
require_relative "../models/joha_model_cache"
#require_relative "../models/user_session_cache"

class JohaGrapherApp < Sinatra::Application

  #ToDo: Configure so that one can go directly to a model (and/or graph) by default (with way to return from graph screen
  get "/select_model" do 
    user = get_user
    @joha_models = user.joha_model_ids
    @base_domain_url = "/model"
    @del_link = "/delete_model"
    erb :choose_model   #sends /model/:joha_model_id
  end
    
  post '/delete_model' do
    model_id = params[:model_id]
    user = get_user
    joha_models = user.joha_model_ids
    joha_models.delete(model_id)
    user.joha_model_ids_add joha_models
    user.__save
    tinkit_id = params[:tinkit_id]
    owner = params[:owner]
    #content_type :json
    #return params.to_json
    "--- model deleted ---  was: #{model_id} - #{tinkit_id} - #{owner}"
  #remove model name from user node
  #and save
  #remove from model cache
  #go back to select domain
  end
  
  #ToDo: See if joha_model_cache can be consolidated into user data
  get '/model/:joha_model_id' do |joha_model_id|
    @jm_id = joha_model_id
    #ToDo: Is there any reason to persist the current model in storage?
    user = get_user
    user.current_joha_model_id_add joha_model_id
    jm = get_joha_model
    @orphans = jm.orphans

    #ToDo Refactor joha_model.rb to change jm.model_name to joha_model.id
    #jm.model_name is the same as joha_model_id
    @base_graph_url = "/graph/#{jm.model_name}"
    @avail_digraphs = jm.digraphs_with_roots
    #avail_size = @avail_digraphs.size
    #orph_test = @orphans.size
    #ToDo: Add back in the ability to go directly to a graph
    #orph_test = 2 if orph_test = 1 #so it will get sent correctly
    
    #case @avail_digraphs.size
    #  when 0
    #    session[:top_node] = nil
    #    redirect '/joha_graph.html'
    #  when 1
    #    top_node = @avail_digraphs.keys.first
    #    session[:top_node] = top_node
    #    redirect '/joha_graph.html'
    #  else
    #    erb :avail_digraphs
    #end
    erb :avail_digraphs
  end
  
  post '/add_parent_to_node' do
    model_id = params[:model_id]
    node_id = params[:node_id]
    new_parent = params[:parent]
    user = get_user
    jm = get_joha_model
    #update data here
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
    tk_node.parents_add new_parent
    tk_node.__save
    jm.refresh
    
    redirect "model/#{model_id}"
  end
  
  #Called when user selects a specfic digraph from erb :avail_digraphs
  get '/graph/*/*' do 
    top_node = params[:splat][1]
    session[:top_node] = top_node
    jm = get_joha_model
    redirect '/joha_graph.html'
  end
  

  #Called by 'Create New Graph' in the Joha Graph view
  #ToDo: Add to user landing page
  get '/configure_new_graph' do
    erb :configure_new_graph
  end
  
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
    #ToDo: Use model ids so that model names can be changed
    new_joha_model_name = params[:graph_name]
    new_joha_model_id = camel_case(new_joha_model_name)
    new_tinkit_id = "joha_#{user.id}_#{new_joha_model_id}"
    #model_name = "Joha#{user.id}#{new_joha_model_name}"
    new_tinkit_class_name = new_joha_model_id
    owner = user.id
    
    new_model_data = {new_joha_model_id => {:model_name => new_joha_model_name,
                                          :tinkit_class_name => new_tinkit_class_name,
                                          :owner => owner,
                                          :tinkit_id => new_tinkit_id}
                     }
    
    merged_model_data = user.joha_model_ids.merge(new_model_data)
    
    user.joha_model_ids_add merged_model_data
    user.__save
    
    redirect "/select_model"
  end  
  
end