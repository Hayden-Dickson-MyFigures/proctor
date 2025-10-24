class AddBranchAndSessionToResponses < ActiveRecord::Migration[7.0]
  def change
    add_column :responses, :branch, :string
    add_column :responses, :session_id, :string
  end
end
