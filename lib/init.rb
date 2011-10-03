#Sinatra Support Gems
require 'sinatra'
require 'stitch-rb'
require 'erb'

#Application Support Gems
require 'uuidtools'
require 'digest/md5'  #standard library

#Application Support Libraries 
require 'joha_model'  #Main Interface to model components

require 'uri'



#ToDo: Fix this hack to get things working with HTTP Auth

module JohaGrapher
  CouchDbHost = "10.210.43.70"
end

module CouchRest

class << self
  alias :cr_database! :database!
  def database! url
    url_parts = URI.parse url
    url_parts.user = "joha"
    url_parts.host = JohaGrapher::CouchDbHost
    url_parts.password = "joha"
    self.cr_database! url_parts.to_s
  end
end
end



#Enable #require_relative for rubies without it
unless Kernel.respond_to?(:require_relative)
  module Kernel
    def require_relative(path)
      require File.join(File.dirname(caller[0]), path.to_str)
    end
  end
end

