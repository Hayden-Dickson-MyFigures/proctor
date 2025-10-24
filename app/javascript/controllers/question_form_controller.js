import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="question-form"
export default class extends Controller {
  static targets = [
    "optionsField",
    "optionsTextarea",
    "questionType",
    "branchingField",
    "branchingEnabled",
    "branchingRows",
    "branchHidden",
  ]

  connect() {
    this.toggleOptionsField()
    this.initializeBranchingUI()
  }

  toggleOptionsField() {
    const questionType = this.getQuestionType()
    const optionsField = document.getElementById('options-field')
    const optionsTextarea = this.optionsTextareaTarget

    const needsOptions = ['multiple_choice', 'checkbox'].includes(questionType)

    if (needsOptions) {
      optionsField.classList.remove('hidden')
    } else {
      optionsField.classList.add('hidden')
    }

    // Update placeholder and conditionally prefill options
    if (optionsTextarea) {
      const defaults = this.defaultOptionsFor(questionType)
      optionsTextarea.placeholder = defaults

      // Only prefill if empty or currently equal to one of our known defaults
      const currentValue = optionsTextarea.value.trim()
      const knownDefaults = [
        this.defaultOptionsFor('multiple_choice'),
        this.defaultOptionsFor('checkbox')
      ]

      if (needsOptions) {
        if (currentValue.length === 0 || knownDefaults.includes(currentValue)) {
          optionsTextarea.value = defaults
        }
      } else {
        // Clear value when switching to a type that doesn't use options
        if (knownDefaults.includes(currentValue)) {
          optionsTextarea.value = ''
        }
      }
    }
  }

  onTypeChange() {
    this.toggleOptionsField()
    this.buildBranchingRows()
  }

  onOptionsChange() {
    this.buildBranchingRows()
  }

  toggleBranchingField() {
    const enabled = this.isBranchingEnabled()
    const hasChoices = this.getOptionValues().length > 0 || ['text','long_text'].includes(this.getQuestionType())
    if (enabled && hasChoices) {
      this.branchingFieldTarget.classList.remove('hidden')
    } else {
      this.branchingFieldTarget.classList.add('hidden')
    }
    this.buildBranchingRows()
  }

  initializeBranchingUI() {
    // If hidden field already has mapping, enable checkbox and show UI
    let existing = {}
    try {
      existing = this.branchHiddenTarget?.value ? JSON.parse(this.branchHiddenTarget.value) : {}
    } catch (e) {
      existing = {}
    }
    const hasExisting = existing && Object.keys(existing).length > 0
    if (hasExisting) {
      this.branchingEnabledTarget.checked = true
    }
    this.toggleBranchingField()
  }

  buildBranchingRows() {
    if (!this.hasBranchingRowsTarget) return
    const enabled = this.isBranchingEnabled()
    const type = this.getQuestionType()
    let options = this.getOptionValues()
    const container = this.branchingRowsTarget

    if (!enabled) { container.innerHTML = ''; return }

    // For text/long_text, allow a single default branch row
    if (options.length === 0 && ['text','long_text'].includes(type)) {
      options = ['*']
    }

    if (options.length === 0) { container.innerHTML = ''; return }

    // Load existing map if any
    let existingMap = {}
    try {
      existingMap = this.branchHiddenTarget?.value ? JSON.parse(this.branchHiddenTarget.value) : {}
    } catch (e) {
      existingMap = {}
    }

    const escapeHtml = (str) => (str || '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))

    const questionsDataAttr = this.branchingFieldTarget?.dataset?.questions || '[]'
    let questions = []
    try {
      questions = JSON.parse(questionsDataAttr)
    } catch (e) {
      questions = []
    }

    const buildOptions = (selectedId) => {
      const opts = []
      opts.push(`<option value=""></option>`) // no override (follow default order)
      opts.push(`<option value="END" ${selectedId === 'END' ? 'selected' : ''}>End of survey</option>`)
      questions.forEach(q => {
        const sid = String(q.id)
        const sel = selectedId === sid ? 'selected' : ''
        opts.push(`<option value="${escapeHtml(sid)}" ${sel}>${escapeHtml(q.label)}</option>`)
      })
      return opts.join('')
    }

    container.innerHTML = options.map((opt) => {
      const key = String(opt)
      const isWildcard = key === '*'
      const label = isWildcard ? 'Any response' : key
      const selected = existingMap[key] !== undefined ? String(existingMap[key]) : ''
      return `
        <div class="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div class="text-sm text-gray-700">${escapeHtml(label)}</div>
          <div>
            <select class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" data-branch-for="${escapeHtml(key)}">
              ${buildOptions(selected)}
            </select>
          </div>
        </div>
      `
    }).join('')
  }

  beforeSubmit(event) {
    // Serialize branching mapping if enabled
    const enabled = this.isBranchingEnabled()
    if (!enabled) {
      if (this.hasBranchHiddenTarget) this.branchHiddenTarget.value = ''
      return
    }
    const rows = this.branchingRowsTarget?.querySelectorAll('[data-branch-for]') || []
    const mapping = {}
    rows.forEach((input) => {
      const key = input.getAttribute('data-branch-for')
      const value = (input.value || '').trim()
      if (value.length > 0) {
        mapping[key] = value
      }
    })
    if (this.hasBranchHiddenTarget) {
      this.branchHiddenTarget.value = Object.keys(mapping).length > 0 ? JSON.stringify(mapping) : ''
    }
  }

  getQuestionType() {
    // Prefer target if present
    if (this.hasQuestionTypeTarget) {
      return this.questionTypeTarget.value
    }
    const sel = document.getElementById('question_question_type')
    return sel ? sel.value : ''
  }

  getOptionValues() {
    const type = this.getQuestionType()
    if (['multiple_choice', 'checkbox'].includes(type)) {
      const textarea = this.hasOptionsTextareaTarget ? this.optionsTextareaTarget : document.getElementById('question_options')
      const text = textarea ? textarea.value : ''
      return text.split('\n').map(s => s.trim()).filter(Boolean)
    }
    if (type === 'rating') {
      return ['1','2','3','4','5']
    }
    return []
  }

  isBranchingEnabled() {
    return this.hasBranchingEnabledTarget && this.branchingEnabledTarget.checked
  }

  defaultOptionsFor(type) {
    switch (type) {
      case 'multiple_choice':
        return 'Option 1\nOption 2\nOption 3'
      case 'checkbox':
        return 'Choice 1\nChoice 2\nChoice 3'
      default:
        return ''
    }
  }
} 