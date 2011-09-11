require 'digest/md5'

#defines UserDataStore
require_relative "../models/joha_admin_store"
require_relative "../models/user_session_cache"

class JohaGrapherApp < Sinatra::Application
  use Rack::Session::Cookie
  require 'rack/openid'
  use Rack::OpenID
  
  #SALT for creating MD5 Hash
  SALT = "958KBC"  #ToDo: move salt out of source code
  helpers do

    def openid_login
      uid = nil
      if resp = request.env["rack.openid.response"]
        if resp.status == :success
          uid = Digest::MD5.hexdigest(SALT+resp.identity_url)
        else
          "Error: #{resp.status}"
        end
      else
        headers 'WWW-Authenticate' => Rack::OpenID.build_header(
          :identifier => params["openid_identifier"]
        )
        throw :halt, [401, 'got openid?']
      end
      return uid
    end
    
    def setup_user(uid)
      raise "Redirect to Error Page" unless uid
      send_to_url = nil
      session[:user_id] = uid
      user = UserDataStore.get(uid)
      JohaUserCache.add_user_node(uid, user)
      if user
        friendly_id = user.friendly_id
        send_to_url = "/select_model" #"/user/select_model" #/#{friendly_id}"
      else
        send_to_url = "/new_user"
      end
    end
  end
  
  get '/login' do
    #redirect to a static file
    redirect "/openid_login.html"
  end

  #From openid_login.html form
  post '/login' do
    uid = openid_login
    puts "UID: #{uid}"
    next_url = setup_user(uid)
    redirect next_url
  end
   
end
