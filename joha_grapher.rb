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
  
  #move to model
  def update_node(jm, node_ops)
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
    #require 'pp'
    #pp node_op_data
    combined_ops = []
    node_ops.each do |node_op_data|
      op_type = node_op_data[:op_type]
      #next unless  combine_types.include?(op_type)
      case op_type
          
        when link_ops
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

    require 'pp'
    pp link_data_holder
    puts
    pp combined_ops
    puts
    #pp node_ops
    puts "Node Ops Size Going In: #{node_ops.size}"
    #node_ops.uniq!
    puts "Node Ops Size Coming Out: #{combined_ops.size}" 
    #puts
    #pp node_ops
        
    combined_ops.each do |ops|
    
      node_id = ops[:node_id]
      #op_type = ops[:op_type]  
      tk_node = tk_class.get(node_id)
      field = ops[:field_name]
      new_data = ops[:new_data]
      orig_data = ops[:orig_data]
      
      op = ops[:op]
      puts "Op: #{op}"
      case op
        when "add"
          puts "adding #{new_data} to field: #{field} for node: #{node_id}"
          #jm.add_item(node_id, field, 
          tk_meth = "#{field}_#{op}"
          tk_data = new_data
          tk_node.__send__(tk_meth.to_sym, tk_data)
          
        when "subtract"
          puts "deleting #{orig_data} of field: #{field} of node: #{node_id}"
          tk_meth = "#{field}_#{op}"
          tk_data = orig_data
          tk_node.__send__(tk_meth.to_sym, tk_data)
        
        when "replace"
          puts "replacing #{orig_data} with #{new_data} of field: #{field} of node: #{node_id}"
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

post '/create_node' do
  #TODO: Validate against data def
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it

  
  node_id = params[:node_id]
  node_label = params[:node_label]
  node_parents = params[:node_parents].split(',')
  node_parents = ["none"] if node_parents.empty?
    
  
  node_data = {  :id => node_id,
                        :label => node_label,
                        :parents => node_parents
                    }
  
  
  @jm.create_node(node_data)
  #top_node_id = node.id
  
  @jm.refresh
  
  top_node = session[:top_node]
  #TODO: Fix the jsivt grapher and/or model so we don't have this mess
  #SO ugly my eyes burn
  ruby_graph = JSON.parse(@jm.tree_graph(top_node))
  
  ret_val = { :node => node_data,
                    :graph => ruby_graph
                }
  p ret_val[:graph]
  ret_json = ret_val.to_json
  content_type :json
  return ret_json
end

#TODO: Need to figure this out better (is it add, update, all at once, one at a time, etc)
post '/node_data_update' do
  
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  @jm = @@session[token][joha_class_name] #|| create it

  
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
    #For some reason the JSON array is parsed as a ruby hash

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
  #require 'pp'
  #pp tinkit_ops

end



post '/upload_files' do
  puts "Uploaded Files"
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  jm = @@session[token][joha_class_name]
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
  joha_class_name = session[:joha_class_name]
  jm = @@session[token][joha_class_name]

  if delete_files && delete_files.size > 0
    #TODO: Update Model (jm) rather than pass through directly
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
    tk_node.files_subtract(delete_files)
  end
  remaining_files = jm.list_attachments(node_id)
  p remaining_files
  content_type :json
  return remaining_files.to_json
end

post '/delete_node' do
  node_id = params[:node_id]
  delete_files = params[:del_files]
  token = session[:token]
  joha_class_name = session[:joha_class_name]
  jm = @@session[token][joha_class_name]
  jm.destroy_node(node_id)
  jm.refresh
  top_node = session[:top_node]
  new_graph = jm.tree_graph(top_node)
  content_type :json
  return new_graph
  #Not sure what to return
  #Probably a new graph, but that requires a bug fix first
end