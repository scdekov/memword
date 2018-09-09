import ko from 'knockout'
import {handleAPIResponse} from 'utils'

class LessonVM {
    constructor (data) {
        this.lesson = data.lesson
        this.activeQuestion = ko.observable(this._getFirstUnAnsweredQuestion())
        this.started = ko.computed(() => this.lesson.startTime())
        this.finished = ko.observable(!this.activeQuestion()) // this should be !!endTime
    }

    answerQuestion (confidenceLevel) {
        fetch(`/api/lessons/${ko.unwrap(this.lesson.id)}/@submit-answer/`, {
            method: 'POST',
            body: JSON.stringify({
                question_id: ko.unwrap(this.activeQuestion().id),
                confidence_level: confidenceLevel
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(handleAPIResponse)
            .then(respJSON => {
                console.log(respJSON) // TODO: load into the question
                this._moveToNextQuestion()
            })
    }

    start () {
        fetch(`/api/lessons/${ko.unwrap(this.lesson.id)}/@start/`, {
            method: 'POST'
        })
            .then(handleAPIResponse)
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

ko.components.register('lesson', {
    viewModel: LessonVM,
    template: {element: 'lesson'}
})
