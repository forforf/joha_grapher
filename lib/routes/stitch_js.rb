
class JohaGrapherApp < Sinatra::Application
  #Dynamically load in coffee script modules (commonJS format)
  get '/application.js' do
    #compiles on the fly for development. Bypass by having application.js as a static file
    content_type 'text/javascript'
    Stitch::Package.new(:paths => ["stitch/coffeescripts"], :dependencies => []).compile
  end
end
