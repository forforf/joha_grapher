#defines the data store for holding models associated with each user
require_relative "../models/joha_model_cache"


class JohaGrapherApp < Sinatra::Application

  #refactor to a model if needed
  helpers do
    def get_tree_graph(top_node, refresh_needed=false)
      jm = get_joha_model
      jm.refresh if refresh_needed
      tree_json = jm.tree_graph(top_node)
    end
    
    def diff_data(node_id, diff_data_json)
      diff_data = JSON.parse diff_data_json
      p diff_data  
      jm = get_joha_model
      #update data here
      tk_class = jm.tinkit_class
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
        #ToDo: create field in node if it doesn't exist
        unless tk_node.respond_to?(field.to_sym)
          tk_node.__set_userdata_key(field.to_sym, orig_data)
        end
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
    end
  end

  #This is called when an orphaned node get created
  #and the user selects to choose another graph
  #(called in joha_graph.js)
  get '/redirect_to_graphs' do
    user = get_user
    joha_model_id = user.current_joha_model_id
    redirect "/model/#{joha_model_id}"
  end
  
  post '/create_node' do
    #TODO: Validate against data def
    jm = get_joha_model
    node_id = params[:node_id]
    node_label = params[:node_label]
    node_parents = params[:node_parents].split(',')
    node_parents = ["none"] if node_parents.empty?
    
    node_data = {  :id => node_id,
                          :label => node_label,
                          :parents => node_parents
                      }
    
    jm.create_node(node_data)
    jm.refresh
    #TODO: Find elegant way of handling mising top nodes 
    top_node = session[:top_node]||"none"
    #TODO: Fix the jsivt grapher and/or model so we don't have this mess
    #SO ugly my eyes burn (we're changing JSON to ruby to change back to JSON)
    ruby_graph = JSON.parse(jm.tree_graph(top_node))
    
    ret_val = { :node => node_data, :graph => ruby_graph }
    ret_json = ret_val.to_json
    content_type :json
    return ret_json
  end

  
  get '/index_nodes' do
    top_node = session[:top_node]||"none"
    content_type :json
    ret_json = get_tree_graph(top_node)
  end

  get '/filter_nodes' do
    user = get_user
    top_node = params[:topnode] || session[:top_node] || "none"
    content_type :json
    ret_json = get_tree_graph(top_node)
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
    jm = get_joha_model
    node_id = params[:node_id]
    field = params[:node_data_type]
    raise "no node id" unless node_id
    @desc_data =  jm.find_all_descendant_data(node_id, field)
    case field
      when 'attached_files'
        erb :descendant_attached_files
      when 'links'
        erb :descendant_links
      else
        erb :descendant_data
    end
  end


  post '/node_data_update' do
    node_id = params["id"]
    raise "Node does not exist. Required for updating node" unless node_id
    diff_data_json = params["diff"]
    top_node = session[:top_node]
    diff_data(node_id, diff_data_json) #, username, joha_model_name)
    #ToDo: Optimize so only structural changes (inter-node relations) are re-graphed
    #Intra-node already saved, if changes are specific to that node, no need to regraph
    #Is there a way to not re-graph?
    refresh = true
    ret_json = get_tree_graph(top_node, refresh)
  end

  post '/upload_files_html5' do
    user = get_user
    user_tmp_dirname = user.id + user.current_joha_model_id
    node_id = params["node_id"]
    params.delete("node_id")
    jm = get_joha_model
    tk_class = jm.tinkit_class
    tk_node = tk_class.get(node_id)
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
    new_files.each do |file_key, upload_data|
      user_dir = user_tmp_dirname
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

  #ToDo: upload files (non-HTML5) is broken, fix it
  post '/upload_files' do
    raise "upload files (non-HTML5) hasn't been updated yet"
    puts "Uploaded Files"
    token = session[:token]
    username = session[:friendly_id]
    joha_class_name = session[:current_joha_class]
    #jm = @@session[token][joha_class_name]
    #jm = session[:current_jm]
    #jm = @@joha_model_map[username][joha_class_name] # or create it
    jm = JohaModelCache.get_model(username, joha_class_name)
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
    jm = get_joha_model
    content_type 'application/octet-stream'
    jm.download_attachment(node_id, attachment_name)
  end

  
  post '/delete_files' do
    node_id = params[:node_id]
    delete_files = params[:del_files]
    jm = get_joha_model

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
    jm = get_joha_model
    jm.destroy_node(node_id)
    jm.refresh
    top_node = session[:top_node]
    new_graph = jm.tree_graph(top_node)
    content_type :json
    return new_graph
  end
end