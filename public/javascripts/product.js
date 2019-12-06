const url = document.location.href;
const id = url.split('/products/')[1];
let product = {};
Promise.all([
    fetch(`/api/v1/products/${id}`, { headers: { Authorization: `Bearer ${jwt}` }}).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    }).then(x => x.json()),
    fetch('/templates/product.mst').then(x => x.text())
])
.then(([data, template]) => {
    if (data.data) {
        product = data.data;
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

function onDelete(e) {
    fetch(`/api/v1/products/${id}`, { 
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
            window.location.replace("/products");
        }
    })
    .catch(err => console.log(err));
}

function onEdit(e) {
    document.getElementById('prodname').value = product.prodname;
    document.getElementById('price').value = product.price;
    document.getElementById('inStock').checked = product.inStock;
}

function onConfirmUpdate(e) {
    const form = new FormData(document.getElementById('updateForm'));
    fetch(`/api/v1/products/${id}`, {
    method: 'PUT',
    headers: { 
        'Authorization': `Bearer ${jwt}`,
    }, 
    body: form
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
