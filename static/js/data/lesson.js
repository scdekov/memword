import ko from 'knockout'
import {Target} from './target'
import {isEmpty, fetchJSON} from 'utils'
import moment from 'moment'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DDThh:mm'

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
        this.plannedStartTime = ko.observable(moment().format(DEFAULT_DATE_FORMAT))
        this.endTime = ko.observable()
        this.expectedDuration = ko.observable()
        this.timeToStart = ko.observable()
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
        this.plannedStartTime(moment(data.planned_start_time).format(DEFAULT_DATE_FORMAT))
        this.timeToStart(moment(data.planned_start_time).endOf('day').fromNow())
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

        return fetchJSON(url, {
            method: method,
            body: JSON.stringify(this._getData())
        })
            .then(this._load.bind(this), console.error)
    }

    _getData () {
        return {
            title: this.title(),
            lesson_type: this.lessonType(),
            planned_start_time: moment(this.plannedStartTime()).format(DEFAULT_DATETIME_FORMAT),
            end_time: this.endTime(),
            expected_duration: this.expectedDuration(),
            target_ids: this.targetIds()
        }
    }

    pickTopTargets () {
        return fetchJSON('/api/lessons/@get-top-targets/')
            .then(respJSON => {
                this.targetIds(respJSON.targets.map(target => target.id))
            })
    }
}

export class LessonRepresentation extends Lesson {
    constructor (...args) {
        super(...args)
        // this better be calculated in the backend
        this.statusCode = ko.computed(() => {
            if (!this.id()) {
                return ''
            } else if (!this.startTime()) {
                return 'todo'
            } else if (!this.endTime()) {
                return 'in-progress'
            }
            return 'completed'
        })

        this.status = ko.computed(() => {
            return {
                '': 'Computing...',
                'todo': 'To Do',
                'in-progress': 'In Progress',
                'completed': 'Completed'
            }[this.statusCode()]
        })

        this.progress = ko.computed(() => {
            if (this.statusCode() !== 'in-progress') {
                return ''
            }

            let passedQuestions = this.questions().filter(question => question.passed())
            return `${passedQuestions.length} / ${this.questions().length}`
        })
    }
}
