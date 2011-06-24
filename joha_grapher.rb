require 'sinatra'

use Rack::Session::Cookie
require 'rack/openid'
use Rack::OpenID

require 'uuidtools'
#require 'uri'
#require 'sinatra/reloader' #if development?
require 'joha_model'
require 'erb'

set :root, File.dirname(__FILE__)
enable :sessions

URL_NS = UUIDTools::UUID_URL_NAMESPACE
@@user_id_lookup = {} #open_id => johaGUID
@@user_data = {}
@@authed = {}  #username => auth_token
@@joha_model_map = {} #fr_id => joha_class(es) => joha_model instance (or nil)

#Test data for login testing
#After testing migrate to random GUID when persistent store exists
#me at google
TEST_GUID = "4c3e5962-f7ed-5ceb-8eb7-8bb191ef757b"
TEST_OP_ID = "https://www.google.com/accounts/o8/id?id=AItOawkivKh4QX8-Un4VkJ0cFgxYVhkishiBs8k"
@@user_id_lookup[TEST_OP_ID] = TEST_GUID

uniq_postfix = TEST_OP_ID[-5,5] #last 5 chars
fname = "dave"
fid = "#{fname}_#{uniq_postfix}"
joha_classes = { "JohaTestClass" => {:owner => "joha_test_user"},
                        "MefiMusicCharts" => {:owner => "me"}
                      }
@@user_data[TEST_GUID] = {:friendly_name => fname, 
                                          :friendly_id => fid,
                                          :joha_classes => joha_classes}


helpers do
=begin
  def protected(creds)!
    unless authorized?(creds)
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?(creds)
    check_auth(creds)
  end

  def check_auth(auth)
    check_credentials(auth)
  end

  def check_credentials(creds)
    #TODO: Check a protected secure database or something
    ok_user1 = (creds[:un] == 'joha_test_user' && creds[:pw] == 'test2')
    ok_user2 = (creds[:un] == "me" && creds[:pw] == 'mefi1')
    valid = ok_user1 || ok_user2
  end
=end

  #TODO: move to model
  def update_node(jm, node_ops)
    puts "node ops:"
    p node_ops
    
    node_id = nil
    tk_class = jm.tinkit_class
    link_ops = "link_ops"
    kvlist_ops = "kvlist_ops"
    #combine_related_ops
    #op types that combine due to complex data
    #TODO: Combining types like this kinda smells
    combine_types = [link_ops, kvlist_ops]
    link_data_holder = nil #{:orig_data => {}, :new_data => {}}
    new_link_data = {}
    kvlist_data_holder = nil #{:orig_data => {}, :new_data => {}}
    new_kvlist_data = {}
    combined_ops = []
    node_ops.each do |node_op_data|
      op_type = node_op_data[:op_type]
      #next unless  combine_types.include?(op_type)
      case op_type
          
        when link_ops
          puts "updating link data into holder:"
          link_data_holder ||= {:orig_data => {}, :new_data => {}} 
          if node_op_data[:op] =~ /_key$/
            link_data_holder[:orig_data][:key] = node_op_data[:orig_data]
            link_data_holder[:new_data][:key] = node_op_data[:new_data]
            new_link_data.merge!(node_op_data)
            new_link_data.merge!(link_data_holder)
            combined_ops << new_link_data
          else
            link_data_holder[:orig_data][:value] = node_op_data[:orig_data]
            link_data_holder[:new_data][:value] = node_op_data[:new_data]
          end
          p link_data_holder
        
        when kvlist_ops
          kvlist_data_holder ||= {:orig_data => {}, :new_data => {}} 
          if node_op_data[:op] =~ /_key$/
            kvlist_data_holder[:orig_data][:key] = node_op_data[:orig_data]
            kvlist_data_holder[:new_data][:key] = node_op_data[:new_data]
            new_kvlist_data.merge!(node_op_data)
            new_kvlist_data.merge!(kvlist_data_holder)
            combined_ops << new_kvlist_data
          else
            kvlist_data_holder[:orig_data][:value] = node_op_data[:orig_data]
            kvlist_data_holder[:new_data][:value] = node_op_data[:new_data]
          end
        
        else #case
            combined_ops << node_op_data
        #need to dig a bit deep to see whether the node_op_data is key or value
        #we then need to merge the original and new values
        #into the proper key value
      end
    end

    puts "combined ops"
    p combined_ops
    combined_ops.each do |ops|
    
      node_id = ops[:node_id]
      #op_type = ops[:op_type]  
      tk_node = tk_class.get(node_id)
      field = ops[:field_name]
      new_data = ops[:new_data]
      orig_data = ops[:orig_data]
      
      op = ops[:op]
      puts "operation:"
      p op
      case op
        when "add"
          #jm.add_item(node_id, field, 
          tk_meth = "#{field}_#{op}"
          tk_data = new_data
          tk_node.__send__(tk_meth.to_sym, tk_data)
          
        when "add_key"
          
          tk_meth = "#{field}_add"
          #TODO: Figure out if this breaks kvlist_ops
          #link key value is passed as {"old_key" => "new_value"}
          new_link_data = {new_data[:key] => new_data[:value].values}
          tk_data = new_link_data
          tk_node.__send__(tk_meth.to_sym, tk_data)
          
        when "subtract"
          tk_meth = "#{field}_#{op}"
          tk_data = orig_data
          tk_node.__send__(tk_meth.to_sym, tk_data)
        
        when "replace"
          tk_subtract = "#{field}_subtract"
          tk_subtract_data = orig_data
          tk_node.__send__(tk_subtract.to_sym, tk_subtract_data)
          tk_add = "#{field}_add"
          tk_add_data = new_data
          tk_node.__send__(tk_add.to_sym, tk_add_data)
        else
          puts "Unknown Operation"
          
      end
      #
    end

  jm.refresh
  top_node = session[:top_node]

  return jm.tree_graph(top_node)
  end
end


#To scale just limit the size of this cache
#its only kept in memory to prevent repeated 
#unnecessaryinstantiations
#the data should be in sync with the persistent store

=begin
#TestClass = "JohaTestClass"
#TestUser = "joha_test_user"
#TODO: Create Register Page
#TODO: Change to post '/login'
get '/login_old' do
  username = params['un']
  password = params['pw'] 
  #TODO: Check that username and password exist and hanlde if they don't
  user_creds = {:un => username, :pw => password}
  if check_credentials(user_creds)
    #get token
    token = "Testing"
    session[:token] = token
    @@authed[username] = token
    session[:username] = username
    
    #ToDo Assign default joha class  if none exist
    joha_class_name = case username
      when "joha_test_user"
        "JohaTestClass"
      when "me"
        "MefiMusicCharts"
      else
        raise "unknown user"
    end
    #TODO don't clobber existing classes (i.e. create public vs private)
    #Private would be classed with a user specific namespace
    #Public would be in a shared namespace (but still need permissions)
    #Currently set to public
    @@session[token] = {joha_class_name => JohaModel.new(joha_class_name, username)}
  else
   throw(:halt, [401, "Not authorized\n"])
  end
  redirect "/user/#{username}"
end
=end

get '/new_user' do
  erb :sign_up
end

get '/login' do
  redirect "/openid_login.html"
end

post '/login' do
  user_id = nil
  resp = request.env["rack.openid.response"]
    if resp = request.env["rack.openid.response"]

      if resp.status == :success
        op_id = resp.identity_url
        puts "Identity URL #{op_id}"
        
        #TODO: Make persistent
        user_id = @@user_id_lookup[op_id]
        if user_id
          puts "Found User: #{user_id}"
          user_data = @@user_data[user_id]
          puts "Name: #{user_data[:friendly_name].inspect}"
          puts "Local ID: #{user_data[:friendly_id].inspect}"
          puts "Existing Classes: #{user_data[:joha_classes].inspect}"
        else
          
          #ax = OpenID::AX::FetchResponse.from_success_response(resp)
          #email_address = ax.get_single("http://axschema.org/contact/email")
          
          #TODO: Ask if they are a new user (and if not offer the option to merge
          #assuming we can find who they are)
          
          #new user
          user_id = UUIDTools::UUID.sha1_create(URL_NS, op_id).to_s
          @@user_id_lookup[op_id] = user_id
          @@user_data[user_id] = {}
        
        puts @@user_id_lookup.inspect
        end
      else
        "Error: #{resp.status}"
      end
    else
      headers 'WWW-Authenticate' => Rack::OpenID.build_header(
        :identifier => params["openid_identifier"]
        #:required => ["http://axschema.org/contact/email"]
      )
      throw :halt, [401, 'got openid?']
    end
    
    #set session data
    session[:user_id] = user_id
    user_data = @@user_data[user_id]
    session[:friendly_name] =user_data[:friendly_name]
    friendly_id = user_data[:friendly_id]
    
    #TESTING
    #THIS NEEDS TO BE DELETED AFTER TEST
    #friendly_id = "joha_test_user"
    #TODO: create an "owner" field that is used for the joha username
    #That way other users can us (or copy) the joha model if they know the owner (and have owner permission, etc)
    #Actually, maybe have the ability to set the owner name and associate it with the class
    #The default would be friendly_id, but could be overwritten?
    
    session[:friendly_id] = friendly_id
    session[:joha_classes] = user_data[:joha_classes]
    puts session.inspect
    
    
    
    redirect "/user/#{friendly_id}"
end

get "/user/:username" do |username|
  #token = @@authed[username]
  joha_classes = session[:joha_classes] #@@session[token].keys
  case joha_classes.size
    when 1
      joha_class_name = joha_classes.first
      redirect "/user/#{username}/graph/#{joha_class_name}"
    when 0
      raise "Error assigning default joha graph"
    else
      redirect "/user/select_domain/#{username}"
  end
end 

get "/user/select_domain/:friendly_id" do |fr_id|
  #return session[:joha_classes].inspect
  @joha_classes = session[:joha_classes]
  @base_domain_url = "/user/#{fr_id}/graph"
  #@base_domain_url = "/user/joha_test_user/graph"
  erb :choose_domains
end

get '/redirect_to_graphs' do
  token = session[:token]
  username = @@authed.key(token)
  joha_class_name = session[:current_joha_class]
  redirect "/user/#{username}/graph/#{joha_class_name}"  
end

get '/user/*/graph/*' do
  username = params[:splat][0]
  joha_class_name = params[:splat][1]
  session[:current_joha_class] = joha_class_name
  class_owner = session[:joha_classes][joha_class_name][:owner]
  session[:current_owner] = class_owner
  
  #list avaialbe classes, go to next if only one class
  #username = session[:username]
  #@jm = JohaModel.new(TestClass, username)
  @jm = JohaModel.new(joha_class_name, session[:current_owner])
  #session[:current_jm] = @jm
  @@joha_model_map[username] = {joha_class_name => @jm}
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
  @jm = @@joha_model_map[username][joha_class_name]  #|| create it
  redirect '/joha_graph.html'
end

get '/index_nodes' do
  top_node = session[:top_node]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #@jm = session[:current_jm] #|| create it
  @jm = @@joha_model_map[username][joha_class_name]
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
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #@jm = session[:current_jm] #|| create it
  @jm = @@joha_model_map[username][joha_class_name]
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

post '/create_node' do
  #TODO: Validate against data def
  token = session[:token]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #@jm = @@session[token][joha_class_name] #|| create it
  #@jm = session[:current_jm]
  @jm = @@joha_model_map[username][joha_class_name]

  
  node_id = params[:node_id]
  node_label = params[:node_label]
  node_parents = params[:node_parents].split(',')
  node_parents = ["none"] if node_parents.empty?
    
  
  node_data = {  :id => node_id,
                        :label => node_label,
                        :parents => node_parents
                    }
  
  
  @jm.create_node(node_data)
  @jm.refresh
  
  top_node = session[:top_node]
  #TODO: Fix the jsivt grapher and/or model so we don't have this mess
  #SO ugly my eyes burn (we're changing JSON to ruby to change back to JSON)
  ruby_graph = JSON.parse(@jm.tree_graph(top_node))
  
  ret_val = { :node => node_data,
                    :graph => ruby_graph
                }
  p ret_val[:graph]
  ret_json = ret_val.to_json
  content_type :json
  return ret_json
end

#TODO: See if this can be simplified
post '/node_data_update' do
  
  token = session[:token]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #@jm = @@session[token][joha_class_name] #|| create it
  #@jm = session[:current_jm]
  @jm = @@joha_model_map[username][joha_class_name] #or create it
  
  #process the data to get the operational data
  #magic names (TODO: move to configuration or something)
  op_type_key = "op_type"
  op_list_key = "op_list"
  orig_val = "orig_val"
  new_val = "new_val"
  
  tinkit_ops = []
 
  node_id = params.keys.first
  field_names = params[node_id].keys
  current_root_node_id = params[:root]
  
  #a null (from javascript) is sneaking in
  field_names.map!{|f| f=="null" ? nil : f}
  field_names.compact!
  
  
  field_names.each do |field|
    
    pre_field_ops = params[node_id][field][op_list_key]
    op_type = params[node_id][field][op_type_key]

    pre_field_ops.each do |op_idx, op|
      actions = op.keys
      action = actions.first #should only be one
      orig_data = op[action][orig_val]
      new_data = op[action][new_val]
      tinkit_ops.push({:node_id => node_id,
                             :field_name => field,
                             :op_type => op_type,
                             :op => action,
                             :op_index => op_idx,
                             :orig_data => orig_data,
                             :new_data => new_data
                            })
    end
  end
  
  new_graph =  update_node(@jm, tinkit_ops)
  content_type :json
  return new_graph
end



post '/upload_files' do
  puts "Uploaded Files"
  token = session[:token]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #jm = @@session[token][joha_class_name]
  #jm = session[:current_jm]
  jm = @@joha_model_map[username][joha_class_name] # or create it
  node_id = params[:node_id]
  tk_class = jm.tinkit_class
  tk_node = tk_class.get(node_id)
  uploaded_files = params[:add_files]
  puts "#: #{uploaded_files.size}"
  uploaded_files.each do |upload_file|
    p upload_file[:node_id]
    p upload_file[:tempfile]
    p upload_file[:filename]
  
    user_dir = token
    tmp_file = upload_file[:tempfile]
    src_filename = upload_file[:filename]
    #TODO Fix tinkit so that a new filename can be assigned
    # rather than using the existing filename
    new_file_dir = "/tmp/#{user_dir.hash}"
    new_file_loc = "/#{new_file_dir}/#{src_filename}"
    if File.exist?(new_file_dir)
      FileUtils.cp(tmp_file, new_file_loc)
    else
      FileUtils.mkdir(new_file_dir)
      FileUtils.cp(tmp_file, new_file_loc)
    end
    FileUtils.rm(tmp_file)
    
    
    add_file_data = {:src_filename => new_file_loc}
    tk_node.files_add(add_file_data)
  end
  
  content_type :json
  return jm.list_attachments(node_id)
end

post '/post_test' do
  content_type :json
  return params.to_json
end

post '/delete_files' do
  node_id = params[:node_id]
  delete_files = params[:del_files]
  token = session[:token]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #jm = @@session[token][joha_class_name]
  #jm = session[:current_jm]
  jm = @@joha_model_map[username][joha_class_name] #or create it

  if delete_files && delete_files.size > 0
    #TODO: Update Model (jm) rather than pass through to tinkit directly
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
    tk_node.files_subtract(delete_files)
  end
  remaining_files = jm.list_attachments(node_id)
  content_type :json
  return remaining_files.to_json
end

post '/delete_node' do
  node_id = params[:node_id]
  delete_files = params[:del_files]
  token = session[:token]
  username = session[:friendly_id]
  joha_class_name = session[:joha_class_name]
  #jm = @@session[token][joha_class_name]
  #jm = session[:current_jm]
  jm = @@joha_model_map[username][joha_class_name] #or create it
  jm.destroy_node(node_id)
  jm.refresh
  top_node = session[:top_node]
  new_graph = jm.tree_graph(top_node)
  content_type :json
  return new_graph
end