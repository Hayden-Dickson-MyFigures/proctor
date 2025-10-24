class ResponsesController < ApplicationController
  def create
    @survey = Survey.find(params[:survey_id])
    created = []
    errors = []

    # Handle batch submissions coming from the React client.
    # Expects payload like:
    #   response: {
    #     question_responses_attributes: [
    #       { question_id: 1, content: "foo" },
    #       { question_id: 2, content: ["A", "B"] }
    #     ]
    #   }
    # For checkbox questions, arrays are stringified to JSON for storage.
    if params[:response] && params[:response][:question_responses_attributes].present?
      question_attrs = params[:response][:question_responses_attributes]
      branch = params[:response][:branch]
      session_id = params[:response][:session_id]
      question_attrs.each do |qr|
        begin
          value = qr[:content]
          # Persist arrays (e.g., checkbox answers) as JSON strings
          value = value.to_json if value.is_a?(Array)
          created << Response.create!(
            survey_id: @survey.id,
            question_id: qr[:question_id],
            value: value,
            branch: branch,
            session_id: session_id
          )
        rescue => e
          # Collect any error so we can report all failures together
          errors << e.message
        end
      end

      if errors.empty?
        # All responses created successfully
        render json: { success: true, created: created.size }, status: :created
      else
        # At least one response failed to save; return details
        render json: { success: false, errors: errors }, status: :unprocessable_entity
      end
      return
    end

    # Fallback path: traditional single-response submission (non-React form)
    @response = Response.new(response_params)
    if @response.save
      respond_to do |format|
        format.html { redirect_to surveys_path, notice: 'Response was successfully recorded.' }
        format.json { render json: { success: true }, status: :created }
      end
    else
      respond_to do |format|
        format.html { redirect_to take_survey_path(@survey), alert: 'There was an error recording your response.' }
        format.json { render json: { error: @response.errors.full_messages.join(', ') }, status: :unprocessable_entity }
      end
    end
  end
  
  private
  
  def response_params
    params.require(:response).permit(:survey_id, :question_id, :value, :branch, :session_id)
  end
end
