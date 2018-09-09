import ko from 'knockout'
import {NewLessonForm} from 'forms/lesson'
import {handleAPIResponse} from 'utils'
import {Lesson} from 'data/lesson'

export class LessonsPage {
    constructor (context) {
        this.templateName = 'lessons-page'

        this.newLessonForm = new NewLessonForm(context)
        this.lessons = context.lessons
        this.active = ko.observable(this.newLessonForm)
    }

    activate (lesson) {
        this.active(lesson)
    }

    duplicate () {
        fetch(`/api/lessons/${ko.unwrap(this.lesson.id)}/@duplicate/`, {
            method: 'POST'
        })
            .then(handleAPIResponse)
            .then(respJSON => {
                let lesson = new Lesson(respJSON.lesson)
                this.lessons.push(lesson)
                this.active(lesson)
            })
    }
}
