#load primary routes
require_relative 'login'
require_relative 'new_user'
require_relative 'stitch_js'
require_relative 'user_pages'


#these are only ran (I think -- needs testing) if the ones above aren't found
#default route(s)
class JohaGrapherApp < Sinatra::Application
    get '/' do
      redirect '/login'
    end
end
