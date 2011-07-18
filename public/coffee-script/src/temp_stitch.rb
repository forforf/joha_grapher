require 'stitch'
print Stitch::Package.new(:paths => ["."]).compile
