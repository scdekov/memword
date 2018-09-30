import ko from 'knockout'
import {NewLessonForm} from 'forms/lesson'
import {fetchJSON} from 'utils'
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

    duplicate (lesson) {
        fetchJSON(`/api/lessons/${ko.unwrap(lesson.id)}/@duplicate/`, {
            method: 'POST'
        })
            .then(respJSON => {
                let lesson = new Lesson(respJSON.lesson)
                this.lessons.push(lesson)
                this.active(lesson)
            })
    }

    delete (lesson) {
        fetchJSON(`/api/lessons/${ko.unwrap(lesson.id)}/`, {
            method: 'DELETE'
        })
            .then(() => {
                this.active(this.newLessonForm)
                this.lessons.remove(lesson)
            })
    }
}
