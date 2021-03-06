import '../css/style'
import 'ko-components/lesson'
import 'ko-bindings/edit-target'
import 'ko-bindings/img'
import 'ko-bindings/popup'

import ko from 'knockout'
import {TargetsPage} from 'pages/targets'
import {LessonsPage} from 'pages/lessons'
import {Context} from 'data/context'

class IndexVM {
    constructor () {
        this.context = new Context()

        this.targetsPage = new TargetsPage(this.context)
        this.lessonsPage = new LessonsPage(this.context)

        this.activePage = ko.observable(this.targetsPage)
    }
}

ko.applyBindings(new IndexVM())
window.ko = ko // this allow debugging in the browser
