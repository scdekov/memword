import ko from 'knockout'
import { Target } from './target';
import { isEmptry } from 'data/utils'

class Question {
    constructor (data = {}) {
        this.id = ko.observable()
        this.target = ko.observable()
        this.passed = ko.observable()
        this.correct = ko.observable()
        this.confidenceLevel = ko.observable()

        if (!isEmptry(data)) {
            this._load(data)
        }
    }

    _load (data) {
        this.id(data.id)
        this.target(new Target(data.target))
        this.passed(data.passed)
        this.correct(data.correct)
        this.confidenceLevel(data.confidence_level)
    }
}

export class Lesson {
    constructor (data = {}) {
        this.id = ko.observable()
        this.lessonType = ko.observable()
        this.startTime = ko.observable()
        this.endTime = ko.observable()
        this.expectedDuration = ko.observable()
        this.questions = ko.observableArray()

        if (!isEmptry(data)) {
            this._load(data)
        }
    }

    _load (data) {
        this.id(data.id)
        this.lessonType(data.lesson_type)
        this.startTime(data.start_time)
        this.endTime(data.end_time)
        this.expectedDuration(data.expected_duration)
        this.questions(data.questions.map(q => new Question(q)))
    }
}
