require 'autotest'

class RspecCommandError < StandardError; end

class Autotest::NodeRspec < Autotest
  
  NODELINT = File.expand_path('../../../.bin/nodelint', __FILE__)
  JASMINE = File.expand_path('../../../.bin/jasmine-node', __FILE__)

  def initialize
    super
    self.failed_results_re = /^\d+\)\n(?:\e\[\d*m)?(?:.*?in )?'([^\n]*)'(?: FAILED)?(?:\e\[\d*m)?\n\n?(.*?(\n\n\(.*?)?)\n\n/m
    self.completed_re = /\n(?:\e\[\d*m)?\d* examples?/m
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
      "#{NODELINT} *.js lib/*.js lib/mechanize/*.js spec/*.js --config nodelint_config.js && " +
      "#{JASMINE} --noColor spec " +
      add_options_if_present + redirect
  end

  def redirect
    ' 2> /dev/null'
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
