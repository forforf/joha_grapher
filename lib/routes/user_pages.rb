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
  
    @@joha_model_map = {}
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
    @@joha_model_map[username] = {joha_class_name => @jm}
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
    @jm = @@joha_model_map[username][joha_class_name]  #|| create it
    redirect '/joha_graph.html'
  end
  
end