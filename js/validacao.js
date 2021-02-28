export function valida(input) {
    const tipoInput = input.dataset.tipo

    if (validadores[tipoInput]) {
        validadores[tipoInput](input);
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    } else {
        input.parentElement.classList.add('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoInput, input);
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo de nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo de e-mail não pode estar vazio.',
        typeMismatch: 'O e-mail digitado não é valido.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio.',
        patternMismatch: 'A senha deve conter entre 6 e 12 caracteres, deve conter pelo menos uma letra minúscula e uma letra maiúscula, deve conter pelo menos um número e não deve conter símbolos.'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio.',
        customError: 'O usuário deve ter 18 anos ou mais para se cadastrar.'
    },
    cpf: {
        valueMissing: 'O campo de CPF de nascimento não pode estar vazio.',
        customError: 'O CPF digitado não é válido.'
    },
    cep: {
        valueMissing: 'O campo de CEP de nascimento não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'O CEP informado não foi encontrado.'
    },
    logradouro: {
        valueMissing: 'O campo de Logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de Cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de Estado não pode estar vazio.'
    },
    preco: {
        valueMissing: 'O campo de Preço não pode estar vazio.'
    }
}

function mostraMensagemDeErro(tipoInput, input) {
    let mensagem = '';

    tiposDeErro.forEach(erro => {
        if (input.validity[erro]) {
            mensagem = mensagensDeErro[tipoInput][erro];
        }
    })

    return mensagem;
}

const validadores = {
    dataNascimento: input => validaDataNascimento(input),
    cpf: input => validaCPF(input),
    cep: input => recuperarCEP(input)
}

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value);
    let mensagem = '';

    if (!maiorQue18(dataRecebida)) {
        mensagem = 'O usuário deve ter 18 anos ou mais para se cadastrar.'
    }

    input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
    const dataAtual = new Date();
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate());

    return (dataMais18 <= dataAtual);
}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '');
    let mensagem = '';

    if (!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem);
}

function checaCPFRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ];

    let cpfEhValido = true;
    valoresRepetidos.forEach(valor => {
        if (valor == cpf) {
            cpfEhValido = false;
        }
    })
    return cpfEhValido;
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10;
    return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
    if (multiplicador >= 12) {
        return true;
    }

    let multiplicadorInicial = multiplicador;
    let soma = 0;
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('');
    const digitoVerificador = cpf.charAt(multiplicador - 1);

    for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
        contador++;
    }

    if (digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1);
    }

    return false;
}

function confirmaDigito(soma) {
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto;
}

function recuperarCEP(input) {
    const cep = input.value.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(resp =>
            resp.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity('O CEP informado não foi encontrado.');
                    limpaCamposComCEP(data)
                    return
                }
                input.setCustomValidity('');
                preencheCamposComCEP(data);
                return
            }
        );
    } else {
        limpaCamposComCEP();
    }
}

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    const cidade = document.querySelector('[data-tipo="cidade"]');
    const estado = document.querySelector('[data-tipo="estado"]');

    logradouro.value = data.logradouro;
    logradouro.disabled = true;
    cidade.value = data.localidade;
    cidade.disabled = true;
    estado.value = data.uf;
    estado.disabled = true;
}

function limpaCamposComCEP() {
    
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    logradouro.value = '';
    logradouro.disabled = false;
    logradouro.parentElement.classList.remove('input-container--invalido');
    logradouro.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    
    const cidade = document.querySelector('[data-tipo="cidade"]');
    cidade.value = '';
    cidade.disabled = false;
    cidade.parentElement.classList.remove('input-container--invalido');
    cidade.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    
    const estado = document.querySelector('[data-tipo="estado"]');
    estado.value = '';
    estado.disabled = false;
    estado.parentElement.classList.remove('input-container--invalido');
    estado.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
}