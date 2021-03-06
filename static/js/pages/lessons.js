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
        this.targets = context.targets
        this.active = ko.observable()
    }

    activate (lesson) {
        this.active(lesson)
    }

    getDescriptionAnswers (target) {
        // this wont work if we have less than 4 targets :/
        let indexes = []
        let randNormMultiplier = Math.pow(10, Math.ceil(Math.log10(this.targets().length)))
        while (indexes.length < 3) {
            let ix = Math.floor(Math.random() * randNormMultiplier) % this.targets().length
            if (!indexes.includes(ix) && target.description() !== this.targets()[ix].description()) {
                indexes.push(ix)
            }
        }
        let answers = indexes.map(ix => {
            return this.targets()[ix].description()
        })
        let correctAnswerIx = Math.floor(Math.random() * 10) % 4
        answers.splice(correctAnswerIx, 0, target.description())
        return answers
    }

    addNew (lessonType) {
        this.newLessonForm.setData({lesson_type: lessonType})
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
