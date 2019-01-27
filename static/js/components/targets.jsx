import React, { Component } from 'react'
import VisibilitySensor from 'react-visibility-sensor'

class TargetsComponent extends Component {
    componentDidMount () {
        this.props.store.loadTargets()
    }

    renderFirst () {
        if (!this.props.store.getActiveTarget() || this.props.store.getActiveTarget().id !== null) {
            return <BlankTargetComponent store={this.props.store} />
        } else {
            return <ActiveTargetComponent key='active'
                data={this.props.store.getActiveTarget()}
                store={this.props.store} />
        }
    }

    renderTarget (target) {
        if (!this.props.store.getActiveTarget() || this.props.store.getActiveTarget().id !== target.id) {
            return <TargetComponent
                key={target.id}
                data={target}
                store={this.props.store} />
        } else {
            return <ActiveTargetComponent key='active'
                data={this.props.store.getActiveTarget()}
                store={this.props.store} />
        }
    }

    render () {
        return (
            <div className="page">
                <div className="cards-container">
                    {this.renderFirst()}
                    {this.props.store.getTargets().map((target) => this.renderTarget(target))}
                </div>
            </div>
        )
    }
}

class BlankTargetComponent extends Component {
    render () {
        return (
            <div className="card new-target-card edit-target"
                onClick={() => this.props.store.setNewAsActiveTarget()}>
                <div className="new-target-cover">
                    <a href="#" className="add-btn">
                        <span className="glyphicon glyphicon-plus circled-glyph"></span>
                    </a>
                </div>
                <input className="card-title" placeholder="Title" />
            </div>

        )
    }
}

class TargetComponent extends Component {
    componentWillMount () {
        this.setState({ shownLink: '' })
    }

    onImgVisibilityChange (isVisible) {
        if (isVisible && !this.state.shownLink) {
            this.setState({ shownLink: this.props.data.imgLink })
        }
    }

    render () {
        return (
            <VisibilitySensor partialVisibility={true} onChange={this.onImgVisibilityChange.bind(this)}>
                <div className="card" key={this.props.data.id}>
                    <span className="card-title">{this.props.data.identifier}</span>
                    <span className="card-body">{this.props.data.description}</span>
                    <img className="card-footer card-footer-hover-blur" src={this.state.shownLink} />
                    <div className="card-footer-hover">
                        <div className="footer-left">
                            <button className='btn-link' onClick={() => this.props.store.setActiveTarget(this.props.data.id)}>
                                <span className="glyphicon glyphicon-pencil circled-glyph" title="edit"></span>
                            </button>
                        </div>
                        <div className="footer-right">
                            <button className='btn-link' onClick={() => this.props.store.removeTarget(this.props.data.id)}>
                                <span className="glyphicon glyphicon-trash circled-glyph" title="delete"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </VisibilitySensor>
        )
    }
}

class ActiveTargetComponent extends Component {
    constructor(props) {
        super(props)

        this.state = { loading: true }
        this.onKeyBinding = this.onKeyBinding.bind(this)
    }
    componentDidMount () {
        this.identifierInput.focus()
        document.addEventListener('keydown', this.onKeyBinding, false)
    }

    componentWillUnmount () {
        document.removeEventListener('keydown', this.onKeyBinding, false)
    }

    getNextLink () {
        return this.props.data.imgLinks[this._getActiveTargetImgLinkIx() + 1]
    }

    getPrevLink () {
        return this.props.data.imgLinks[this._getActiveTargetImgLinkIx() - 1]
    }

    setNextLink (e) {
        e.preventDefault()
        this.props.store.modifyActiveTarget({ imgLink: this.getNextLink() })
    }

    setPrevLink (e) {
        e.preventDefault()
        this.props.store.modifyActiveTarget({ imgLink: this.getPrevLink() })
    }

    _getActiveTargetImgLinkIx () {
        return this.props.data.imgLinks.indexOf(this.props.data.imgLink)
    }

    onIdentifierChanged (e) {
        this.props.store.modifyActiveTarget({ identifier: e.target.value })
    }

    onDescriptionChanged (e) {
        this.props.store.modifyActiveTarget({ description: e.target.value })
    }

    onOverlayClicked () {
        this.props.store.saveActiveTarget()
    }

    onCorrectionClicked () {
        this.props.store.modifyActiveTarget({ identifier: this.props.data.correction })
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.data.imgLink !== this.props.data.imgLink) {
            this.setState({ loading: true })
        }
    }

    onImgLoad () {
        this.setState({ loading: false })
    }

    onKeyBinding (event) {
        // Escape key
        if (event.keyCode === 27) {
            this.props.store.removeActiveTarget()
        }
    }

    render () {
        return (
            <div className="card new-target-card edit-target card-activity">
                <input className="card-title" placeholder="Title" ref={input => { this.identifierInput = input }}
                    value={this.props.data.identifier} onChange={this.onIdentifierChanged.bind(this)} />
                {
                    !!this.props.data.correction &&
                    <div className="popup">
                        <span className="arrow"></span>
                        <p>Did you mean <a href="#" onClick={this.onCorrectionClicked.bind(this)}>{this.props.data.correction}</a></p>
                    </div>
                }
                <textarea className="card-body" value={this.props.data.description}
                    onChange={this.onDescriptionChanged.bind(this)}></textarea>
                <img className="card-footer"
                    src={this.props.data.imgLink}
                    onLoad={this.onImgLoad.bind(this)}
                    onError={this.onImgLoad.bind(this)} />
                {
                    this.state.loading && <span className="loading-spinner"></span>
                }
                <div className="card-footer">
                    <div className="footer-left text-start">
                        {
                            !!this.getPrevLink() &&
                            <a href="#" onClick={this.setPrevLink.bind(this)}>
                                <span className="glyphicon glyphicon-chevron-left" title="previous"></span>
                            </a>
                        }
                    </div>
                    <div className="footer-right text-end">
                        {
                            !!this.getNextLink() &&
                            <a href="#" onClick={this.setNextLink.bind(this)}>
                                <span className="glyphicon glyphicon-chevron-right" title="next"></span>
                            </a>
                        }
                    </div>
                </div>
                <div className="active card-activity-overlay" onClick={this.onOverlayClicked.bind(this)}></div>
            </div>
        )
    }
}

export default TargetsComponent
