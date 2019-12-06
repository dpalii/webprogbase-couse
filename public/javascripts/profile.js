let user = '';
window.onload = () => {
    $('.custom-file-input').on('change',function() {
        let fileName = $(this).val();
        const chosenPhoto = document.getElementById('chosenPhoto');
        chosenPhoto.innerHTML = fileName;
    })
};
Promise.all([
    fetch('/api/v1/me', { headers: { Authorization: `Bearer ${jwt}` }}).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    }).then(x => x.json()),
    fetch('/templates/user.mst').then(x => x.text())
])
.then(([data, template]) => {
    if (data.user) {
        user = data.user;
        const renderedHtmlStr = Mustache.render(template, data.user);
        const contents = document.getElementById('contents');
        contents.innerHTML = renderedHtmlStr;
        $("#control").removeClass('d-none');
        const deleteEl = document.getElementById('confirmDelete');
        deleteEl.addEventListener('click', onDelete);
        const editEl = document.getElementById('edit');
        editEl.addEventListener('click', onEdit);
        const confirmUpdate = document.getElementById('confirmUpdate');
        confirmUpdate.addEventListener('click', onConfirmUpdate);
    } 
})
.catch(err => console.log(err));

function onDelete(e) {
    fetch(`/api/v1/users/${user._id}`, { 
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
            localStorage.removeItem('jwt');
            window.location.replace("/");
        }
    })
    .catch(err => console.log(err));
}

function onEdit(e) {
    document.getElementById('fullname').value = user.fullname;
    document.getElementById('bio').value = user.bio;
}

function onConfirmUpdate(e) {
    const form = new FormData(document.getElementById('updateForm'));
    fetch(`/api/v1/users/${user._id}`, {
    method: 'PUT',
    headers: { 
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'multipart/form-data'
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
