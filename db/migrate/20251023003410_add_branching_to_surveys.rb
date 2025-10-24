class AddBranchingToSurveys < ActiveRecord::Migration[7.0]
  def change
    add_column :surveys, :branches, :text
  end
end
