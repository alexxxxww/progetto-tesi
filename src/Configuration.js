import { translateString } from "./fileTranslator";

var encConfArray = [];

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

    var numOfConf = 0;

    par.innerHTML += '</br>encoding of configurations:'
    var blank = `&#9633;`
    var epsilon = `&epsilon;`
    var init = `<span style = 'border-top: 1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${epsilon}", "${blank}", "${fakeArray.slice(1).join('')}","${curr}")</span> = `
    var initEnc = `&#955;x.(x(${alphEnc[epsilon]})( ${alphEnc[blank]})(`;
    par.innerHTML += `<br/>${init + initEnc}`
    translateString(fakeArray.slice(1).join(''), par)
    par.innerHTML += `)( ${statesEnc[curr]}))`

    encConfArray.push(initEnc)

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

                let confEnc = '';
                let text = '';
                par.innerHTML += `<br/>${conf} &#955;x.(x`
                text = `&#955;x.(x`
                if(ReverseString.join('') == ''){
                    text += `(${alphEnc[epsilon]}`
                    par.innerHTML += text;
                } else if(ReverseString.join('').length == 1){
                    text += `(${alphEnc[ReverseString.join('')]}`;
                    par.innerHTML += text;
                } else {
                    text += translateString(ReverseString.join(''), par);
                }

                confEnc = text

                text = `)( ${alphEnc[fakeArray[i+1]] ?? alphEnc[blank]}`
                par.innerHTML += text;

                confEnc += text

                if(!fakeArray.slice(i+2).join('')){
                    text = `)( ${alphEnc[epsilon]}`
                    par.innerHTML += text;
                } else if(fakeArray.slice(i+2).join('').length == 1){
                    text = `)( ${alphEnc[fakeArray.slice(i+2).join('')]}`
                    par.innerHTML += text;
                }else{ 
                    text = translateString(fakeArray.slice(i+2).join(''), par);
                }
                confEnc += text;

                text = `)( ${statesEnc[curr]}))`

                confEnc += text;
                par.innerHTML += text
                encConfArray.push(confEnc);
            }
        });
    }  
    //console.log(encConfArray)
}

export function generateTranslation(trans, dati, numOfEl, numOfStates, transauxM, NinM){
    const par = document.getElementById('write_here_sim')
    let lambda = `&#955;`
    let M = '';
    let N = '';

    for(let j = 0; j < numOfStates; j++)
        if(trans.current_state == `q_${j}`)
            M = `${lambda}a.a${NinM}`

    if(dati.machine.final_states.includes(trans.current_state))
        N = `${lambda}u.${lambda}k.${lambda}v.k<u,<span style='text-decoration:overline'>${trans.read}</span>, v, <span style='text-decoration:overline'>${trans.current_state}</span>`
    else if(trans.direction == '-')//la testina resta ferma: da implementare
        N = `${lambda}u.${lambda}k.${lambda}v.${lambda}k<u,<span style='text-decoration:overline'>${trans.write}</span>, v, <span style='text-decoration:overline'>${trans.next_state}</span>`
    else if(trans.direction == 'L'){
        let l = trans.next_state.split('_')[1]
        let h = trans.write
        N = `${lambda}u.u`
    }
    let transaux = `(${lambda}x.${lambda}k.${lambda}y.y(${lambda}u.${lambda}a.${lambda}v.${lambda}q.q${transauxM}aukv))`;

    par.innerHTML += transaux
    
}