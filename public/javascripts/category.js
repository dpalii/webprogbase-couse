const url = document.location.href;
const id = url.split('/categories/')[1];
let category = {};
Promise.all([
    fetch(`/api/v1/categories/${id}`, { headers: { Authorization: `Bearer ${jwt}` }}).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    }).then(x => x.json()),
    fetch('/templates/category.mst').then(x => x.text())
])
.then(([data, template]) => {
    if (data.data) {
        category = data.data;
        const renderedHtmlStr = Mustache.render(template, data.data);
        const contents = document.getElementById('contents');
        contents.innerHTML = renderedHtmlStr;
        if (data.user.role == 'admin') {
            $("#control").removeClass('d-none');
            const deleteEl = document.getElementById('confirmDelete');
            deleteEl.addEventListener('click', onDelete);
            const editEl = document.getElementById('edit');
            editEl.addEventListener('click', onEdit);
            const confirmUpdate = document.getElementById('confirmUpdate');
            confirmUpdate.addEventListener('click', onConfirmUpdate);
            const confirmCreate = document.getElementById('confirmCreate');
            confirmCreate.addEventListener('click', onConfirmCreate);
        }
    } 
})
.catch(err => console.log(err));

window.onload = () => {
    $('.custom-file-input').on('change',function() {
        let fileName = $(this).val();
        const chosenPhoto = document.getElementById('chosenPhoto');
        chosenPhoto.innerHTML = fileName;
    })
}; 
function onConfirmCreate(e) {
    const formEl = document.getElementById('createForm')
    if (!formEl.prodame || !formEl.price) {
        $('#product-error').removeClass('d-none');
    } 
    else {
        const form = new FormData(formEl);
        form.append('category', id);
        fetch(`/api/v1/products`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${jwt}`
        }, 
        body: form
        })
        .then(data => {
            document.location.reload(true);
        })
        .catch(err => console.log(err));
    }
}
function onDelete(e) {
    fetch(`/api/v1/categories/${id}`, { 
        method: 'DELETE', 
        headers: { 
            'Authorization': `Bearer ${jwt}`
        }, 
    }).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    })
    .then((data) => {
        if (data.err) Promise.reject(data.err);
        else {
            e.preventDefault(); 
            window.location.replace("/categories");
        }
    })
    .catch(err => console.log(err));
}

function onEdit(e) {
    document.getElementById('name').value = category.name;
}

function onConfirmUpdate(e) {
    const form = document.getElementById('updateForm');
    if (form.name.value == '') {
        $('#category-error').removeClass('d-none');
    } else fetch(`/api/v1/categories/${id}`, {
    method: 'PUT',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
    }, 
    body: JSON.stringify({name: form.name.value})
    }).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    })
    .then(data => {
        document.location.reload(true);
    })
    .catch(err => console.log(err));
}
