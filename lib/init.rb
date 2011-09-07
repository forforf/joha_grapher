#Sinatra Support Gems
require 'sinatra'
require 'stitch-rb'
require 'erb'

#Application Support Gems
require 'uuidtools'
require 'digest/md5'  #standard library

#Application Support Libraries 
require 'joha_model'  #Main Interface to model components


#Enable #require_relative for rubies without it
unless Kernel.respond_to?(:require_relative)
  module Kernel
    def require_relative(path)
      require File.join(File.dirname(caller[0]), path.to_str)
    end
  end
end

