require 'omniauth-oauth2'
require 'omniauth-google-oauth2'
require 'omniauth-facebook'
require 'omniauth-github'

use OmniAuth::Builder do
  google_config = YAML.load_file 'config/google_config.yml'
  provider :google_oauth2, google_config['identifier'], google_config['secret']

  facebook_config = YAML.load_file 'config/facebook_config.yml'
  provider :facebook, facebook_config['identifier'], facebook_config['secret']

  github_config = YAML.load_file 'config/github_config.yml'
  provider :github, github_config['identifier'], github_config['secret']
end

get '/auth/:name/callback' do
  session[:auth] = @auth = request.env['omniauth.auth']
  session[:name] = @auth['info'].name
  session[:image] = @auth['info'].image
  u = Pl0user.get(session[:name])
  if u.nil?
     Pl0user.create(:user => session[:name])
  end

  puts "params = #{params}"
  puts "@auth.class = #{@auth.class}"
  puts "@auth info = #{@auth['info']}"
  puts "@auth info class = #{@auth['info'].class}"
  puts "@auth info name = #{@auth['info'].name}"
  puts "@auth info email = #{@auth['info'].email}"

  # flash[:notice] =  %Q{<div class="success">Authenticated as <b>#{@auth['info'].name}.</b></div>}
  redirect '/'
end

get '/auth/failure' do
  flash[:notice] = params[:message] 
  redirect '/'
end
