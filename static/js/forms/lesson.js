import ko from 'knockout'
import {BaseForm} from 'forms/base'
import {Lesson} from 'data/lesson'

export class NewLessonForm extends BaseForm {
    constructor (context) {
        super()

        this.templateName = 'new-lesson-form'

        this.lesson = ko.observable(new Lesson())

        this.targets = context.targets
        this.lessons = context.lessons
    }

    _save () {
        return this.lesson().save()
            .then(() => {
                this.lessons.push(this.lesson())
                this.lesson(new Lesson())
            })
    }
}
