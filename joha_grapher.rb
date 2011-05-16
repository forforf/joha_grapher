require 'sinatra'
#require 'sinatra/reloader' #if development?
require 'joha_model'
require 'erb'

set :root, File.dirname(__FILE__)
enable :sessions


@@authed = {}  #username => auth_token
@@session = {} #auth_token => joha_class(es) => joha_model instance (or nil)

helpers do

  def protected(creds)!
    unless authorized?(creds)
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?(creds)
    #@auth ||=  Rack::Auth::Basic::Request.new(request.env)
    #@auth.provided? && @auth.basic? && @auth.credentials && @auth.credentials == ['admin', 'admin']
    check_auth(creds)
  end

  def check_auth(auth)
    #auth.provided? && auth.basic? && check_credentials(auth.credentials)
    check_credentials(auth)
  end

  def check_credentials(creds)
    #TODO: Check a protected secure database or something
    ok_user1 = (creds[:un] == 'joha_test_user' && creds[:pw] == 'test2')
    ok_user2 = (creds[:un] == "me" && creds[:pw] == 'mefi1')
    valid = ok_user1 || ok_user2
  end
end


#T)s scale just limit the size of this cache
#its only kept in memory to prevent repeated 
#u nnecessaryinstantiations
#the data should be in sync with the persistent store

#TestClass = "JohaTestClass"
#TestUser = "joha_test_user"
#TODO: Create Register Page
#TODO: Change to post '/login'
get '/login' do
  username = params['un']
  password = params['pw'] 
  #TODO: Check that username and password exist and hanlde if they don't
  user_creds = {:un => username, :pw => password}
  if check_credentials(user_creds)
    #get token
    token = "Testing"
    session[:token] = token
    session[:username] = username
    @@authed[username] = token
    #ToDo Assign default joha class  if none exist
    joha_class_name = case username
      when "joha_test_user"
        "JohaTestClass"
      when "me"
        "MefiMusicCharts"
      else
        raise "unknown user"
    end
    #TODO don't clobber existing classes
    @@session[token] = {joha_class_name => JohaModel.new(joha_class_name, username)}
  else
   throw(:halt, [401, "Not authorized\n"])
  end
  redirect "/user/#{username}"
end

get "/user/:username" do |username|
  token = @@authed[username]
  joha_classes = @@session[token].keys
  case joha_classes.size
    when 1
      joha_class_name = joha_classes.first
      redirect "/user/#{username}/graph/#{joha_class_name}"
    when 0
      raise "Error assigning default joha graph"
    else
      redirect "/user/#{username}/select_domain"
  end
  
end

get '/user/*/graph/*' do
  username = params[:splat][0]
  joha_class_name = params[:splat][1]
  token = session[:token]
  #list avaialbe classes, go to next if only on class
  #username = session[:username]
  #@jm = JohaModel.new(TestClass, username)
  @jm = @@session[token][joha_class_name]#TODO or make new 
  @base_graph_url = "/graph/#{username}/#{joha_class_name}"
  @avail_digraphs = @jm.digraphs_with_roots
  erb :avail_digraphs
end

get '/graph/*/*/*' do 
  username = params[:splat][0]
  joha_class_name = params[:splat][1]
  @top_node = params[:splat][2]
  session[:top_node] = @top_node
  session[:joha_class_name] = joha_class_name
  token = session[:token]
  @jm = @@session[token][joha_class_name] #|| create it
  redirect '/joha_graph.html'
end

get '/index_nodes' do
  top_node = session[:top_node]
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it
  content_type :json
  ret_json = @jm.tree_graph(top_node)
end

get '/data_definition' do
  basic_data_def = JohaModel::JohaDataDefn
  file_data_def = {:attached_files => :file_ops}
  data_def = file_data_def.merge(basic_data_def)
  content_type :json
  data_def.to_json
end

post '/desc_data' do
  top_node = session[:top_node]
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it
  node_id = params[:node_id]
  field = params[:node_data_type]
  raise "no node id" unless node_id
  @desc_data =  @jm.find_all_descendant_data(node_id, field)
  case field
    when 'attached_files'
      erb :descendant_attached_files
    when 'links'
      erb :descendant_links
    else
      erb :descendant_data
  end
end

get '/create_node' do
  #top_node = session[:top_node]
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it

  content_type :json
  node_data = params[:node_data]
  #@jm.create_node(node_data)
  #top_node_id = node.id
  #ret_json = @jm.tree_graph(top_node_id)
end

#TODO: Need to figure this out better (is it add, update, all at once, one at a time, etc)
post '/node_data_update' do
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it
  new_data = params[:value]
  orig_data = params[:orig_value]
  node_id = params[:node_id]
  node_field = params[:node_field]
  key_data = params[:key_for_value]
  if key_data
    puts "Do kvlist manipulation here"
  end
  
  #TODO move to the model
  #update = subtract then add
  field_subtract_meth = "#{node_field}_subtract".to_sym
  field_add_meth = "#{node_field}_add".to_sym
  node = @jm.select_node(node_id)
  node.__send__(field_subtract_meth, orig_data)
  node.__send__(field_add_meth, new_data)
  node.__save
  puts "Node Saved #{node.id}: #{node_field}: #{new_data}"
  puts "#{node._user_data}"
  new_data
end
