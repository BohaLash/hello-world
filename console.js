var url = location.origin + '/'
var doc_id = 709659

function getSession() {
    return document.getElementsByClassName('activity-wrapper')[0].innerHTML
        .match(/(?<=ng-init="init\()(.*?)(?=\)")/g)[0]
        .match(/(?<=,)\d*(?=,)/g)[0]
}

async function getQuestions(session) {
    return await fetch(`${url}api2/test/sessions/${session}`)
        .then(response => response.json())
        .then(data => [
            data.questions.map(q => [q.id, q.options, q.point, q.type]),
            data.settings.show_answer
        ])
}

async function getCorrectAnsws(question_id, answers) {
    return await fetch(`${url}api/test/questions/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id": question_id,
            "document_id": doc_id
        })
    })
        .then(response => response.json())
        .then(data => {
            cleanUpQuestion(data.id)
            return data.options
                .filter(el => el.correct == '1')
                .map(el => answers.filter(a => (a.value == el.value) && (a.image == el.image))[0])
                .map(el => el.id)
        })
}

async function cleanUpQuestion(question_id,) {
    fetch(`${url}api/test/questions/${question_id}`, { method: 'DELETE' })
}

async function answerFor(session, question, answers, show_answer) {
    return await fetch(`${url}api2/test/responses/answer`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "session_id": session,
            "answer": answers,
            "question_id": question[0],
            "show_answer": show_answer,
            "type": question[3],
            "point": question[2],
            "homeworkType": false,
            "homework": false
        })
    })
        .then(response => response.json())
}

async function doTheTest(timing = 0, wrong = 0, time_offset = 0, show_progress = true, change_cookie = true, session = getSession()) {
    if (change_cookie) document.cookie = 'PHPSESSID=q15j2chvo6r5du6svuvmuf2459;path=/'
    getQuestions(session)
        .then(q => {
            Promise.all(
                q[0].sort(() => Math.random() - .5)
                    .map((el, i) => new Promise(resolve => setTimeout(
                        async () => {
                            await answerFor(
                                session,
                                el,
                                await getCorrectAnsws(el[0], el[1])
                                    .then(a => (i < wrong)
                                        ? [el[1].map(e => e.id).filter(e => !a.includes(e)).random()]
                                        : a),
                                q[1]
                            )
                            if (show_progress) console.log(`✨ ${i} / ${q.length}`)
                            resolve()
                        },
                        i * timing + Math.random() * time_offset * 2 - time_offset
                    )))
            )
                .then(() => {
                    console.log('🎉🎉🎉')
                    fetch(`${url}api2/test/sessions/end/${session}`, { method: "PUT" })
                        .then(() => setTimeout(location.reload(), 3000))
                })
        })
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))]
}

doTheTest