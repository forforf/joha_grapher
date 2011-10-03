class JohaGrapherApp < Sinatra::Application

  use Rack::Session::Cookie
  

  set :root, File.dirname(__FILE__)
  enable :sessions

  #initialize default routes, and load all other routes
  puts "loading initial routes ..."
  require_relative "lib/routes/init_routes"
  #models are called by the code depeding on them

end
