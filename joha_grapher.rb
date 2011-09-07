#$LOAD_PATH << File.expand_path( File.dirname(__FILE__) )
#require 'sinatra'

class JohaGrapherApp < Sinatra::Application
  use Rack::Session::Cookie
  require 'rack/openid'
  use Rack::OpenID

  set :root, File.dirname(__FILE__)
  enable :sessions

  
  require_relative "lib/routes/init_routes"
  #models are called by the code depeding on them
  #require_relative "lib/models/init"
=begin
  #used for creating admin data stores
  #Open ID to User ID map and User Data (friendlier names and id)
  require 'lib/joha_admin_store'



  #create data stores

  URL_NS = UUIDTools::UUID_URL_NAMESPACE
  @@user_id_lookup = {} #open_id => johaGUID
  #@@user_id_lookup2 = CouchRest.database!("http://127.0.0.1:5984/joha_user_id_lookup/")
  @@user_data = {}
  #@@user_data2 = CouchRest.database!("http://127.0.0.1:5984/joha_user_web_data/")
  @@authed = {}  #username => auth_token
  @@joha_model_map = {} #fr_id => joha_class(es) => joha_model instance (or nil)

  #Test data for login testing
  #After testing migrate to random GUID when persistent store exists
  #me at google

  TEST_OP_ID = "https://www.google.com/accounts/o8/id?id=AItOawkivKh4QX8-Un4VkJ0cFgxYVhkishiBs8k"
  SALT = "958KBC"
  TEST_GUID = Digest::MD5.hexdigest(SALT+TEST_OP_ID)
  #TEST_GUID = "4c3e5962-f7ed-5ceb-8eb7-8bb191ef757b"
  @@user_id_lookup[TEST_OP_ID] = TEST_GUID
  #@@user_id_lookup2.save_doc({'_id' => TEST_OP_ID, 'guid' => TEST_GUID})
  #Create Test User in OpenIdGuidEnv
  IdMapStore = JohaAdminStore.make_id_map_class("IdMapStore")
  test_user_id_map = IdMapStore.new( {:id => TEST_OP_ID, :uid => TEST_GUID} )
  test_user_id_map.__save




  uniq_postfix = TEST_OP_ID[-5,5] #last 5 chars
  fname = "dave"
  #fid = "#{fname}_#{uniq_postfix}"
  fid = "dave"
  joha_classes = { "JohaTestClass" => {:owner => "joha_test_user"},
                          "MefiMusicCharts" => {:owner => "me"}
                        }
  @@user_data[TEST_GUID] = {:friendly_name => fname, 
                                            :friendly_id => fid,
                                            :joha_classes => joha_classes}

  #@@user_data2.save_doc({'_id' => TEST_GUID, :friendly_name => fname, :friendly_id => fid, :joha_classes => joha_classes})
  UserDataStore = JohaAdminStore.make_user_data_class("UserDataStore")
  test_user_data = UserDataStore.new( {:id => TEST_GUID, :friendly_name => fname, :friendly_id => fid, :joha_classes => joha_classes} )
  test_user_data.__save

  helpers do


  end


  #To scale just limit the size of this cache
  #its only kept in memory to prevent repeated 
  #unnecessaryinstantiations
  #the data should be in sync with the persistent store
=end
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

  #Dynamically load in coffee script modules (commonJS format)
  get '/application.js' do
    #compiles on the fly for development,  move to config.ru for static compiling for staging
    content_type 'text/javascript'
    Stitch::Package.new(:paths => ["stitch/coffeescripts"], :dependencies => []).compile
  end

  get '/' do
    redirect '/login'
  end

  #TODO: Need to fix bug where if user has a session but hasn't signed up, they will be redirected to the graph as a nil user
  get '/new_user' do
    erb :sign_up
  end

  post '/user_sign_up' do
    p params
    user_id = session[:user_id]
    p user_id
    p @@user_data[user_id]
    puts "---"
    #Testing to see if we need uniq friendly ids (I don't think so)
    #so fid and friendly_name are currently equal
    default_joha_class = {"JohaTestClass" => {:owner => "joha_test_user"}}
    fid = params[:fid]
    @@user_data[user_id] ||= {}
    @@user_data[user_id][:friendly_id] = params[:fid]
    @@user_data[user_id][:friendly_name] = params[:fid]
    @@user_data[user_id][:joha_classes] = default_joha_class
    session[:joha_classes] = default_joha_class
    session[:friendly_id] = params[:fid]
    session[:friendly_name] =params[:fid]
    p @@user_data[user_id]
    user_data = @@user_data[user_id]
    friendly_id = user_data[:friendly_id]
    redirect "/user/#{friendly_id}"
  end
=begin
  get '/login' do
    redirect "/openid_login.html"
  end

  #From login form 
  post '/login' do
    p params
    user_id = nil
    #resp = request.env["rack.openid.response"]
    #p resp
    #STOPHERE
      if resp = request.env["rack.openid.response"]
   
        
        if resp.status == :success
          #I'm not sure identity_url is correct (but it seems to work)
          op_id = resp.identity_url
          puts "Identity URL #{op_id}"
          
          #p @@user_id_lookup

          #TODO: Make persistent
          #user_id = @@user_id_lookup[op_id]
          #user_id = @@user_id_lookup2.get(op_id)['guid']
          user = IdMapStore.get(op_id)
          #user id is guid
          user_id = user.uid
          if user_id
            puts "Found User: #{user_id}"
            #user_data = @@user_data[user_id]
            #user_data = @@user_data2.get(user_id)
            user_data = UserDataStore.get(user_id)
            #puts "Name: #{user_data[:friendly_name].inspect}"
            #puts "Local ID: #{user_data[:friendly_id].inspect}"
            #puts "Existing Classes: #{user_data[:joha_classes].inspect}"
            puts "Name: #{user_data.friendly_name.inspect}"
            puts "Local ID: #{user_data.friendly_id.inspect}"
            puts "Existing Classes: #{user_data.joha_classes.inspect}"
          else
            raise "WORK ON NEW USER NOW"
            #ax = OpenID::AX::FetchResponse.from_success_response(resp)
            #email_address = ax.get_single("http://axschema.org/contact/email")
            
            #TODO: Ask if they are a new user (and if not offer the option to merge
            #assuming we can find who they are)
            
            #new user
            user_id = UUIDTools::UUID.sha1_create(URL_NS, op_id).to_s
            @@user_id_lookup[op_id] = user_id
            
            
            @@user_data[user_id] = {}
          
            puts @@user_id_lookup.inspect
            redirect '/new_user'
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
      #user_data = @@user_data[user_id]
      #session[:friendly_name] =user_data[:friendly_name]
      #friendly_id = user_data[:friendly_id]
      session[:friendly_name] = user_data.friendly_name
      friendly_id = user_data.friendly_id
    #TODO: create an "owner" field that is used for the joha username
      #That way other users can us (or copy) the joha model if they know the owner (and have owner permission, etc)
      #Actually, maybe have the ability to set the owner name and associate it with the class
      #The default would be friendly_id, but could be overwritten?
      
      session[:friendly_id] = friendly_id
      #session[:joha_classes] = user_data[:joha_classes]
      session[:joha_classes] = user_data.joha_classes
      puts session.inspect
      redirect "/user/#{friendly_id}"
  end
=end

  get "/user/:username" do |username|
    #token = @@authed[username]
    joha_classes = session[:joha_classes] #@@session[token].keys
    case joha_classes.size
      when 1
        joha_class_name = joha_classes.keys.first
        session[:joha_class_name] = joha_class_name
        fid = session[:friendly_id]
        puts "session data"
        p session
        redirect "/user/#{fid}/graph/#{joha_class_name}"
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

  get '/configure_new_graph' do
    erb :configure_new_graph
  end

  post '/create_new_graph' do
    #TODO: People can overwrite other peoples graphs right now
    #Note that a new graph will not erase an older one, just use it.
    joha_class_name = params[:graph_name]
    joha_class_owner = params[:graph_owner]
    new_joha_class_data = {joha_class_name => {:owner => joha_class_owner}}
    puts "new joha class data"
    p new_joha_class_data
    user_id = session[:user_id]
    p user_id
    @@user_data[user_id][:joha_classes].merge!(new_joha_class_data)
    puts "User Data"
    p @@user_data
    session[:joha_classes] = @@user_data[user_id][:joha_classes]
    username = session[:friendly_id]
    redirect "/user/#{username}/graph/#{joha_class_name}"
  end

  get '/index_nodes' do
    puts "Session data @ index nodes"
    p session
    #p @@joha_model_map
    #TODO: Figure out elegant fix to missing top nodes
    #like when creating a new graph
    top_node = session[:top_node]||"none"
    username = session[:friendly_id]
    p username
    joha_class_name = session[:current_joha_class]
    valid_session = username && joha_class_name
    redirect '/login' unless valid_session
    p joha_class_name
    #@jm = session[:current_jm] #|| create it
    @jm = @@joha_model_map[username][joha_class_name]
    #p @jm.size
    p top_node
    p @jm.tree_graph(top_node)
    content_type :json
    ret_json = @jm.tree_graph(top_node)
  end

  #ToDo: DRY up the requests that return an updated tree map
  get '/filter_nodes' do
    top_node = params[:topnode] || session[:top_node] || "none"
    username = session[:friendly_id]
    #p username
    joha_class_name = session[:current_joha_class]
    valid_session = username && joha_class_name
    redirect '/login' unless valid_session
    @jm = @@joha_model_map[username][joha_class_name]
    #p @jm.size
    #p top_node
    #p @jm.tree_graph(top_node)
    content_type :json
    ret_json = @jm.tree_graph(top_node)
  end

  get '/data_definition' do
    #updated from JohaDataDefn to JohaModelDataDefn in path, what about git?
    model_data_def = JohaModel::JohaModelDataDefn
    #map model data definition to application data definition
    special_data_defs = {
      :attached_files => :file_list,
      :links => :link_list,
    }
    #file_data_def = {:attached_files => :file_ops}
    #data_def = file_data_def.merge(model_data_def)
    
    #include the special data defs
    app_data_def = special_data_defs
    
    model_data_def.each do |field, data_op|
      case data_op
        when :static_ops, "static_ops"
          app_data_def[field] = :static_value
        when :replace_ops, "replace_ops"
          app_data_def[field] = :basic_value
        when :list_ops, "list_ops"
          app_data_def[field] = :array_value
        when :key_list_ops, "key_list_ops"
          app_data_def[field] = :key_list_value
        else
          app_data_def[field] = :basic_value
      end
    end

    content_type :json
    app_data_def.to_json
  end

  post '/desc_data' do
    top_node = session[:top_node]
    token = session[:token]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
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
    joha_class_name = session[:current_joha_class]
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
    #TODO: Find elegant way of handling mising top nodes 
    top_node = session[:top_node]||"none"
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
    #p params
    node_id = params["id"]
    raise "Node does not exist. Required for updating node" unless node_id
    diff_data_json = params["diff"]
    
    token = session[:token]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
    top_node = session[:top_node]
    
    #p diff_data_json
    diff_data = JSON.parse diff_data_json
    p diff_data  
    @jm = @@joha_model_map[username][joha_class_name] #or create it
    
    #update data here
    tk_class = @jm.tinkit_class
    tk_node = tk_class.get(node_id)
       
    #update algorithm:
    ##replace field data by:
    # #delete field (if it exists)
    # #add updated field data
    
    diff_data.each do |field, field_diff_data|
      orig_data = field_diff_data.first
      new_data = field_diff_data.last
      new_data.uniq! if new_data.respond_to? :"uniq!"
      new_data.compact! if new_data.respond_to? :"compact!"
      p orig_data
      p new_data
      #ToDo: Figure out elegant fix for children
      #children are a calculated field based on parent data
      #as such changing children requires changing the parents
      if field == "children"
        #just for readability and emphasis that this is the children field
        orig_children = orig_data 
        new_children = new_data 
        common_children = orig_data & new_data  #intersection
        del_children = orig_children - common_children
        add_children = new_children - common_children
        del_children.each do |del_child_id|
          child_node = tk_class.get(del_child_id)
          next unless child_node
          if child_node.parents
            child_node.parents_subtract node_id  #delete this node (child's parent)
          end
        end
        add_children.each do |add_child_id|
          child_node = tk_class.get(add_child_id)
          next unless child_node
          if child_node.parents
            child_node.parents_add node_id  #add this node, (child's parent)
          else
            child_node.__set_userdata_key(:parents, node_id)
          end
        end
      else
        #replace
        #remove old data
        tk_subtract = "#{field}_subtract"
        tk_subtract_data = orig_data
        tk_node.__send__(tk_subtract.to_sym, tk_subtract_data)
        #Underlying model may be asynchrounous (i.e. a return doesn't mean the operation is completed)
        #ToDo: Add replace method to model to ensure proper operation order
        #add new data
        #TODO: Fix tinkit so that keys defined in the data definiton can be created when initially defined
        #Hack to get around tinkit bug
        existing_keys = tk_node._user_data.keys
        unless existing_keys.include?(field.to_sym)
          p tk_node._user_data.keys
          p field
          if tk_node.__send__(field.to_sym)
            raise"Error, Tinkit field #{field} already exists, stopping to prevent data from being overwritten"
          else
            tk_node.__set_userdata_key(field.to_sym, nil)
          end
        end
        #end hack  
        tk_add = "#{field}_add"
        tk_add_data = new_data
        tk_node.__send__(tk_add.to_sym, tk_add_data)
      end
    end
    
    @jm.refresh
    #ToDo: Optimize so only structural changes (inter-node relations) are re-graphed
    #Intra-node already saved, if changes are specific to that node, no need to regraph
    #Is there a way to not re-graph?
    @jm.tree_graph(top_node)
  end

  post '/upload_files_html5' do
    node_id = params["node_id"]
    params.delete("node_id")
    token = session[:token]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
    jm = @@joha_model_map[username][joha_class_name] # or create it
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
    p node_id
    p tk_node.id
    p params
    
    new_files = {}
    del_files = []
    params.each do |key, val|
      new_file_regex = /^NEW_FILE___/
      del_file_regex = /^DEL_FILE___/
      if key.match(new_file_regex)
        new_fname = key.sub(new_file_regex, "")
        new_files[new_fname] = val
      end
      if key.match(del_file_regex)
        del_fname = val
        del_files << del_fname
      end
    end
    p new_files
    p del_files
    new_files.each do |file_key, upload_data|
      user_dir = token
      tmp_file = upload_data[:tempfile]
      src_filename = upload_data[:filename]
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
    
    del_files.each do |del_file|
      tk_node.files_subtract(del_file) if del_file
    end
    
    #jm.refresh
    #content_type :json
    #return jm.list_attachments(node_id).to_json
      
    response = { :to_save => [], :to_delete => [] }
    new_files.each do |fname_key, filedata|
      filename = fname_key if fname_key == filedata[:filename]
      response[:to_save] << filename if filename
    end
    del_files.each do |fname|
      response[:to_delete] << fname
    end
    content_type :json
    return response.to_json
  end

  post '/upload_files' do
    puts "Uploaded Files"
    token = session[:token]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
    #jm = @@session[token][joha_class_name]
    #jm = session[:current_jm]
    jm = @@joha_model_map[username][joha_class_name] # or create it
    node_id = params[:node_id]
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
    uploaded_files = params[:add_files]
    puts "#: #{uploaded_files.size}"
    uploaded_files.each do |upload_file|
      #p upload_file[:node_id]
      #p upload_file[:tempfile]
      #p upload_file[:filename]
    
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
    jm.refresh
    content_type :json
    return jm.list_attachments(node_id)
  end


  get '/download/*/*' do
    node_id = params[:splat][0]
    attachment_name = params[:splat][1]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
    puts "download data"
    p node_id
    p attachment_name
    p username
    p joha_class_name
    jm = @@joha_model_map[username][joha_class_name] # or create it
    content_type 'application/octet-stream'
    jm.download_attachment(node_id, attachment_name)
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
    joha_class_name = session[:current_joha_class]
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

  ##For Testing
  get '/some_json' do
    some_data = {:a => 'A', :b => 'B'}
    content_type :json
    return some_data.to_json
  end

  get '/json_echo' do
    json_data = params[:json]
    json_data.to_json
    content_type :json
    return json_data
  end
end