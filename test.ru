app = proc do |env|
  [
    200,          # Status code
    {             # Response headers
      'Content-Type' => 'text/html',
      'Content-Length' => '12',
    },
    ['Thin Working']        # Response body
  ]
end

run app
