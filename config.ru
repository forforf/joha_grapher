APP_ROOT = File.expand_path( File.dirname(__FILE__) )

puts "Starting Rackup config"
puts "Loading basic libs ..."
require "rubygems"
require "bundler/setup"
#needed external libaries
#includes sinatra and require_relative port

puts "loading Sintatra Lib ..."
require File.join(APP_ROOT,'lib/init')

puts "Loading App lib ..."
require './joha_grapher'

ca_file_location = File.join(File.dirname(__FILE__), "ca-bundle/ca-bundle.crt")
puts "Loading certificates: #{ca_file_location}"
OpenID.fetcher.ca_file = ca_file_location
run JohaGrapherApp
