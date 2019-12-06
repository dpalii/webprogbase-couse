const entryLimit = 2;
let entryOffset = 0;
let entrySearchword = ''
Promise.all([
    fetch(`/api/v1/categories?limit=${entryLimit}&offset=${entryOffset}&searchword=${entrySearchword}`, { headers: { Authorization: `Bearer ${jwt}` }}).then(x => x.json()),
    fetch('/templates/categories.mst').then(x => x.text()),
    fetch('/templates/pagination.mst').then(x => x.text())
])
.then(([data, template, pagination]) => {
    if (data.data.categories) {
        if (data.user.role == 'admin') $('#control').removeClass('d-none');
        let pages = Math.floor(data.data.count / entryLimit);
        if (data.data.count % entryLimit != 0) pages += 1;
        const renderedHtmlStr = Mustache.render(template, data.data);
        const renderedPagHtmlStr = Mustache.render(pagination, { pages: pages, page: 1 });
        const catEl = document.getElementById('categoryList');
        catEl.innerHTML = renderedHtmlStr;
        const pagEl = document.getElementById('pagination');
        pagEl.innerHTML = renderedPagHtmlStr;
        if (entryOffset + entryLimit < data.data.count) $("#next").removeClass('disabled');
        const nextEl = document.getElementById('next');
        const prevEl = document.getElementById('prev');
        const searchEl = document.getElementById('search');
        const createEl = document.getElementById('confirmCreate');
        nextEl.addEventListener('click', onNext);
        prevEl.addEventListener('click', onPrev);
        searchEl.addEventListener('click', onSearch);
        createEl.addEventListener('click', onCreate);
        const searchHelp = document.getElementById('searchHelp');
        if (entrySearchword.length > 0) {
            searchHelp.innerText = `Результаты поиска для: ${entrySearchword}`;
        }
        else searchHelp.innerText = '';
    } 
    else {
        const searchHelp = document.getElementById('searchHelp');
        searchHelp.innerText = `Ничего не найдено`;
    }
})
.catch(err => console.log(err));

function onCreate(e) {
    const form = document.getElementById('createForm');
    if (form.name.value == '') {
        e.stopPropagation();
        $("#category-error").removeClass('d-none');
    } 
    else
    fetch("/api/v1/categories", { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }, 
        body: JSON.stringify({ name: form.name.value })
    })
        .then(x => x.json())
        .then(regResult => {
            if (regResult.err) {
                return Promise.reject(regResult.err);
            }
            else {
                $("#createModal").modal('hide');
                getPageData(entryLimit, entryOffset, entrySearchword);
            }
        })
        .catch(console.error);
}

function onNext(e) {
    if (!e.target.className.includes('disabled')) {
        entryOffset += entryLimit;
        getPageData(entryLimit, entryOffset, entrySearchword);
    }
}

function onPrev(e) {
    if (!e.target.className.includes('disabled')) {
        entryOffset -= entryLimit;
        getPageData(entryLimit, entryOffset, entrySearchword);
    }
}

function onSearch(e) {
    entryOffset = 0;
    const searchForm = document.getElementById('searchForm');
    entrySearchword = searchForm.searchword.value;
    getPageData(entryLimit, entryOffset, entrySearchword);
}

function getPageData(limit, offset, searchword) {
    Promise.all([
        fetch(`/api/v1/categories?limit=${limit}&offset=${offset}&searchword=${searchword}`, { headers: { Authorization: `Bearer ${jwt}` }}).then(x => x.json()),
        fetch('/templates/categories.mst').then(x => x.text()),
    ])
    .then(([data, template]) => {
        const renderedHtmlStr = Mustache.render(template, data.data);
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = renderedHtmlStr;
        const pageNum = document.getElementById('pageNum');
        let page = Math.floor(offset / limit) + 1;
        let pages = Math.floor(data.data.count / entryLimit);
        if (data.data.count % entryLimit != 0 || pages === 0) pages += 1;
        pageNum.innerText = `${page} из ${pages}`;
        if (offset + limit < data.data.count) $("#next").removeClass('disabled');
        else $("#next").addClass('disabled');
        if (offset != 0) $("#prev").removeClass('disabled');
        else $("#prev").addClass('disabled');
        const searchHelp = document.getElementById('searchHelp');
        if (entrySearchword.length > 0) {
            searchHelp.innerText = `Результаты поиска для: ${entrySearchword}`;
        }
        else searchHelp.innerText = '';
        if (data.data.count === 0) {
            const searchHelp = document.getElementById('searchHelp');
            searchHelp.innerText = `Ничего не найдено`;
        }
    })
    .catch(err => console.log(err));
}