import ko from 'knockout'
import moment from 'moment'
import {BaseForm} from 'forms/base'
import {LessonRepresentation} from 'data/lesson'

export class NewLessonForm extends BaseForm {
    constructor (context) {
        super()

        this.templateName = 'new-lesson-form'

        this.lesson = ko.observable(new LessonRepresentation())

        this.targets = context.targets
        this.lessons = context.lessons
        this.todayDate = moment().format('YYYY-MM-DD')
    }

    _save () {
        return this.lesson().save()
            .then(() => {
                this.lessons.unshift(this.lesson())
                this.lesson(new LessonRepresentation())
            })
    }

    setData (data) {
        this.lesson(new LessonRepresentation(data))
    }
}
