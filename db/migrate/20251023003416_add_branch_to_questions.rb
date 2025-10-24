class AddBranchToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :branch, :string
  end
end
