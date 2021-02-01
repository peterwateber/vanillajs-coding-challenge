"use strict"

window.contacts = []
let currentPage = 1
const API_KEY = "g8hBRJO5qpln0vFtBnHqs8HXELjbQINLGJtkDYoi5nk"
const $list = document.getElementById("list")
const $listItem = document.getElementsByClassName("list-item")
const $searcharea = document.getElementById("searcharea")
const $search = document.getElementById("search")
const $loading = document.getElementById("loading")
const $loadMore = document.getElementById("loadMore")
const $paper = document.getElementsByClassName("paper")
const $overview = document.getElementById("overview")
const $overrideToggle = document.getElementById("overrideToggle")
const $right = document.getElementById("right")
const $nothing = document.getElementById("nothing")

let Main = {
    init() {
        const _self = this
        _self.overview()
        $loadMore.addEventListener("click", _self.loadMore)
        $search.addEventListener("keyup", _self.quickSearch)
        _self.addEelementClassName(
            $loading.getElementsByTagName("img")[0],
            "active"
        )
        _self.getContact()
    },
    getContact(page = 1) {
        const _self = this
        fetch(
            `https://randomuser.me/api/?page=${page}&results=5&seed=hashtagyou`
        )
            .then((res) => res.json())
            .then((res) => {
                // Group users alphabetically
                if (Boolean(res.results.length)) {
                    window.contacts = window.contacts.concat(res.results)
                    const users = _self.groupAlphabetically(window.contacts)
                    $list.innerHTML = ""
                    users.forEach((user) => {
                        _self.appendList(user)
                    })
                    _self.removeElementClassName(
                        $loading.getElementsByTagName("img")[0],
                        "active"
                    )
                } else {
                    _self.hide($loadMore)
                }
            })
            .catch(() => {
                _self.hide($searcharea)
                _self.show($nothing)
                _self.hide($loadMore)
            })
    },
    appendList(user) {
        const _self = this
        // sort by family name per group
        const listItems = user.users
            .sort((a, b) => a.name.last.localeCompare(b.name.last))
            .map(
                (u) => `<li>
                    <a href="#" class="list-item" data-person="${u.login.uuid}">
                        <img  class="list-image" src="${u.picture.medium}" />
                        ${u.name.last}, ${u.name.first}
                    </a>
                </li>`
            )
            .join("")
        const group = `<li class="list-label">${user.group}</li>${listItems}`
        $list.insertAdjacentHTML("beforeend", group)
        // Click event listeners
        Array.from($listItem).forEach((element) => {
            element.addEventListener("click", (e) => {
                e.preventDefault()
                _self.listView(element)
            })
        })
    },
    overview() {
        const _self = this
        overrideToggle.addEventListener("click", (e) => {
            e.preventDefault()
            _self.removeElementClassName($paper[0], "active")
        })
    },
    quickSearch(ev) {
        setTimeout(() => {
            const query = ev.target.value
            const rowsPerPage = 5
            const pages = Math.ceil(window.contacts.length / rowsPerPage)
            let currentPage = 0
            let start = 0
            let results = []
            while (currentPage != pages) {
                ++currentPage
                start = (currentPage - 1) * rowsPerPage
                const offset = rowsPerPage * currentPage - 1
                for (start; start <= offset; start++) {
                    const firstName = window.contacts[start].name.first
                    const lastName = window.contacts[start].name.last
                    if (
                        firstName.toLowerCase().indexOf(query) > -1 ||
                        lastName.toLowerCase().indexOf(query) > -1
                    ) {
                        results = results.concat(window.contacts[start])
                    }
                }
            }
            const users = Main.groupAlphabetically(results)
            $list.innerHTML = ""
            users.forEach((user) => {
                Main.appendList(user)
            })
        }, 200)
    },
    listView($ele) {
        const _self = this
        $right.scrollIntoView()
        this.addEelementClassName($paper[0], "active")
        this.removeListActive()
        this.addEelementClassName($ele, "active")
        const uuid = $ele.getAttribute("data-person")
        const user = window.contacts.find((u) => u.login.uuid === uuid)
        const coordinates = user.location.coordinates
        const overviewHTML = `<div class="media">
                                <img
                                    class="media-object"
                                    src="${user.picture.thumbnail}"
                                />
                                <div class="media-title">
                                    <h3 class="title">${user.name.first} ${
            user.name.last
        }</h3>
                                    ${user.phone}
                                </div>
                            </div>
                            <p>
                                Address: 
                                <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURI(
                                    _self.getAddress(user.location)
                                )}">${_self.getAddress(user.location)}</a>
                            </p>
                            <p class="wrap">E-mail: ${user.email}</p>
                            <img
                                class="map-view"
                                src="https://image.maps.ls.hereapi.com/mia/1.6/mapview?apiKey=${API_KEY}&lat=${
            coordinates.latitude
        }&lon=${coordinates.longitude}&vt=0&z=14"
                            />
                            <div class="actions">
                                <div class="link">
                                    <a href="tel:${user.cell}">
                                        <img class="icon" src="svg/phone.svg" />
                                        <span>Call</span>
                                    </a>
                                </div>
                                <div class="link">
                                    <a href="mailto:${user.email}">
                                        <img class="icon" src="svg/email.svg" />
                                        <span>Send E-mail</span>
                                    </a>
                                </div>
                            </div>`
        $overview.innerHTML = overviewHTML
    },
    getAddress(location) {
        const street = location.street
        return `${street.number} ${street.name} ${location.city} ${location.country} ${location.postcode}`
    },
    loadMore(ev) {
        ev.preventDefault()
        $search.value = ""
        Main.addEelementClassName(
            $loading.getElementsByTagName("img")[0],
            "active"
        )
        Main.getContact(++currentPage)
    },
    removeListActive() {
        Array.from($listItem).forEach((element) => {
            this.removeElementClassName(element, "active")
        })
    },
    groupAlphabetically(users) {
        const data = users.reduce((r, e) => {
            // get first letter of name of current element
            let group = /[a-z]/g.test(e.name.last[0].toLowerCase())
                ? e.name.last[0]
                : "-"
            // if there is no property in accumulator with this letter create it
            if (!r[group]) r[group] = { group, users: [e] }
            // if there is push current element to user array for that letter
            else r[group].users.push(e)
            // return accumulator
            return r
        }, {})
        // since data at this point is an object, to get array of values
        // we use Object.values method
        return Object.values(data).sort((a, b) =>
            a.group.localeCompare(b.group)
        )
    },
    addEelementClassName($ele, className) {
        $ele.classList.add(className)
    },
    removeElementClassName($ele, className) {
        $ele.classList.remove(className)
    },
    show($ele) {
        $ele.style.display = "block"
    },
    hide($ele) {
        $ele.style.display = "none"
    },
}

Main.init()
