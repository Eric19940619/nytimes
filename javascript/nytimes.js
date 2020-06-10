const apikey = 'lP4lIxviho2IpvJ0JQ9H6uDlokQhaEQb'
const url = 'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=' + apikey
const params = new URL(document.location).searchParams
let type = params.get('type')
const newsItem = document.querySelector('#news-item')
const categoryItem = document.querySelector('#category-item')
const category = document.querySelector('.category')
const newsWrap = document.querySelector('.news-wrap')
const next = document.querySelector('.page')
const gotop = document.querySelector('.go-top')

let dataList = []
let categoryList = []
let pages = []
const itemCount = 3
let index = 0
let creating = false

/*
從紐約時報API取得資料後根據頁面type生成datalist
再根據datalist生成頁面內容並加入滾輪事件
當頁面位置到最後一個物件後生成下一個資料
*/
function getdata() {
  axios
    .get(url)
    .then((res) => {
      dataList = NewsList(res.data.results)
      categoryList = CategoryList(res.data.results)
      SetPage(dataList)
      Render()
      window.addEventListener('scroll', CheckOffsetY)
    })
    .catch((error) => {
      console.log(error)
    })
}

function NewsList(items) {
  if (type === 'all' || type === null) {
    return items
  } else {
    return items.filter((data) => data.section === type)
  }
}

function RenderNewsItem(item) {
  let clone = newsItem.content.cloneNode(true)
  let imgulr = item.multimedia[0].url
  let date = new Date(item.created_date).toLocaleString()
  clone.querySelector('img').src = imgulr
  clone.querySelector('h2').textContent = item.title
  clone.querySelectorAll('span')[0].textContent = date
  clone.querySelectorAll('span')[1].textContent = item.section
  clone.querySelector('p').textContent = item.abstract
  clone.querySelector('a').href = item.url
  newsWrap.appendChild(clone)
}

function CategoryList(items) {
  let list = []
  list.push('all')
  items.forEach((item) => {
    if (list.includes(item.section) === false) {
      list.push(item.section)
    }
  })
  list.sort()
  RenderCategory(list)
}

function RenderCategory(list) {
  list.forEach((item) => {
    let clone = categoryItem.content.cloneNode(true)
    let link = clone.querySelector('a')
    link.href = `?type=${item}`
    link.innerHTML = `<i class="fas fa-chevron-right"></i>${item.charAt(0).toUpperCase() + item.slice(1)}`
    category.appendChild(clone)
  })
}

function SetPage(items) {
  let pagesLength = Math.ceil(items.length / itemCount)
  for (let x = 0; x < pagesLength; x++) {
    let page = []
    let length = 0
    if (items.length === itemCount) {
      length = items.length
    } else {
      length = x === pagesLength - 1 ? items.length % itemCount : itemCount
    }

    for (let i = 0; i < length; i++) {
      page.push(items[i + x * itemCount])
    }
    pages.push(page)
  }
}

function CheckOffsetY() {
  let scrollBottom = window.pageYOffset + window.innerHeight
  let nextPosition = next.offsetTop + next.clientHeight
  if (scrollBottom > nextPosition) {
    if (!creating) {
      creating = true
      if (index < pages.length - 1) {
        index += 1
        Render()
        creating = false
        next.textContent = '往下拉看更多新聞'
      } else {
        window.removeEventListener('scroll', CheckOffsetY)
        next.textContent = '沒有更多新聞了'
      }
    }
  }
}

function Render() {
  nowpage = pages[index]
  for (let i = 0; i < nowpage.length; i++) {
    RenderNewsItem(nowpage[i])
  }
}

window.onload = getdata()

gotop.addEventListener('click', function (e) {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})
