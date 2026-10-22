var lambda_alp;
var lambda;

export function translator(dati, input, alphEnc, statesEnc){
    const par = document.getElementById("write_here_trad");
    if(!dati){
        console.error("Nessun file caricato");
        return;
    }    

    par.innerHTML = `<strong>ENCODING IN LAMBDA CALCULUS</strong></br>`;

    //codifica alfabeto
    const alphabet = [...dati.machine.alphabet, `&#9633;`, `&#949;`];//array

    par.innerHTML += `<br/>Encoding of the alphabet:</br>`;
    alphabet.forEach(symbol => {
        lambda_alp = alphabet
            .map(s => `&#955;x<sub>${s}</sub>`)
            .join("")//unisce gli elementi in una stringa
        
        alphEnc[symbol] = `${lambda_alp}.x<sub>${symbol}</sub>`
        par.innerHTML += `<div style='text-decoration:overline; display:inline'>${symbol}</div>: ${alphEnc[symbol]}<br>`
    });

    const states_alphabet = dati.machine.set_of_states;

    par.innerHTML += `<br/>Encoding of the set of states:</br>`;
    states_alphabet.forEach(symbol => {
        lambda = states_alphabet
            .map(s => `&#955;x<sub>${s}</sub>`)
            .join("")//unisce gli elementi in una stringa
        
        statesEnc[symbol] = `${lambda}.x<sub>${symbol}</sub>`
        par.innerHTML += `<div style='text-decoration:overline; display:inline'>${symbol}</div>: ${statesEnc[symbol]}<br>`
    });

    par.innerHTML += `<br/>Encoding of input string '${input}':`
    translateString(input, par);
    par.innerHTML += `<br/>`
}

export function translateString(string, par, stampa = true){
    var toReturn = ''
    const input = string + `ε`;

    if(input.length >= 1){
        input.split("").forEach(symbol => {
            let cod = `(${lambda_alp}.x<sub>${symbol}</sub>`
            if(stampa){
                par.innerHTML += cod
            } else {
                toReturn += cod
            }
        })
    } 

    let num = input.length;

    while(num > 0){
        let cod = `)`
        if(stampa){
            par.innerHTML += cod
        } else {
            toReturn += cod
        }
        num--;
    }

    if(!stampa){
        return toReturn
    }
}