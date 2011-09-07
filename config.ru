APP_ROOT = File.expand_path( File.dirname(__FILE__) )

require "rubygems"
require "bundler/setup"
#needed external libaries
#includes sinatra and require_relative port
require File.join(APP_ROOT,'lib/init')


require './joha_grapher'
run JohaGrapherApp
