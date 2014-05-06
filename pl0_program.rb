require 'data_mapper'
# full path!
DataMapper.setup(:default, 
                 ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/database.db" )

class Pl0user
  include DataMapper::Resource
  
  property :user, String, :key => true

  has n, :pL0Programs, :required => false
end

class PL0Program
  include DataMapper::Resource
  
  property :name, String, :key => true
  property :user, String, :key => true
  property :source, String, :length => 1..1024
  
  belongs_to :pl0user, :required => false
end


DataMapper.finalize
DataMapper.auto_upgrade!
