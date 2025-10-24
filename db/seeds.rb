# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# Clear existing data
puts "Clearing existing data..."
Response.destroy_all
Question.destroy_all
Survey.destroy_all

# Create engineering team survey
puts "Creating engineering team survey..."
engineering_survey = Survey.create!(
  title: "Engineering Team Satisfaction Survey",
  description: "This survey helps us understand the satisfaction and needs of our engineering team members."
)

# Create questions for the engineering survey
puts "Creating questions for engineering survey..."
questions = [
  {
    content: "How satisfied are you with the current development process?",
    question_type: "rating",
    position: 1,
    required: true
  },
  {
    content: "What programming languages do you use regularly?",
    question_type: "checkbox",
    position: 2,
    required: true,
    options: ["JavaScript", "TypeScript", "Ruby", "Python", "Java", "C#", "Go", "Rust", "PHP", "Swift", "Kotlin", "Other"]
  },
  {
    content: "How many years of experience do you have in software development?",
    question_type: "multiple_choice",
    position: 3,
    required: true,
    options: ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"]
  },
  {
    content: "What tools or resources would help you be more productive?",
    question_type: "text",
    position: 4,
    required: false
  },
  {
    content: "How satisfied are you with the current code review process?",
    question_type: "rating",
    position: 5,
    required: true
  },
  {
    content: "What aspects of our technical stack do you find most challenging?",
    question_type: "text",
    position: 6,
    required: false
  },
  {
    content: "How would you rate the quality of our documentation?",
    question_type: "rating",
    position: 7,
    required: true
  },
  {
    content: "What would you like to see improved in our engineering culture?",
    question_type: "text",
    position: 8,
    required: false
  },
  {
    content: "Which development methodology do you prefer?",
    question_type: "multiple_choice",
    position: 9,
    required: true,
    options: ["Scrum", "Kanban", "Extreme Programming (XP)", "Waterfall", "Hybrid approach", "Other"]
  },
  {
    content: "What tools do you use for project management?",
    question_type: "checkbox",
    position: 10,
    required: false,
    options: ["Jira", "Trello", "Asana", "GitHub Projects", "ClickUp", "Monday.com", "Notion", "Linear", "Other"]
  }
]

questions.each do |question_attrs|
  engineering_survey.questions.create!(question_attrs)
end

# Create project retrospective survey
puts "Creating project retrospective survey..."
retrospective_survey = Survey.create!(
  title: "Project Retrospective",
  description: "Help us understand what went well and what could be improved in our recent project."
)

# Create questions for the retrospective survey
puts "Creating questions for retrospective survey..."
retro_questions = [
  {
    content: "How would you rate the overall success of the project?",
    question_type: "rating",
    position: 1,
    required: true
  },
  {
    content: "What aspects of the project went well?",
    question_type: "long_text",
    position: 2,
    required: true
  },
  {
    content: "What challenges did you face during the project?",
    question_type: "long_text",
    position: 3,
    required: true
  },
  {
    content: "How effective was the communication within the team?",
    question_type: "rating",
    position: 4,
    required: true
  },
  {
    content: "What tools or processes helped you the most during this project?",
    question_type: "text",
    position: 5,
    required: false
  },
  {
    content: "What would you do differently next time?",
    question_type: "long_text",
    position: 6,
    required: false
  },
  {
    content: "Which phase of the project was most challenging?",
    question_type: "multiple_choice",
    position: 7,
    required: true,
    options: ["Planning", "Design", "Development", "Testing", "Deployment", "Maintenance"]
  },
  {
    content: "Which team members contributed most significantly to the project's success?",
    question_type: "checkbox",
    position: 8,
    required: false,
    options: ["Project Manager", "Tech Lead", "Frontend Developers", "Backend Developers", "QA Engineers", "DevOps Engineers", "UX/UI Designers", "Product Managers"]
  },
  {
    content: "How would you describe the pace of the project?",
    question_type: "multiple_choice",
    position: 9,
    required: true,
    options: ["Too slow", "Just right", "Too fast", "Inconsistent"]
  },
  {
    content: "What skills did you develop or improve during this project?",
    question_type: "checkbox",
    position: 10,
    required: false,
    options: ["Technical skills", "Communication", "Problem-solving", "Time management", "Leadership", "Collaboration", "Adaptability", "Domain knowledge"]
  }
]

retro_questions.each do |question_attrs|
  retrospective_survey.questions.create!(question_attrs)
end

# Create customer feedback survey
puts "Creating customer feedback survey..."
customer_survey = Survey.create!(
  title: "Customer Satisfaction Survey",
  description: "We value your feedback! Please help us improve our products and services."
)

# Create questions for the customer survey
puts "Creating questions for customer survey..."
customer_questions = [
  {
    content: "How satisfied are you with our product/service?",
    question_type: "rating",
    position: 1,
    required: true
  },
  {
    content: "How likely are you to recommend our product/service to others?",
    question_type: "rating",
    position: 2,
    required: true
  },
  {
    content: "Which features do you use most frequently?",
    question_type: "checkbox",
    position: 3,
    required: false,
    options: ["Feature A", "Feature B", "Feature C", "Feature D", "Feature E", "Other"]
  },
  {
    content: "How did you hear about our product/service?",
    question_type: "multiple_choice",
    position: 4,
    required: true,
    options: ["Search Engine", "Social Media", "Friend/Colleague", "Advertisement", "Blog/Article", "Other"]
  },
  {
    content: "What improvements would you like to see in our product/service?",
    question_type: "long_text",
    position: 5,
    required: false
  },
  {
    content: "How long have you been using our product/service?",
    question_type: "multiple_choice",
    position: 6,
    required: true,
    options: ["Less than a month", "1-6 months", "6-12 months", "1-2 years", "More than 2 years"]
  },
  {
    content: "What problems does our product/service solve for you?",
    question_type: "long_text",
    position: 7,
    required: false
  },
  {
    content: "Which alternative products/services did you consider?",
    question_type: "checkbox",
    position: 8,
    required: false,
    options: ["Competitor A", "Competitor B", "Competitor C", "Competitor D", "None", "Other"]
  }
]

customer_questions.each do |question_attrs|
  customer_survey.questions.create!(question_attrs)
end

puts "Seed data created successfully!"

# -----------------------------------------------------------------------------
# Role-based assessment survey with audience branching
# -----------------------------------------------------------------------------
puts "Creating role-based assessment survey..."
role_based_survey = Survey.create!(
  title: "Role-Based Assessment",
  description: "Select your role to receive a tailored set of questions.",
  branches: ["Data Engineer", "Frontend Engineer", "Product Manager"]
)

# 1) Role selection question (branching entry point)
role_selector = role_based_survey.questions.create!(
  content: "Which role best describes you?",
  question_type: "multiple_choice",
  position: 1,
  required: true,
  options: ["Data Engineer", "Frontend Engineer", "Product Manager"]
)

# Helper to create a block of questions for a given audience. Returns first and last question records.
def create_audience_block!(survey:, audience:, starting_position:)
  questions = []

  case audience
  when "Data Engineer"
    questions << survey.questions.create!(
      content: "Which data tools do you use regularly?",
      question_type: "checkbox",
      position: starting_position,
      required: true,
      options: ["dbt", "Airflow", "Spark", "Fivetran", "Snowflake Tasks", "Other"],
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "How comfortable are you with SQL?",
      question_type: "rating",
      position: starting_position + 1,
      required: true,
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "Briefly describe your data warehousing experience.",
      question_type: "long_text",
      position: starting_position + 2,
      required: false,
      audience_branch: audience
    )
  when "Frontend Engineer"
    questions << survey.questions.create!(
      content: "Which frontend frameworks do you actively use?",
      question_type: "checkbox",
      position: starting_position,
      required: true,
      options: ["React", "Next.js", "Vue", "Angular", "Svelte", "Other"],
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "How comfortable are you with React?",
      question_type: "rating",
      position: starting_position + 1,
      required: true,
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "What's your biggest UI/UX challenge lately?",
      question_type: "text",
      position: starting_position + 2,
      required: false,
      audience_branch: audience
    )
  when "Product Manager"
    questions << survey.questions.create!(
      content: "Which development methodology do you primarily use?",
      question_type: "multiple_choice",
      position: starting_position,
      required: true,
      options: ["Scrum", "Kanban", "Lean", "Waterfall", "Hybrid"],
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "Rate your confidence in requirements gathering.",
      question_type: "rating",
      position: starting_position + 1,
      required: true,
      audience_branch: audience
    )
    questions << survey.questions.create!(
      content: "What's the most important product metric you're tracking now?",
      question_type: "text",
      position: starting_position + 2,
      required: false,
      audience_branch: audience
    )
  else
    raise "Unknown audience: #{audience}"
  end

  [questions.first, questions.last]
end

# 2) Create audience-specific blocks, tracking their first/last questions and positions
audiences = ["Data Engineer", "Frontend Engineer", "Product Manager"]
current_position = 2
audience_first_last = {}

audiences.each do |aud|
  first_q, last_q = create_audience_block!(
    survey: role_based_survey,
    audience: aud,
    starting_position: current_position
  )
  audience_first_last[aud] = { first: first_q, last: last_q }
  current_position += 3 # we created 3 questions per audience above
end

# 3) Wire up branching: role selection -> first question of chosen audience
role_branch_mapping = {}
audience_first_last.each do |aud, pair|
  role_branch_mapping[aud] = pair[:first].id.to_s
end
role_selector.update!(branch: role_branch_mapping.to_json)

# 4) End each audience flow after its last question
audience_first_last.each_value do |pair|
  pair[:last].update!(branch: { "*" => "END" }.to_json)
end

puts "Role-based survey created with branching across audiences."
