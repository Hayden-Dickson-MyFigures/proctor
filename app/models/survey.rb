class Survey < ApplicationRecord
  has_many :questions, dependent: :destroy
  has_many :responses, dependent: :destroy
  
  # Allow branches to be stored as an array in the DB text column
  serialize :branches, Array
end
