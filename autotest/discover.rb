Autotest.add_discovery do
  "node" if File.directory?('spec')
end
