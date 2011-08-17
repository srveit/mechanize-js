require 'autotest'

class RspecCommandError < StandardError; end

class Autotest::NodeRspec < Autotest

  NODE_MODULES = File.expand_path('../../node_modules', __FILE__)
  NODELINT = File.join(NODE_MODULES, '.bin/nodelint')
  JASMINE = File.join(NODE_MODULES, '.bin/jasmine-node')

  def initialize
    super
    self.failed_results_re = /^\d+\)\n(?:\e\[\d*m)?(?:.*?in )?'([^\n]*)'(?: FAILED)?(?:\e\[\d*m)?\n\n?(.*?(\n\n\(.*?)?)\n\n/m
    self.completed_re = /\n(?:\e\[\d*m)?\d* examples?/m
    patch_jslint
  end

  # Patches jslint to allow "foo.should.exist;"
  def patch_jslint
    patch_file = File.expand_path('../jslint.js.patch', __FILE__)
    Dir.chdir(File.join(NODE_MODULES, 'nodelint/jslint')) do
      if File.read('jslint.js') !~ /shouldMethods/
        cmd = "patch < #{patch_file}"
        if system(cmd)
          puts "patched jslint.js"
        else
          $stderr.puts "#{cmd} failed"
        end
      end
    end
  end

  def consolidate_failures(failed)
    filters = new_hash_of_arrays
    failed.each do |spec, trace|
      if trace =~ /\n(\.\/)?(.*spec\.rb):[\d]+:/
        filters[$2] << spec
      end
    end
    return filters
  end

  def make_test_cmd(files_to_test)
    files_to_test.empty? ? '' :
      "#{NODELINT} *.js lib/*.js lib/mechanize/*.js spec/*.js " +
      "--config nodelint_config.js && " +
      "#{JASMINE} --noColor spec " +
      add_options_if_present + redirect
  end

  def redirect
    ' 2> /dev/null'
    ''
  end

  def normalize(files_to_test)
    files_to_test.keys.inject({}) do |result, filename|
      result[File.expand_path(filename)] = []
      result
    end
  end

  def add_options_if_present # :nodoc:
    File.exist?("spec/spec.opts") ? "-O #{File.join('spec','spec.opts')} " : ""
  end
end

class Autotest::Node < Autotest::NodeRspec
end
