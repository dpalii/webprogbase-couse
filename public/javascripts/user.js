const url = document.location.href;
const id = url.split('/users/')[1];
Promise.all([
    fetch(`/api/v1/users/${id}`, { headers: { Authorization: `Bearer ${jwt}` }}).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    }).then(x => x.json()),
    fetch('/templates/user.mst').then(x => x.text())
])
.then(([data, template]) => {
    if (data.data) {
        const renderedHtmlStr = Mustache.render(template, data.data);
        const contents = document.getElementById('contents');
        contents.innerHTML = renderedHtmlStr;
        if (data.data.role === 'admin' && data.data._id != data.user._id) {
            $('#demote').removeClass('d-none');
            const demote = document.getElementById('demote');
            demote.addEventListener('click', onDemote);
        }
        else if (data.data.role === 'standart') {
            $('#promote').removeClass('d-none');
            const promote = document.getElementById('promote');
            promote.addEventListener('click', onPromote);
        }
    } 
})
.catch(err => console.log(err));

function onPromote(e) {
    let bodyData = {
        role: 'admin'
    }
    fetch(`/api/v1/users/${id}`, { 
        method: 'PUT', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }, 
        body: JSON.stringify(bodyData)
    }).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    })
        .then(x => x.json())
        .then(res => {
            if (res.err) Promise.reject(res.err)
            else document.location.reload(true);
        })
        .catch(console.error);
}
function onDemote(e) {
    let bodyData = {
        role: 'standart'
    }
    fetch(`/api/v1/users/${id}`, { 
        method: 'PUT', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }, 
        body: JSON.stringify(bodyData)
    }).then(res => {
        if(res.status == 404) { 
            window.location.replace("/notfound");
            return Promise.reject('Not Found');
        }
        else return res;
    })
        .then(x => x.json())
        .then(res => {
            if (res.err) Promise.reject(res.err)
            else document.location.reload(true);
        })
        .catch(console.error);
}