import ko from 'knockout'
import {fetchJSON} from 'utils'

class LessonVM {
    constructor (data) {
        this.lesson = data.lesson
        this.activeQuestion = ko.observable(this._getFirstUnAnsweredQuestion())
        this.selectedAnswer = ko.observable()
        this.started = ko.computed(() => this.lesson.startTime())
        this.finished = ko.observable(!!this.lesson.endTime())
    }

    questionReviewed (confidenceLevel) {
        fetchJSON(`/api/lessons/${ko.unwrap(this.lesson.id)}/@submit-answer/`, {
            method: 'POST',
            body: JSON.stringify({
                question_id: ko.unwrap(this.activeQuestion().id),
                confidence_level: confidenceLevel
            })
        })
            .then(respJSON => {
                this.activeQuestion()._load(respJSON.question)
                this._moveToNextQuestion()
            })
    }

    answerQuestion (confidenceLevel) {
        fetchJSON(`/api/lessons/${ko.unwrap(this.lesson.id)}/@submit-answer/`, {
            method: 'POST',
            body: JSON.stringify({
                question_id: ko.unwrap(this.activeQuestion().id),
                confidence_level: confidenceLevel,
                // maybe img answer will be possible in the future
                answer: this.selectedAnswer()
            })
        })
            .then(respJSON => {
                // handle wrong answer
                this.activeQuestion()._load(respJSON.question)
                this.selectedAnswer('')
                this._moveToNextQuestion()
            })
    }

    start () {
        fetchJSON(`/api/lessons/${ko.unwrap(this.lesson.id)}/@start/`, {
            method: 'POST'
        })
            .then(respJSON => {
                this.lesson.startTime(respJSON.lesson.start_time)
            })
    }

    _getFirstUnAnsweredQuestion () {
        return this.lesson.questions().find(q => !ko.unwrap(q.passed))
    }

    _moveToNextQuestion () {
        let activeQuestionIndex = this.lesson.questions().indexOf(this.activeQuestion())
        if (activeQuestionIndex === this.lesson.questions().length - 1) {
            this.finished(true)
            this.activeQuestion(null)
        } else {
            this.activeQuestion(this.lesson.questions()[activeQuestionIndex + 1])
        }
    }
}

ko.components.register('lecture', {
    viewModel: LessonVM,
    template: {element: 'lecture'}
})

ko.components.register('exam', {
    viewModel: LessonVM,
    template: {element: 'exam'}
})
