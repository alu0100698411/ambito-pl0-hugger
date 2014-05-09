$:.unshift "."
require 'sinatra'
require "sinatra/reloader" if development?
require 'sinatra/flash'
require 'pl0_program'
require 'auth'
require 'pp'

enable :sessions
set :session_secret, '*&(^#234)'
set :reserved_words, %w{grammar test login auth}
set :max_files, 10       # no more than max_files+1 will be saved

helpers do
  def current?(path='/')
    (request.path==path || request.path==path+'/') ? 'class = "current"' : ''
  end
  def inSession?()
        if session[:auth] # authenticated
		"<img class=\"borderradius\" src=\"#{session[:image]}\" width=\"35\" height=\"35\"> Authenticated as <b>#{session[:name]}</b>. Want to login with another account?"
	else
		"Please, <b>sign in</b> for saving your files"
	end
  end 
end

get '/grammar' do
  erb :grammar
end

get '/video' do
  erb :video
end

get '/tests' do
  erb :tests
end

get '/listfiles' do
  usuario = Pl0user.get(session[:name])
  erb :listFiles, 
      :locals => { :programlist => PL0Program.all(:user => session["name"])}
end

get '/:selected?' do |selected|
  puts "*************@auth*****************"
  puts session[:name]
  pp session[:auth]
  programs = PL0Program.all
  c  = PL0Program.first(:name => selected, :user => session[:name])
  source = if c then c.source else "CONST PI = 3.14;\n\nVAR alto, ancho;\nVAR largo;\n\nPROCEDURE area(x, y);\n\tVAR resultado;\n\tBEGIN\n\n\tIF(x != 0) THEN\n\t\tresultado = x * y\n\tELSE\n\t\tresultado = 0\n\tEND;\n\nPROCEDURE volumen(x,y,z);\n\tVAR resultado;\n\tresultado = x * y * z;\n\nBEGIN\n\tCALL area(alto, ancho);\n\tCALL volumen(alto, ancho, largo)\nEND\n." end
  erb :index, 
      :locals => { :programs => programs, :source => source }
end

post '/save' do
  pp params
  name = params[:fname]
  if session[:auth] # authenticated
    if settings.reserved_words.include? name  # check it on the client side
      flash[:notice] =
        %Q{<div class="error">Can't save file with name <b>'#{name}'</b>.</div>}
      redirect back
    else
      c  = PL0Program.first(:name => name)
      if c
        c.source = params["input"]
        c.save
      else
        if PL0Program.all.size >= settings.max_files
          c = PL0Program.all.sample
          c.destroy
        end
        c = PL0Program.create(
          :name => params["fname"],
          :source => params["input"],
          :user => Pl0user.get(session[:name]).user)
 
      end
      flash[:notice] =
        %Q{<div class="success">File saved as <b>#{c.name}</b> by #{session[:name]}.</div>}
      pp c
      redirect to '/'+name
    end
  else
    flash[:notice] =
      %Q{<div class="error">You are not authenticated. Please sign in.
         </div>}
    redirect back
  end
end
