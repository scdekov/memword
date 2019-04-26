
import React, { Component } from 'react'

const LessonPracticeComponent = () => {
    return (
    <div className="section-contatiner">
        <div data-bind="visible: !started()">
            <p data-bind="text: lesson.questions().length + ' questions'"></p>
            <p data-bind="text: 'Expected duration ' + lesson.expectedDuration()"></p>
            <button className="btn btn-primary" data-bind="click: start">START</button>
        </div>

        <div data-bind="visible: finished">
            <p>This lesson had finished. If you want to take it again click duplicate button.</p>
            <button className="btn btn-primary" data-bind="click: $parents[1].duplicate.bind($parents[1], lesson)">DUPLICATE</button>
            <button className="btn btn-secondary" data-bind="click: $parents[1].showList.bind($parents[1])">BACK</button>
        </div>

        <div data-bind="template: {
            data: activeQuestion() && activeQuestion().target,
            if: started() && !finished()
        }">
            <h4 data-bind="text: identifier"></h4>
            <div data-bind="text: description"></div>
            <img height="300" data-bind="attr: {src: imgLink}, visible: imgLink"></img>

            <div>
                <h3>How easy was that?</h3>
                <button className="btn btn-primary" data-bind="click: $parent.questionReviewed.bind($parent, 9)">EZ</button>
                <button className="btn btn-primary" data-bind="click: $parent.questionReviewed.bind($parent, 6)">easy</button>
                <button className="btn btn-primary" data-bind="click: $parent.questionReviewed.bind($parent, 3)">Need more</button>
                <button className="btn btn-primary" data-bind="click: $parent.questionReviewed.bind($parent, 1)">GG</button>
            </div>
        </div>
    </div>
    )
}

export default LessonPracticeComponent
