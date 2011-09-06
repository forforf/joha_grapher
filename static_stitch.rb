require 'stitch'

puts Stitch::Package.new(:paths => ["stitch/coffeescripts"], :dependencies => []).compile
