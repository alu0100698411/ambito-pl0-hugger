desc "Run server"
task :default => [:use_keys, :jison] do
  sh "rackup"
end

desc "Create the config_filled for google/facebook/github"
task :create_secrets do
  sh "cp config/config_template.yml config/github_config_filled.yml"
  sh "cp config/config_template.yml config/facebook_config_filled.yml"
  sh "cp config/config_template.yml config/google_config_filled.yml"
end

desc "Use the google/facebook/github filled client_secrets"
task :use_keys do
  sh "cp config/google_config_filled.yml config/google_config.yml"
  sh "cp config/facebook_config_filled.yml config/facebook_config.yml"
  sh "cp config/github_config_filled.yml config/github_config.yml"
end

desc "Commit changes"
task :ci, [ :message ] => :keep_secrets do |t, args|
  message = args[:message] || ''
  sh "git ci -am '#{message}'"
end

task :jison => %w{public/javascript/pl0.js} 

desc "Compile the grammar public/jison/pl0.jison"
file "public/javascript/pl0.js" => %w{public/jison/pl0.jison} do
  sh "jison public/jison/pl0.jison public/jison/pl0.l -o public/javascript/pl0.js"
end

desc "Compile the sass public/styles.scss"
task :css do
  sh "sass public/views/styles.scss public/css/styles.css"
end

task :test do
  sh " open -a firefox test/test.html"
end

desc "Remove pl0.js"
task :clean do
  sh "rm -f public/javascript/pl0.js"
  sh "rm -f pl0*.tab.jison"
  sh "rm -f pl0*.output"
  sh "rm -f pl0*.vcg"
  sh "rm -f pl0*.c"
end

desc "Open browser in GitHub repo"
task :github do
  sh "open https://github.com/alu0100698411/ambito-pl0-jison/"
end

desc "DFA table using bison -v"
task :table do
  sh "bison -v public/jison/pl0.jison"
end
