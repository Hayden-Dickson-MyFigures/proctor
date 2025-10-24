class AddAudienceBranchToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :audience_branch, :string
  end
end


