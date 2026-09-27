import { translateString } from "./fileTranslator";

var numOfConf;

export function generateConfigurationsTree(dati, input, alphEnc, statesEnc){
    const div = document.getElementById("write_here");
    const par = document.getElementById("write_here_trad");
    var curr = dati.machine.initial_state;
    var inputArray = input.split('');
    var i = 0;
    var end = inputArray.length;
    
    let fakeArray = [...inputArray];
    fakeArray.splice(i, 0, curr);
    div.innerHTML = fakeArray.join('')

    numOfConf = 0;

    par.innerHTML += '</br>encoding of configurations:'
    let blank = `&#9633;`
    let epsilon = `&epsilon;`
    let init = `<span style = 'border-top: 1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${epsilon}", "${blank}", "${fakeArray.slice(1).join('')}","${curr}")</span> = `
    let initEnc = `&#955;x.(x(${alphEnc[epsilon]})( ${alphEnc[blank]})(`;
    par.innerHTML += `<br/>${init + initEnc}`
    translateString(fakeArray.slice(1).join(''), par)
    par.innerHTML += `)( ${statesEnc[curr]}))`

    for(let j = 0; j <= end+1; j++){
        dati.transitions.forEach(trans => {
            if(trans.current_state == curr && trans.read == inputArray[i]){
                div.innerHTML += ' &#8866; '
                
                if(trans.direction == 'R')
                    i++;
                else if(trans.direction == 'L')
                    i--
                let fakeArray = [...inputArray];

                fakeArray.splice(i, 0, trans.next_state)
                div.innerHTML += `${fakeArray.join('')}`

                curr = trans.next_state;
                if(curr == dati.machine.final_states && i == fakeArray.length-1){
                    div.innerHTML += ' stringa accettata'
                }
                
                numOfConf++;

                //gestire caso direzione L
                var ReverseString = [];
                var beforeHead = fakeArray.slice(0, i).join('')
                for(let n = i-1; n >= 0; n--){
                    ReverseString = [...ReverseString, beforeHead[n]]
                }
                var conf = `<span style='border-top:1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${beforeHead == '' ? epsilon : beforeHead}","${fakeArray[i+1] || blank}","${fakeArray.slice(i+2).join('') || epsilon}","${curr}")</span> = `

                par.innerHTML += `<br/>${conf} &#955;x.(x`
                if(ReverseString.join('') == '')
                    par.innerHTML += text;
                else if(ReverseString.join('').length == 1)
                    par.innerHTML += `(${alphEnc[ReverseString.join('')]}`;
                else
                    translateString(ReverseString.join(''), par);

                par.innerHTML += `)( ${alphEnc[fakeArray[i+1]] ?? alphEnc[blank]}`;

                if(!fakeArray.slice(i+2).join(''))
                    par.innerHTML += `)( ${alphEnc[epsilon]}`;
                else if(fakeArray.slice(i+2).join('').length == 1)
                    par.innerHTML += `)( ${alphEnc[fakeArray.slice(i+2).join('')]}`
                else
                    translateString(fakeArray.slice(i+2).join(''), par);

                par.innerHTML += `)( ${statesEnc[curr]}))`
            }
        });
    } 
}

export function generateTranslation(trans, nextTrans, dati, numOfEl, numOfStates, allM){
    const par = document.getElementById('write_here_sim')
    const par_trad = document.getElementById("write_here_trad");
    let lambda = `&#955;`
    let N = '';
    let AlphBlank = [...dati.machine.alphabet];
    let blank = `&#9633;`
    let epsilon = `&epsilon;`
        
    AlphBlank.push(blank)
    let numOfElBlank = (AlphBlank).length;

    let M = allM[`M<sub>${trans.current_state.split('_')[1]}</sub>`]
    
    let P = '';
    let R = '';

    let l = trans.next_state.split('_')[1]
    let h = trans.write
    let i = nextTrans?.read

    if(dati.machine.final_states.includes(trans.current_state))
        N = `${lambda}u.${lambda}k.${lambda}v.k<u,<span style='text-decoration:overline'>${trans.read}</span>, v, <span style='text-decoration:overline'>${trans.current_state}</span>`
    else if(trans.direction == '-')//la testina resta ferma: da implementare
        N = `${lambda}u.${lambda}k.${lambda}v.${lambda}k<u,<span style='text-decoration:overline'>${trans.write}</span>, v, <span style='text-decoration:overline'>${trans.next_state}</span>`
    else if(trans.direction == 'L'){
        N = `${lambda}u.u`
        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[numOfElBlank] === blank)
                N += `P<sup>${l}, ${h}</sup>`
            N += `P<sup>${l}, ${h}</sup><sub>${AlphBlank[numOfElBlank]}</sub>`
        }
        if(i === blank)
            P = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<<span style='text-decoration:overline'>${epsilon}</span>, <span style='text-decoration:overline'>${i}</span>, w, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
        else
            P = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<u, <span style='text-decoration:overline'>${i}</span>, w, <span style='text-decoration:overline'>${trans.next_state}</span>>)`//implementare append
    } else if(trans.direction == 'R'){
        N = `${lambda}u.${lambda}v.v`
        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[numOfElBlank] === blank)
                N += `R<sup>${l}, ${h}</sup>`
            N += `R<sup>${l}, ${h}</sup><sub>${AlphBlank[numOfElBlank]}</sub>`
        }
        if(i === blank)
            R = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<w, <span style='text-decoration:overline'>${i}</span>, <span style='text-decoration:overline'>${epsilon}</span>, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
        else
            R = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<w, <span style='text-decoration:overline'>${i}</span>, u, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
    }

    let transaux = `(${lambda}x.${lambda}k.${lambda}y.y(${lambda}u.${lambda}a.${lambda}v.${lambda}q.q${Object.keys(allM).join('')}aukv))`;

    /* creating array with configurations encoding */
    let text = par_trad.innerHTML.split(`encoding of configurations:`)[1]
    
    let confEncArray = {}
    for(let j = 0; j <= numOfConf; j++){
        let text2 = text;
        let index = text2.split(`C<sub>${j}</sub></span> = `)[1].split(`</span> = `)[0];
        
        if(j === numOfConf)
            confEncArray[index] = text2.split(`</span> = `)[1]
        else 
            confEncArray[index] = text2.split(`</span> = `)[1].split(`<span style="border-top: 1px solid black">C<sub>${j+1}</sub></span> = `)[0]
    }

    //par.innerHTML += `transk<span style='text-decoration:overline'></span>`
    par.innerHTML += transaux
    
}