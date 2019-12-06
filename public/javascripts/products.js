const entryLimit = 2;
let entryOffset = 0;
let entrySearchword = ''
Promise.all([
    fetch(`/api/v1/products?limit=${entryLimit}&offset=${entryOffset}&searchword=${entrySearchword}`, { headers: { Authorization: `Bearer ${jwt}` } }).then(x => x.json()),
    fetch('/templates/products.mst').then(x => x.text()),
    fetch('/templates/pagination.mst').then(x => x.text())
])
    .then(([data, template, pagination]) => {
        if (data.data.products) {
            let pages = Math.floor(data.data.count / entryLimit);
            if (data.data.count % entryLimit != 0) pages += 1;
            const renderedHtmlStr = Mustache.render(template, data.data);
            const renderedPagHtmlStr = Mustache.render(pagination, { pages: pages, page: 1 });
            const prodEl = document.getElementById('productList');
            prodEl.innerHTML = renderedHtmlStr;
            const pagEl = document.getElementById('pagination');
            pagEl.innerHTML = renderedPagHtmlStr;
            if (entryOffset + entryLimit < data.data.count) $("#next").removeClass('disabled');
            const nextEl = document.getElementById('next');
            const prevEl = document.getElementById('prev');
            const searchEl = document.getElementById('search');
            nextEl.addEventListener('click', onNext);
            prevEl.addEventListener('click', onPrev);
            searchEl.addEventListener('click', onSearch);
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
        fetch(`/api/v1/products?limit=${limit}&offset=${offset}&searchword=${searchword}`, { headers: { Authorization: `Bearer ${jwt}` } }).then(x => x.json()),
        fetch('/templates/products.mst').then(x => x.text()),
    ])
        .then(([data, template]) => {
            const renderedHtmlStr = Mustache.render(template, data.data);
            const productList = document.getElementById('productList');
            productList.innerHTML = renderedHtmlStr;
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