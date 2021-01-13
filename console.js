url = window.atob('aHR0cHM6Ly9uYXVyb2suY29tLnVhLw==')

function getSession() {
    return document.getElementsByClassName('activity-wrapper')[0].innerHTML
        .match(/(?<=ng-init="init\()(.*?)(?=\)")/g)[0]
        .match(/(?<=,)\d*(?=,)/g)[0]
}

async function getQuestions(session) {
    return await fetch(`${url}api2/test/sessions/${session}`)
        .then(response => response.json())
        .then(data => data.questions.map(q => [q.id, q.options]))
}

async function getCorrectAnsws(question_id, answers) {
    return await fetch(`${url}api/test/questions/clone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "id": question_id,
            "document_id": 709659 // static
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
    fetch(`${url}api/test/questions/${question_id}`, {
        method: 'DELETE'
    })
}

async function answerFor(session, question_id, answers) {
    return await fetch(`${url}api2/test/responses/answer`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "session_id": session,
            "answer": answers,
            "question_id": question_id.toString(),
            "show_answer": 0,
            "type": "quiz",
            "point": "1",
            "homeworkType": false,
            "homework": false
        })
    })
        .then(response => response.json())
}

async function doTheTest(timing = 0, wrong = 0, show_progress = false, session = getSession()) {
    getQuestions(session)
        .then(q => Promise.all(
            q.map((el, i) => new Promise((resolve) => setTimeout(
                async () => {
                    await answerFor(
                        session,
                        el[0],
                        await getCorrectAnsws(el[0], el[1])
                            .then(a => (i < wrong) ? [el[1].map(e => e.id).find(e => !a.includes(e.id))] : a)
                    )
                        .then(show_progress ? console.log(`✨ ${i} / ${q.length}`) : null)
                    resolve()
                },
                i * timing
            )))
        )
            .then(v => fetch(`${url}api2/test/sessions/end/${getSession()}`,
                { method: "PUT" })
                .then(console.log('🎉🎉🎉'))))
}
