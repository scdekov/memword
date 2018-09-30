import ko from 'knockout'
import {Target} from 'data/target'
import {Lesson} from 'data/lesson'
import {authFetch} from 'utils'

export class Context {
    constructor () {
        this.targets = ko.observableArray()
        this.lessons = ko.observableArray()

        this._load()
    }

    _load () {
        this._loadLessons()
        this._loadTargets()
    }

    _loadTargets () {
        authFetch('/api/targets/')
            .then(data => data.json())
            .then(jsonData => {
                this.targets(jsonData.map(targetData => {
                    return new Target(targetData)
                }))
            })
    }

    _loadLessons () {
        authFetch('/api/lessons/')
            .then(data => data.json())
            .then(jsonData => {
                this.lessons(jsonData.map(lessonData => {
                    return new Lesson(lessonData)
                }))
            })
    }
}
