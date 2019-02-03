import React from 'react'
import moment from 'moment'
import Picky from 'react-picky'
import 'react-picky/dist/picky.css'

class LessonsComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = { newLesson: null }
    }
    componentDidMount () {
        this.props.store.loadLessons()
        this.props.store.loadTargets() // Reconsider it
    }

    onAddExam (e) {
        e.preventDefault()
        this.setState({ newLesson: { lessonType: 'exam' } })
    }

    onAddLecture (e) {
        e.preventDefault()
        this.setState({ newLesson: { lessonType: 'lecture' } })
    }

    closeNewLesson () {
        this.setState({ newLesson: null })
    }

    render () {
        return (
            <div className="lessons-list">
                <div className="btn-group add-lesson">
                    <button
                        type="button"
                        className="btn btn-primary dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        disabled={!!this.state.newLesson}>

                        Add <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu pull-right">
                        <li><a href="#" onClick={this.onAddExam.bind(this)}>Exam</a></li>
                        <li><a href="#" onClick={this.onAddLecture.bind(this)}>Lecture</a></li>
                    </ul>
                </div>
                {
                    this.state.newLesson &&
                    <NewLessonComponent
                        data={this.state.newLesson}
                        targets={this.props.store.getTargets()}
                        store={this.props.store}
                        close={this.closeNewLesson.bind(this)} />
                }
                {
                    this.props.store.getLessons().map(lesson =>
                        (<LessonComponent key={lesson.id} data={lesson} store={this.props.store} />)
                    )
                }
            </div>
        )
    }
}

class LessonComponent extends React.Component {
    status () {
        if (!this.props.data.id) {
            return ''
        } else if (!this.props.data.startTime) {
            return 'todo'
        } else if (!this.props.data.endTime) {
            return 'in-progress'
        } else {
            return 'completed'
        }
    }

    progress () {
        const { lessonType, questions } = this.props.data

        if (this.status() !== 'in-progress' && lessonType === 'lecture') {
            return ''
        }

        let passedQuestions = questions.filter(question => question.passed)
        let progress = `${passedQuestions.length} / ${questions.length}`

        if (lessonType === 'exam') {
            let correctPassedCount = passedQuestions.reduce((sum, question) => sum + (question.correct ? 1 : 0), 0)
            progress = `${correctPassedCount} / ${progress}`
        }

        return progress
    }

    render () {
        const { id, title, startTime, endTime, plannedStartTime, questions } = this.props.data

        const timeToStart = moment(plannedStartTime).endOf('day').fromNow()

        return (
            <div className="card-wide">
                <div className="section-container section-container-width-2">
                    <div className="section fixed-width">
                        <div className="section-title">Title</div>
                        <div className="section-value">{title}</div>
                    </div>
                    <div className="section fixed-width">
                        <div className="section-title">Status</div>
                        <div className="section-value">
                            <span className={`status-${this.status()}`}></span>
                            <span>{this.status()}</span>
                        </div>
                    </div>
                    {
                        this.status() === 'todo' &&
                        <div className="section fixed-width">
                            <div className="section-title">Start</div>
                            <div className="section-value">{timeToStart}</div>
                        </div>
                    }
                    {
                        this.progress() &&
                        <div className="section fixed-width">
                            <div className="section-title">Progress</div>
                            <div className="section-value">{this.progress()}</div>
                        </div>
                    }
                </div>
                <div className="section-container section-container-width-1">
                    <div className="section">
                        <div className="section-title">Questions</div>
                        <div className="section-value">
                            <ul className="selected-questions">
                                {
                                    questions.map(question => (<li key={question.id}>{question.target.identifier}</li>))
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="section-container section-container-width-full">
                    <div className="section btns-section">
                        {
                            this.status() !== 'completed' &&
                            <button className="btn btn-primary" data-bind="click: $parent.activate.bind($parent, $data)">
                                {this.status() === 'in-progress' ? 'Resume' : 'Start'}
                            </button>
                        }
                        {
                            this.status() === 'completed' &&
                            <button className="btn btn-primary" onClick={() => this.props.store.duplicateLesson(id)}>Duplicate</button>
                        }
                        <button className="btn btn-secondary" onClick={() => this.props.store.removeLesson(id)}>Delete</button>
                    </div>
                </div>
            </div>
        )
    }
}
// this.id = data.id
// this.lessonType = data.lesson_type
// this.title = data.title
// this.startTime = data.start_time
// this.endTime = data.end_time
// this.expectedDuration = data.expected_duration
// this.plannedStartTime = moment(data.planned_start_time).format(DEFAULT_DATE_FORMAT)
// this.questions = (data.questions || []).map(q => new Question(q)) // return always from the BE array of questions

class NewLessonComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            lessonType: props.lessonType,
            title: '',
            startTime: '',
            selectedTargets: []
        }
    }

    onTargetCheckboxClicked (selectedTargets) {
        this.setState({ selectedTargets })
    }

    onPickTopTargetsClick (e) {
        e.preventDefault()
        this.props.store.pickTopLessonTargets()
            .then((r) => {
                const rawTargetIds = r.targets.map(t => t.id)
                this.setState({ selectedTargets: this.props.targets.filter(t => rawTargetIds.includes(t.id)) })
            })
    }

    onSave () {
        const { lessonType, title, startTime, selectedTargets } = this.state
        this.props.store.createLesson({ lessonType, title, startTime, targetIds: selectedTargets.map(t => t.id) })
        this.props.close()
    }

    render () {
        return (
            <div className="new-card">
                <div className="section fixed-width">
                    <div className="section-title">Title</div>
                    <div className="section-value">
                        <input type="text" onChange={({ target }) => this.setState({ title: target.value })} />
                    </div>
                </div>
                <div className="section fixed-width">
                    <div className="section-title">Start</div>
                    <div className="section-value">
                        <input type="date" onChange={({ target }) => this.setState({ startTime: target.value })} />
                    </div>
                </div>
                <div className="section">
                    <div className="section-title">Questions</div>
                    <div className="selected-questions">
                        <Picky
                            options={this.props.targets}
                            value={this.state.selectedTargets}
                            multiple={true}
                            valueKey="id"
                            labelKey="identifier"
                            includeSelectAll={true}
                            includeFilter={true}
                            dropdownHeight={300}
                            onChange={selectedTargets => this.setState({ selectedTargets })}
                            renderSelectAll={({ tabIndex }) => {
                                return (
                                    <div
                                        tabIndex={tabIndex}
                                        role="option"
                                        className={'option selected'}
                                        onClick={this.onPickTopTargetsClick.bind(this)}
                                        onKeyPress={this.onPickTopTargetsClick.bind(this)}
                                    >
                                        <span>PICK BEST</span>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
                <div className="section-container section-container-width-full">
                    <div className="section btns-section">
                        <button className="btn btn-primary" onClick={this.onSave.bind(this)}>Add {this.state.lessonType}</button>
                        <button className="btn btn-secondary" onClick={this.props.close}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default LessonsComponent
