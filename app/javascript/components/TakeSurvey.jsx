import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const TextQuestion = ({ question, onChange }) => {
  return (
    <div className="mt-1">
      <textarea 
        rows={3} 
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        onChange={(e) => onChange(question.id, e.target.value)}
      />
    </div>
  );
};

const MultipleChoiceQuestion = ({ question, onChange }) => {
  const options = ['Option 1', 'Option 2', 'Option 3'];
  
  return (
    <div className="mt-2 space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center">
          <input
            id={`question_${question.id}_option_${index}`}
            name={`question_${question.id}`}
            type="radio"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            onChange={() => onChange(question.id, option)}
          />
          <label htmlFor={`question_${question.id}_option_${index}`} className="ml-3 block text-sm font-medium text-gray-700">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

const CheckboxQuestion = ({ question, onChange }) => {
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const handleCheckboxChange = (option, isChecked) => {
    let newSelectedOptions;
    
    if (isChecked) {
      newSelectedOptions = [...selectedOptions, option];
    } else {
      newSelectedOptions = selectedOptions.filter(item => item !== option);
    }
    
    setSelectedOptions(newSelectedOptions);
    onChange(question.id, newSelectedOptions.join(', '));
  };
  
  return (
    <div className="mt-2 space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center">
          <input
            id={`question_${question.id}_option_${index}`}
            type="checkbox"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            onChange={(e) => handleCheckboxChange(option, e.target.checked)}
          />
          <label htmlFor={`question_${question.id}_option_${index}`} className="ml-3 block text-sm font-medium text-gray-700">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

const RatingQuestion = ({ question, onChange }) => {
  return (
    <div className="mt-2">
      <div className="flex items-center space-x-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating}>
            <input
              id={`question_${question.id}_rating_${rating}`}
              name={`question_${question.id}`}
              type="radio"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              onChange={() => onChange(question.id, rating.toString())}
            />
            <label htmlFor={`question_${question.id}_rating_${rating}`} className="block text-sm font-medium text-gray-700 text-center">
              {rating}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const TakeSurvey = (props) => {
  const { survey, questions } = props;
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0]?.id || null);
  const [finished, setFinished] = useState(false);
  const [visitedQuestionIds, setVisitedQuestionIds] = useState(currentQuestionId ? [currentQuestionId] : []);

  const handleInputChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const getQuestionById = (id) => questions.find(q => q.id === id);

  const parseBranchMapping = (question) => {
    if (!question || !question.branch) return {};
    try {
      return JSON.parse(question.branch) || {};
    } catch (e) {
      return {};
    }
  };

  const getNextDefaultQuestionId = (currentId) => {
    const index = questions.findIndex(q => q.id === currentId);
    if (index === -1) return null;
    const next = questions[index + 1];
    return next ? next.id : null;
  };

  const resolveNextQuestionId = (question, answerValue) => {
    const mapping = parseBranchMapping(question);
    let target = '';

    if (Array.isArray(answerValue)) {
      // For checkboxes, use the first mapped selection if any
      for (const val of answerValue) {
        if (mapping[val] !== undefined && mapping[val] !== '') {
          target = mapping[val];
          break;
        }
      }
    } else if (answerValue != null) {
      const key = String(answerValue);
      if (mapping[key] !== undefined && mapping[key] !== '') {
        target = mapping[key];
      }
    }

    if (target === 'END') return null;
    if (target) {
      const asNum = parseInt(target, 10);
      return Number.isNaN(asNum) ? null : asNum;
    }

    // Support default branch for text/long_text via wildcard '*'
    if (mapping['*'] !== undefined && mapping['*'] !== '') {
      const any = mapping['*']
      if (any === 'END') return null;
      const asNum2 = parseInt(any, 10)
      return Number.isNaN(asNum2) ? null : asNum2
    }

    return getNextDefaultQuestionId(question.id);
  };

  const goToNext = (explicitValue) => {
    setErrors([]);
    const currentQuestion = getQuestionById(currentQuestionId);
    if (!currentQuestion) {
      setFinished(true);
      return;
    }
    const value = explicitValue !== undefined ? explicitValue : responses[currentQuestion.id];
    if (currentQuestion.required && (value === undefined || value === null || (Array.isArray(value) ? value.length === 0 : String(value).trim() === ''))) {
      setErrors(['Please answer the required question before continuing.']);
      return;
    }

    const nextId = resolveNextQuestionId(currentQuestion, value);
    if (nextId == null) {
      // Defer finishing to next tick to prevent the same click from hitting a new submit button
      setTimeout(() => setFinished(true), 0);
      return;
    }
    setCurrentQuestionId(nextId);
    setVisitedQuestionIds((prev) => {
      const idx = prev.indexOf(currentQuestionId);
      const base = idx >= 0 ? prev.slice(0, idx + 1) : prev;
      return [...base, nextId];
    });
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setErrors([]);
    if (!currentQuestionId && visitedQuestionIds.length > 0) {
      // If somehow current is null but we have history, go to last
      setCurrentQuestionId(visitedQuestionIds[visitedQuestionIds.length - 1]);
      setFinished(false);
      return;
    }
    const idx = visitedQuestionIds.indexOf(currentQuestionId);
    if (idx > 0) {
      setCurrentQuestionId(visitedQuestionIds[idx - 1]);
      setFinished(false);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    // Validate responses
    const requiredQuestions = questions.filter(q => q.required && visitedQuestionIds.includes(q.id));
    const missingResponses = requiredQuestions.filter(q => {
      const val = responses[q.id];
      if (Array.isArray(val)) return val.length === 0;
      return !val;
    });
    
    if (missingResponses.length > 0) {
      setErrors(['Please answer all required questions.']);
      setSubmitting(false);
      return;
    }

    // Format response data
    const formattedResponses = Object.keys(responses).map(questionId => ({
      question_id: questionId,
      content: responses[questionId]
    }));

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    try {
      const response = await fetch(`/surveys/${survey.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          response: {
            survey_id: survey.id,
            question_responses_attributes: formattedResponses
          }
        })
      });

      if (response.ok) {
        // Save submission details locally
        const details = visitedQuestionIds.map((qid) => {
          const q = questions.find((qq) => qq.id === qid);
          return {
            id: qid,
            content: q?.content,
            question_type: q?.question_type,
            value: responses[qid]
          };
        });
        setSubmissionDetails(details);

        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        const data = await response.json();
        setErrors(data.errors || ['There was an error submitting your response.']);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setErrors(['There was an error connecting to the server.']);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question_${question.id}`}>
              {question.content} {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={`question_${question.id}`}
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
            />
          </div>
        );
      
      case 'long_text':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question_${question.id}`}>
              {question.content} {question.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={`question_${question.id}`}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
            />
          </div>
        );
      
      case 'multiple_choice':
        const options = question.options || [];
        return (
          <div className="mb-4">
            <fieldset>
              <legend className="block text-gray-700 text-sm font-bold mb-2">
                {question.content} {question.required && <span className="text-red-500">*</span>}
              </legend>
              <div className="mt-2 space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`question_${question.id}_option_${index}`}
                      name={`question_${question.id}`}
                      type="radio"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={() => { handleInputChange(question.id, option); }}
                      required={question.required}
                    />
                    <label htmlFor={`question_${question.id}_option_${index}`} className="ml-3 block text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        );
      
      case 'checkbox':
        const checkboxOptions = question.options || [];
        return (
          <div className="mb-4">
            <fieldset>
              <legend className="block text-gray-700 text-sm font-bold mb-2">
                {question.content} {question.required && <span className="text-red-500">*</span>}
              </legend>
              <div className="mt-2 space-y-2">
                {checkboxOptions.map((option, index) => {
                  // Initialize as array if not already
                  const currentResponses = Array.isArray(responses[question.id]) 
                    ? responses[question.id] 
                    : responses[question.id] ? [responses[question.id]] : [];
                  
                  const isChecked = currentResponses.includes(option);
                  
                  return (
                    <div key={index} className="flex items-center">
                      <input
                        id={`question_${question.id}_option_${index}`}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        value={option}
                        checked={isChecked}
                        onChange={(e) => {
                          let newValues;
                          if (e.target.checked) {
                            newValues = [...currentResponses, option];
                          } else {
                            newValues = currentResponses.filter(val => val !== option);
                          }
                          handleInputChange(question.id, newValues);
                        }}
                      />
                      <label htmlFor={`question_${question.id}_option_${index}`} className="ml-3 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </div>
        );
      
      case 'rating':
        return (
          <div className="mb-4">
            <fieldset>
              <legend className="block text-gray-700 text-sm font-bold mb-2">
                {question.content} {question.required && <span className="text-red-500">*</span>}
              </legend>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center">
                      <input
                        id={`question_${question.id}_rating_${rating}`}
                        name={`question_${question.id}`}
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        value={rating.toString()}
                        checked={responses[question.id] === rating.toString()}
                        onChange={() => { handleInputChange(question.id, rating.toString()); }}
                        required={question.required}
                      />
                      <label htmlFor={`question_${question.id}_rating_${rating}`} className="mt-1 text-sm text-gray-700">
                        {rating}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </fieldset>
          </div>
        );
      
      default:
        return (
          <div className="mb-4">
            <p className="text-gray-700">Unsupported question type: {question.question_type}</p>
          </div>
        );
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Thank you for completing the survey!</p>
            </div>
          </div>
        </div>

        {submissionDetails && (
          <div className="p-4 bg-white rounded shadow">
            <div className="font-semibold text-gray-900 mb-3">Your submission</div>
            <div className="space-y-3">
              {submissionDetails.map((d) => (
                <div key={d.id}>
                  <div className="text-sm font-medium text-gray-800">{d.content}</div>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(d.value) ? d.value.join(', ') : String(d.value || '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = currentQuestionId != null ? questions.find(q => q.id === currentQuestionId) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      <p className="mb-6">{survey.description}</p>
      
      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} onKeyDown={(e) => { if (!finished && e.key === 'Enter') e.preventDefault(); }}>
        {!finished && currentQuestion && (
          <div key={currentQuestion.id} className="mb-6 p-4 bg-white shadow rounded">
            {renderQuestion(currentQuestion)}
          </div>
        )}

        <div className="mt-6">
          {(() => {
            const canGoBack = (() => {
              if (finished) return visitedQuestionIds.length > 1;
              if (!currentQuestion) return false;
              const idx = visitedQuestionIds.indexOf(currentQuestion.id);
              return idx > 0;
            })();

            if (finished) {
              return (
                <>
                  {canGoBack && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </>
              );
            }

            if (!currentQuestion) return null;

            const currentVal = responses[currentQuestion.id];
            const nextDisabled = !!currentQuestion.required && (
              currentVal === undefined || currentVal === null || (Array.isArray(currentVal) ? currentVal.length === 0 : String(currentVal).trim() === '')
            );

            return (
              <>
                {canGoBack && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => goToNext()}
                  disabled={nextDisabled}
                  className={`${nextDisabled ? 'opacity-50 cursor-not-allowed ' : ''}bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                >
                  Next
                </button>
              </>
            );
          })()}
        </div>
      </form>
    </div>
  );
};

// Use a self-executing function to initialize the component
const initializeTakeSurvey = () => {
  const container = document.getElementById('take-survey-container');
  if (container && !container.hasAttribute('data-react-initialized')) {
    const surveyData = JSON.parse(container.dataset.survey || '{}');
    const questionsData = JSON.parse(container.dataset.questions || '[]');
    
    // Mark as initialized to prevent double initialization
    container.setAttribute('data-react-initialized', 'true');
    
    const root = createRoot(container);
    root.render(
      <TakeSurvey 
        survey={surveyData} 
        questions={questionsData}
      />
    );
  }
};

// Try to initialize immediately
initializeTakeSurvey();

// Also listen for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeTakeSurvey);

// Additionally listen for turbo:load event if using Turbo
document.addEventListener('turbo:load', initializeTakeSurvey);

export default TakeSurvey; 