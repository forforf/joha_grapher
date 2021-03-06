# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "joha_grapher/version"

Gem::Specification.new do |s|
  s.name        = "joha_grapher"
  s.version     = JohaGrapher::VERSION
  s.authors     = ["David Martin"]
  s.email       = ["dmarti21@gmail.com"]
  s.homepage    = "www.joha.us"
  s.summary     = %q{Find Connect Organize}
  s.description = %q{Find Connect Organize}
  s.add_runtime_dependency(%q{joha_model})
  s.add_runtime_dependency(%q{sinatra}, '~>1.2.6')
  s.add_runtime_dependency(%q{thin}, '~>1.2.11')
  s.add_runtime_dependency(%q{rack}, '~>1.3.0')
  s.add_runtime_dependency(%q{rack-openid}, '~>1.3.1')
  s.add_runtime_dependency(%q{uuidtools}, '~>2.1.1')
  s.add_runtime_dependency(%q{i18n}, '~>0.5.0')
  s.rubyforge_project = "joha_grapher"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
