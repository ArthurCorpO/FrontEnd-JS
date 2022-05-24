var token = sessionStorage.getItem("token")
if (token == null) {
    window.location.replace('../login/login.html')
}
const paginaAtual = window.location.href
const atributosUrl = paginaAtual.split('?')
// let url = 'http://localhost:8080/api/tarefas';
let url = 'http://10.92.198.38:8080/api/usuarios';
var idd = '';
if (atributosUrl[1] !== undefined) {
    url = url + "/page/" + atributosUrl[1]
} else {
    window.location.href = paginaAtual + "?1"
}
let bt_next = document.getElementById('bt_next')
const bt_back = document.getElementById('bt_back')

function listenerNext() {
    atributosUrl[1] = parseInt(atributosUrl[1]) + 1;
    window.location.href = atributosUrl.toString().replace(/,/g, "?")
}

function listenerBack() {
    atributosUrl[1] = parseInt(atributosUrl[1]) - 1;
    window.location.href = atributosUrl.toString().replace(/,/g, "?")
}
var idd = '';

document.addEventListener('DOMContentLoaded', function () {
    getOfDatabase();

    var ModalNotBoot = document.getElementById('myModal');
    ModalNotBoot.addEventListener('hidden.bs.modal', function (event) {
        var b = document.getElementById('btnEliminar');
        b.removeEventListener('click', deletarProfModal);
        let btnSalvar = document.getElementById('btnSalvarEditar');
        btnSalvar.removeEventListener('click', editarProfModal);
    });
});

function getOfDatabase() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let fetchData = {
        method: 'GET',
        headers: myHeaders
    }

    fetch(url, fetchData)
        .then((resp) => {
            resp.json().then((info) => {
                let profs = info.content;
                console.log(info)
                if (info.length == 0) {
                    document.getElementById("error").style.display = "block";
                }
                if (info.totalPages > atributosUrl[1]) {
                    bt_next.addEventListener('click', listenerNext)
                    bt_back.addEventListener('click', listenerBack)
                    // bt_next.classList.remove(".hover")
                } else
                    bt_next.removeEventListener('click', listenerNext)
                bt_back.addEventListener('click', listenerBack)
                if (atributosUrl[1] == 1) {
                    bt_back.removeEventListener('click', listenerBack)
                }
                return profs.map((prof) => {
                    id = prof.id;
                    console.log(prof)
                    criarLinha(prof.nome, prof.matricula, prof.email, prof.ativo, id);
                })
            })
                .catch((error) => {
                    console.log(error);
                    exibeErro("Falha na Conexão");
                });
        })
}

function criarLinha(nome, numMat, email, on, id) {
    const tbody = document.querySelector('tbody');
    let tr = document.createElement('tr');
    tr.id = id;
    let tdNomeProf = document.createElement('td');
    let tdMat = document.createElement('td');
    let tdEmail = document.createElement('td');
    let tdOnOff = document.createElement('td');
    let tdBtn = document.createElement('td');
    let tdBtnDel = document.createElement('td');

    tbody.appendChild(tr);

    if(on === true) {
        on = 'Cadastrado';
    } else {
        on = 'Não Cadastrado';
    }

    tdNomeProf.innerText = nome;
    tdMat.innerText = numMat;
    tdEmail.innerText = email;
    tdOnOff.innerText = on;

    const btnEdit = document.createElement('button');
    arrumaEdtBtn(btnEdit);

    btnEdit.addEventListener('click', function (e) {
        var myModal = new bootstrap.Modal(document.getElementById('myModal'));
        getElementsByEdit(id);
        myModal.show();
        
        idd = id;

        const btnSalvar = document.getElementById('btnSalvarEditar');
        btnSalvar.addEventListener('click', editarProfModal);

        const btnDeletar = document.getElementById('btnEliminar');
        btnDeletar.addEventListener('click', deletarProfModal);
    });

    const btnDel = document.createElement('button');
    arrumaExclBtn(btnDel);
    btnDel.addEventListener('click', function (e) {
        e.preventDefault();

        deletaEvento(id);
    });

    tr.appendChild(tdNomeProf);
    tr.appendChild(tdMat);
    tr.appendChild(tdEmail);
    tr.appendChild(tdOnOff);
    tr.appendChild(tdBtn);
    tdBtn.appendChild(btnEdit);
    tr.appendChild(tdBtnDel);
    tdBtnDel.appendChild(btnDel);
}

const editarProfModal = (e) => {
    /* var myModal = new bootstrap.Modal(document.getElementById('myModal'));
    e.preventDefault();

    var data = document.getElementById('start');
    var title = document.getElementById('title');
    var description = document.getElementById('description');
    var erro = 0;
    var checkDay = new Date(formatDate(data.value, 'yyyy-MM-dd'));

    const select = document.getElementById('periodo').value;
    if (select == 0) {
        msg = "Por favor, selecione um periodo"
        erro++;
    } else if (description.value == '') {
        msg = "Por favor, insira uma Descrição !";
        erro++;
    } else if (title.value == '') {
        msg = "Por favor, insira um Título !";
        erro++;
    } else if (getDataFormatSomOne() > data.value) {
        msg = "Data inserida inválida";
        erro++;
    } else if (checkDay.getDay() == 5) {
        msg = "Indisponivel aos Domingos";
        erro++;
    }
    if (erro > 0) {
        exibeErro(msg);
        closeModal();
        msg = '';

    } else {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const select = document.getElementById('periodo').value;
        var color = getSelectColor(select);

        let evento_editar = {
            id,
            title: title.value,
            periodo: select,
            start: data.value,
            description: description.value,
            color
        }

        myModal.dispose();
        // url = 'http://localhost:8080/api/tarefas';
        url = 'http://10.92.198.38:8080/api/tarefas';
        let fetchData = {
            method: 'PUT',
            body: JSON.stringify(evento_editar),
            headers: myHeaders
        }
        const newUrl = url + "/" + id;

        fetch(newUrl, fetchData)
            .then((resp) => {
                resp.json().then((resposta) => {
                    if (resp.status == 409) {
                        closeModal();
                        exibeErro("Periodo já existente");
                    }
                    if (resp.status == 200) {
                        window.location.replace('listaEventos.html');
                    }
                })
                    .catch((error) => {
                        console.log("catch : " + resp.status)
                        if (resp.status == 409) {
                            closeModal();
                            exibeErro("Periodo já existente");
                        }
                        if (resp.status == 200) {
                            window.location.replace('listaEventos.html');
                        }
                        if (resp.status == 226) {
                            closeModal();
                            exibeErro("Todo o Periodo está ocupado");
                        }
                        if (resp.status == 200) {
                            window.location.replace('listaEventos.html');
                        }
                        if (resp.status == 400) {
                            closeModal();
                            exibeErro("Todo o periodo já está utilizado");
                        }

                    });
            })
    } */
}

function arrumaEdtBtn(b) {
    b.className = 'edit';
    b.innerHTML = '<i class="bx bx-edit"></i>';
    return b;
}

function arrumaExclBtn(b) {
    b.className = 'delete';
    b.innerHTML = '<i class="bx bx-trash"></i>';
    return b;
}

const deletarProfModal = (e) => {
    var myModal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
    myModal.hide();

    e.preventDefault();
    const myHeaders = new Headers();
    let fetchData = {
        method: 'DELETE',
        headers: myHeaders
    }
    // url = 'http://localhost:8080/api/tarefas';
    url = 'http://10.92.198.38:8080/api/tarefas';
    const newUrl = url + "/" + id;
    fetch(newUrl, fetchData)
        .then((resposta) => {
            // exibeErro("Excluido com sucesso !")
            setTimeout(function () {
                window.location.replace('index.html')
            }, 0);
        })
        .catch((error) => {
            closeModal();
            exibeErro("Não foi possível excluir o Evento");
        });
}



function transformBgColorInNumber(___c) {
    if (___c == '#FF4F4C') {
        return 1;
    } else if (___c == '#DE0F00') {
        return 2;
    } else if (___c == '#A60A27') {
        return 3;
    } else {
        return 0;
    }
}

function setOptionSelected(z) {
    var opt = "#opt" + z;
    const $select = document.querySelector("#periodo");
    const $option = $select.querySelector(opt);
    $select.value = $option.value;
}

function closeModal() {
    var btn = document.getElementById("btn-cancel");
    btn.addEventListener('click', function () {
        window.location.replace('listaEventos.html');
    })
    var btn1 = document.getElementById("btn-close");
    btn1.addEventListener("click", function () {
        window.location.replace('listaEventos.html');
    });
}

function getSelectColor(z) {
    if (z == 1) {
        color = '#FF4F4C'
    } else if (z == 2) {
        color = '#DE0F00'
    } else if (z == 3) {
        color = '#A60A27';
    } else {
        color = '#83818C'
    }
    return color;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function getDataFormatSomOne() {
    const date = new Date().toLocaleDateString();
    return dataAtual = date.slice(6, 10) + "-" + date.slice(3, 5) + "-" + date.slice(0, 2) + 1;
}

function getDataFormat() {
    const date = new Date().toLocaleDateString();
    return dataAtual = date.slice(6, 10) + "-" + date.slice(3, 5) + "-" + date.slice(0, 2);
}

function exibeErro(msg) {
    document.getElementById("mensagem").textContent = msg;

    document.getElementById("info").className = 'alert show showAlert';
    setTimeout(function () {
        document.getElementById("info").className = 'alert hide showAlert';
    }, 3000);

    var btn = document.querySelector(".close-btn");
    btn.addEventListener('click', function () {
        document.getElementById("info").className = 'alert hide showAlert';
    });
}