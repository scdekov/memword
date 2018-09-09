import ko from 'knockout'
import {NewLessonForm} from 'forms/lesson'

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
}
