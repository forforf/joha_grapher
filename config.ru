APP_ROOT = File.expand_path( File.dirname(__FILE__) )

require "rubygems"
require "bundler/setup"
#needed external libaries
#includes sinatra and require_relative port
require File.join(APP_ROOT,'lib/init')


require './joha_grapher'
run JohaGrapherApp

#require File.join(APP_ROOT, "lib/joha_grapher/rest_of_app")
#require File.join(APP_ROOT, "lib/joha_grapher/login")

#map "/" do
#  run JohaBloat
#end

#map "/login" do
#  puts "Going to: #{JohaGrapher::Login.name}"
#  run JohaGrapher::Login
#end
