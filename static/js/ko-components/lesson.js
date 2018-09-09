import ko from 'knockout'
import {handleAPIResponse} from 'utils'

class LessonVM {
    constructor (data) {
        this.lesson = data.lesson
        this.activeQuestion = ko.observable(this.lesson.questions()[0])
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

    _moveToNextQuestion () {

    }
}

ko.components.register('lesson', {
    viewModel: LessonVM,
    template: {element: 'lesson'}
})
