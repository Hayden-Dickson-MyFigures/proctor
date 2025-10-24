// Import and register all your controllers from the importmap under controllers/*

import { application } from "./application"

// Manually import all controllers
// Add your controllers here as needed
// import HelloController from "./hello_controller"
// application.register("hello", HelloController)

// Register question form controller
import QuestionFormController from "./question_form_controller"
application.register("question-form", QuestionFormController)

// This is a placeholder for future controller registrations
// When you create a new controller, import it above and register it here