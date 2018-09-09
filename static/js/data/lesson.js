import ko from 'knockout'
import {Target} from './target'
import {isEmpty, handleAPIResponse} from 'utils'

class Question {
    constructor (data = {}) {
        this.id = ko.observable()
        this.target = ko.observable()
        this.passed = ko.observable()
        this.correct = ko.observable()
        this.confidenceLevel = ko.observable()

        if (!isEmpty(data)) {
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
        this.title = ko.observable()
        this.lessonType = ko.observable()
        this.startTime = ko.observable()
        this.plannedStartTime = ko.observable()
        this.endTime = ko.observable()
        this.expectedDuration = ko.observable()
        this.questions = ko.observableArray()
        this.targetIds = ko.observableArray()

        if (!isEmpty(data)) {
            this._load(data)
        }
    }

    _load (data) {
        this.id(data.id)
        this.lessonType(data.lesson_type)
        this.title(data.title)
        this.startTime(data.start_time)
        this.endTime(data.end_time)
        this.expectedDuration(data.expected_duration)
        this.questions(data.questions.map(q => new Question(q)))
    }

    save () {
        let isCreate = !this.id()
        let method = 'POST'
        let url = '/api/lessons/'
        if (!isCreate) {
            method = 'PATCH'
            url += `${this.id()}/`
        }

        return fetch(url, {
            method: method,
            body: JSON.stringify(this._getData()),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(handleAPIResponse)
            .then(this._load.bind(this), console.error)
    }

    _getData () {
        return {
            lesson_type: this.lessonType(),
            planned_start_time: this.plannedStartTime(),
            end_time: this.endTime(),
            expected_duration: this.expectedDuration(),
            target_ids: this.targetIds()
        }
    }
}
