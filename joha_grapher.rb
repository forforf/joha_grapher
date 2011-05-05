require 'sinatra'
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
    un_pw_ok = (creds[:un] == 'joha_test_user' && creds[:pw] == 'test2')
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
    joha_class_name = "JohaTestClass"
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
  redirect '/bufs_graph.html'
end

get '/index_nodes' do
  top_node = session[:top_node]
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it
  content_type :json
  ret_json = @jm.tree_graph(top_node)
end
