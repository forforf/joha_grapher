
#Stubs for checking the interface

class JohaGrapherApp < Sinatra::Application
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
  
  post '/post_test' do
    content_type :json
    return params.to_json
  end
end