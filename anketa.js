console.log('anketa js loaded')

var current_section = 0
var section_num = 0
var plhld = ''
// var current_max = 0

function next() {
    current_section++
    // current_max = current_section
    update()
}

function back() {
    current_section--
    update()
}

function jump(i) {
        // if (i <= current_max) {
    current_section = i
    update()
        // }
}

function update() {
    s = document.getElementsByClassName("group")
    n = document.getElementsByClassName("nav")
    for (i = 0; i < section_num; ++i) {
        s[i].style.display = (i == current_section) ? "block" : "none"
        n[i].style.background = (i == current_section) ? "#007BFF" : "none"
        n[i].style.color = (i == current_section) ? "white" : "black"
            // n[i].getElementsByClassName('far')[0].style.display = (i == current_section) ? "nane" : "block"
            // n[i].getElementsByClassName('fas')[0].style.display = (i == current_section) ? "block" : "nane"
    }
    document.getElementById('back').style.display = (current_section == 0) ? 'none' : 'block'
    document.getElementById('next').style.display = (current_section == section_num - 1) ? 'none' : 'block'
    document.getElementById('sbmt').style.display = (current_section == section_num - 1) ? 'block' : 'none'
    if (current_section == 0) document.getElementById('next').classList.add("w100")
    else document.getElementById('next').classList.remove("w100")
    window.scrollTo(0, 0)
}

function dropdown(key) {
    console.log(key)
    var el = document.getElementById('key')
    var instance = tail.select('#' + key, {placeholder: plhld})
    // instance.on("close", function() {
    //     for(var l = this.options.selected.length, i = 0; i < l; i++)
    //         [this.options.selected[i].value] = true
    // })
}

function newBlock(el, m = '') {
    var new_el = el.previousSibling.cloneNode(true)
    var p = el.parentNode
    var n = (p.getElementsByClassName('multi-group-item').length + 1).toString()
    new_el.id = 'm' + n
    new_el.getElementsByTagName('h3')[0].innerHTML = n + new_el.getElementsByTagName('h3')[0].innerHTML.substring(1)
    console.log(new_el.getElementsByTagName('h3')[0])
    var q = new_el.querySelectorAll('.q')
    q.forEach((el) => {
        var l = el.getElementsByTagName('label')[0]
        l.htmlFor = l.id.substring(1) + '_' + n
        var p_tag = el.getElementsByTagName('p')[0]
        while (p_tag.childNodes.length > 1)
            p_tag.removeChild(p_tag.lastChild)
        var inpt = p_tag.firstChild
        inpt.name = inpt.name.split('_')[0] + '_' + n
        if (inpt.multiple) 
            inpt.name += '[]'
        inpt.id = inpt.id.split('_')[0] + '_' + n
        console.log(inpt)
        var att = inpt.attributes
        while(att.length > 3)
            inpt.removeAttribute(att[att.length - 1].name)
    })
    p.insertBefore(new_el, el)
    document.getElementById('multi-block-num').value = n
    new_el.querySelectorAll("select").forEach(el => dropdown(el.id))
    if (m) alert(m + n)
}

function delBlock(m = '') {
    let els = document.getElementsByClassName('multi-group-item')
    let el = els[els.length - 1]
    el.parentNode.removeChild(el)
    if (m) alert(m + (els.length + 1))
}

document.addEventListener("DOMContentLoaded", function() {
    // document.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=1.0");
    section_num = parseInt(document.getElementById('groups-count').innerHTML)
    update()
    plhld = document.getElementById('drpodown-placeholder').innerHTML
    document.querySelectorAll("select").forEach(el => dropdown(el.id))
    document.querySelectorAll("input[type=tel]").forEach(el => {
        slct = document.getElementById('s' + (parseInt(el.id.substring(1), 10) - 1))
        el.value = '+' + parseInt(slct.options[slct.selectedIndex].text)
        slct.onchange = function() {
            el.value = '+' + parseInt(this.options[this.selectedIndex].text)
        }
    })
    newBlock(document.getElementById('new-block'))
    newBlock(document.getElementById('new-block'))
    document.getElementById("sbmt").onclick = function() {
        let allAreFilled = true
        document.getElementById("form").querySelectorAll("[required]").forEach(function(i) {
            if (!allAreFilled) return
            if (!i.value) {
                allAreFilled = false
                return
            }
        })
        if (!allAreFilled) alert(document.getElementById('submt-alert').innerHTML)
    }
})