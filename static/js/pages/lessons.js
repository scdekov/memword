import ko from 'knockout'
import {NewLessonForm} from 'forms/lesson'
import {fetchJSON} from 'utils'
import {LessonRepresentation} from 'data/lesson'

export class LessonsPage {
    constructor (context) {
        this.templateName = 'lessons-page'

        this.newLessonForm = new NewLessonForm(context)
        this.addingNewLesson = ko.observable()

        this.lessons = context.lessons
        this.active = ko.observable()
    }

    activate (lesson) {
        this.active(lesson)
    }

    addNew () {
        this.newLessonForm.clear()
        this.addingNewLesson(true)
    }

    saveNew () {
        this.newLessonForm.save()
            .then(() => {
                this.addingNewLesson(false)
            })
    }

    showList () {
        this.active(null)
    }

    duplicate (lesson) {
        fetchJSON(`/api/lessons/${ko.unwrap(lesson.id)}/@duplicate/`, {
            method: 'POST'
        })
            .then(respJSON => {
                let lesson = new LessonRepresentation(respJSON.lesson)
                this.lessons.unshift(lesson)
            })
    }

    delete (lesson) {
        fetchJSON(`/api/lessons/${ko.unwrap(lesson.id)}/`, {
            method: 'DELETE'
        })
            .then(() => {
                if (this.active() === lesson) {
                    this.active(null)
                }
                this.lessons.remove(lesson)
            })
    }
}
