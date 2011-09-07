require_relative "../models/joha_admin_store"

class JohaGrapherApp < Sinatra::Application

    #use Rack::Session::Cookie
    #require 'rack/openid'
    #use Rack::OpenID

    #set :root, APP_ROOT #File.dirname(__FILE__)
    #enable :sessions
    
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
    

end
