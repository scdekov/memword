import '../css/style'

import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Redirect, Route, Switch, NavLink } from 'react-router-dom'
import moment from 'moment'
import { fetchJSON, debounce, cacheRequest } from 'utils'

import { Scout } from 'scout'
import TargetsComponent from 'components/targets.jsx'
import LessonsComponent from 'components/lessons.jsx'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DDThh:mm'
class Target {
    constructor(data) {
        this.id = data.id
        this.identifier = data.identifier
        this.description = data.description
        this.imgLink = data.img_link
        this.author = data.author_id
    }
}

class Question {
    constructor(data) {
        this.id = data.id
        this.target = new Target(data.target)
        this.passed = data.passed
        this.correct = data.correct
        this.confidenceLevel = data.confidence_level
    }
}

class Lesson {
    constructor(data) {
        this.id = data.id
        this.lessonType = data.lesson_type
        this.title = data.title
        this.startTime = data.start_time
        this.endTime = data.end_time
        this.expectedDuration = data.expected_duration
        this.plannedStartTime = moment(data.planned_start_time).format(DEFAULT_DATE_FORMAT)
        this.questions = (data.questions || []).map(q => new Question(q)) // return always from the BE array of questions
    }
}

// Getters
// Transform local state
// CRUD to API
class Store {
    constructor(onChange) {
        this.onChange = onChange
        this._data = {
            targets: [],
            activeTarget: null,
            lessons: []
        }

        this.loadActiveTargetDescription = debounce(this.loadActiveTargetDescription.bind(this), 1000)
        this.loadActiveTargetImgLinks = debounce(this.loadActiveTargetImgLinks.bind(this), 1000)
        this.loadActiveTargetCorrectQuery = debounce(this.loadActiveTargetCorrectQuery.bind(this), 1000)
        this.pickTopLessonTargets = cacheRequest(this.pickTopLessonTargets.bind(this), { cacheValidityTimeout: 1000 * 60 }) // Do we need this cache??
    }

    data () {
        return this._data
    }

    getTargets () {
        return this._data.targets
    }

    getActiveTarget () {
        return this._data.activeTarget
    }

    getLessons () {
        return this._data.lessons
    }

    loadLessons () {
        fetchJSON('/api/lessons/')
            .then(jsonData => {
                this._setData({ lessons: jsonData.map(rawLesson => new Lesson(rawLesson)) })
            })
    }

    loadTargets () {
        fetchJSON('/api/targets/')
            .then(jsonData => {
                this._setData({ targets: jsonData.map(rawTarget => new Target(rawTarget)) })
            })
    }

    loadActiveTargetImgLinks (identifier) {
        return Scout.getImages(identifier)
            .then(links => {
                if (!this._data.activeTarget || this._data.activeTarget.identifier !== identifier) return

                let { activeTarget } = this._data

                if (activeTarget.imgLink && links.indexOf(activeTarget.imgLink) === -1) {
                    links = [activeTarget.imgLink, ...links]
                }

                if (!activeTarget.imgLink) {
                    activeTarget = Object.assign({}, activeTarget, { imgLink: links[0], imgLinks: links })
                } else {
                    activeTarget = Object.assign({}, activeTarget, { imgLinks: links })
                }

                this._setData({ activeTarget })
            })
    }

    loadActiveTargetDescription (identifier) {
        return Scout.getMeaning(identifier)
            .then(description => {
                if (!this._data.activeTarget || this._data.activeTarget.identifier !== identifier) return

                this._setData({ activeTarget: Object.assign({}, this._data.activeTarget, { description }) })
            })
    }

    loadActiveTargetCorrectQuery (identifier) {
        return Scout.getCorrectQuery(identifier)
            .then(correction => {
                if (!this._data.activeTarget || this._data.activeTarget.identifier !== identifier) return

                if (correction && correction !== this._data.activeTarget.identifier) {
                    this._setData({ activeTarget: Object.assign({}, this._data.activeTarget, { correction: correction }) })
                }
            })
    }

    saveActiveTarget () {
        let { id, identifier, description, imgLink } = this._data.activeTarget
        if (!identifier) {
            this._setData({ activeTarget: null })
            return
        }

        if (!imgLink) {
            // Add the "pending" to the active target's state in order to know can it be saved
            throw new Error('Required')
        }

        if (id) {
            fetchJSON(`/api/targets/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({
                    identifier: identifier,
                    description: description,
                    img_link: imgLink
                })
            }).then(jsonData => {
                let targets = this._data.targets.map(target => target.id === id ? new Target(jsonData) : target)
                this._setData({ targets, activeTarget: null })
            })
        } else {
            fetchJSON('/api/targets/', {
                method: 'POST',
                body: JSON.stringify({
                    identifier: identifier,
                    description: description,
                    img_link: imgLink
                })
            }).then(jsonData => {
                this._setData({
                    targets: [new Target(jsonData), ...this._data.targets],
                    activeTarget: null
                })
            })
        }
    }

    removeTarget (id) {
        return fetchJSON(`/api/targets/${id}/`, {
            method: 'DELETE'
        }).then(() => {
            let targets = this._data.targets.filter(target => target.id !== id)
            this._setData({ targets })
        })
    }

    setNewAsActiveTarget () {
        this._setData({
            activeTarget: {
                id: null,
                imgLink: null,
                identifier: '',
                description: '',
                imgLinks: [],
                correction: null
            }
        })
    }

    setActiveTarget (id) {
        let target = this._data.targets.find(target => target.id === id)
        this._setData({
            activeTarget: {
                id,
                imgLink: target.imgLink,
                identifier: target.identifier,
                description: target.description,
                imgLinks: [],
                correction: null
            }
        })
        this.loadActiveTargetImgLinks(target.identifier)
    }

    modifyActiveTarget (changes) {
        const { identifier } = changes

        if (identifier && this._data.activeTarget.id) {
            this.loadActiveTargetCorrectQuery(identifier)

            changes = Object.assign({}, changes, { correction: null })
        }

        if (identifier && this._data.activeTarget.id === null) {
            this.loadActiveTargetDescription(identifier)
            this.loadActiveTargetImgLinks(identifier)
            this.loadActiveTargetCorrectQuery(identifier)

            changes = Object.assign({}, changes, { correction: null, imgLink: null })
        }

        this._setData({ activeTarget: Object.assign({}, this._data.activeTarget, changes) })
    }

    removeActiveTarget () {
        this._setData({ activeTarget: null })
    }

    duplicateLesson (id) {
        fetchJSON(`/api/lessons/${id}/@duplicate/`, {
            method: 'POST'
        }).then(jsonData => {
            this._setData({ lessons: [new Lesson(jsonData.lesson), ...this._data.lessons] })
        })
    }

    removeLesson (id) {
        fetchJSON(`/api/lessons/${id}/`, {
            method: 'DELETE'
        }).then(() => {
            this._setData({ lessons: this._data.lessons.filter((l) => l.id !== id) })
        })
    }

    pickTopLessonTargets () {
        return fetchJSON('/api/lessons/@get-top-targets/')
    }

    createLesson ({ title, lessonType, targetIds, startTime }) {
        // expected_duration: this.expectedDuration(),
        // const planned_start_time =

        const payload = {
            title,
            target_ids: targetIds,
            lesson_type: lessonType,
            start_time: moment(startTime).format(DEFAULT_DATETIME_FORMAT),
            planned_start_time: moment().format(DEFAULT_DATETIME_FORMAT)
        }

        fetchJSON('/api/lessons/', { method: 'POST', body: JSON.stringify(payload) })
            .then(rawLesson => this._setData({ lessons: [new Lesson(rawLesson), ...this._data.lessons] }))
    }

    _setData (newData) {
        this._data = Object.assign({}, this._data, newData)
        this.onChange()
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = { store: new Store(this.forceUpdate.bind(this)) }
    }

    render () {
        return (
            <Router>
                <div>
                    <div className="top-menu">
                        <NavLink activeClassName="selected" className="menu-link" to="/words"> WORDS </NavLink>
                        <NavLink activeClassName="selected" className="menu-link" to="/lessons"> LESSONS </NavLink>
                    </div>
                    <div className="main-content">
                        <Switch>
                            <Route path="/words" render={(props) => <TargetsComponent {...props} store={this.state.store} />} />
                            <Route path="/lessons" render={(props) => <LessonsComponent {...props} store={this.state.store} />} />
                            <Redirect to="/words" />
                        </Switch>
                    </div>
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
