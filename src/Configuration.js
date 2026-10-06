import { translateString } from "./fileTranslator";

var numOfConf;
var confEncArray = [];
var transaux = '';

export function generateConfigurationsTree(dati, input, alphEnc, statesEnc){
    const div = document.getElementById("write_here");
    const par = document.getElementById("write_here_trad");
    var curr = dati.machine.initial_state;
    var inputArray = input.split('');
    var i = 0;
    
    let fakeArray = [...inputArray];
    fakeArray.splice(i, 0, curr);
    div.innerHTML = fakeArray.join('')

    numOfConf = 0;

    par.innerHTML += '</br>encoding of configurations:'
    let blank = `&#9633;`
    let epsilon = `&epsilon;`
    let init = `<span style = 'border-top: 1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${epsilon}", "${blank}", "${fakeArray.slice(1).join('')}","${curr}")</span> = `
    let initEnc = `&#955;x.(x(${alphEnc[epsilon]}) (${alphEnc[blank]}) (`;
    par.innerHTML += `<br/>${init + initEnc}`
    translateString(fakeArray.slice(1).join(''), par)
    par.innerHTML += `) (${statesEnc[curr]}))`

    ciclo: //label
    while(true){
        const trans = dati.transitions.find(
            t => (t.current_state == curr && t.read == inputArray[i])
        )

        div.innerHTML += ' &#8866; '
         
        if(!trans) i++

        if(trans?.direction == 'R')
            i++;//i = posizione testina
        else if(trans?.direction == 'L')
            i--
        let fakeArray = [...inputArray];

        fakeArray.splice(i, 0, trans?.next_state || curr)
        div.innerHTML += `${fakeArray.join('')}`
        
        if(dati.machine.final_states.includes(curr) && i == fakeArray.length-1){
            div.innerHTML += ' stringa accettata'
        }

        numOfConf++;

        //gestire caso direzione L
        var ReverseString = [];
        var beforeHead = fakeArray.slice(0, i - 1).join('')
        for(let n = i-1; n >= 0; n--){
            ReverseString = [...ReverseString, beforeHead[n]]
        }
        var conf = `<span style='border-top:1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${beforeHead == '' ? epsilon : beforeHead}","${trans ? fakeArray[i-1] : blank}","${fakeArray.slice(i+1).join('') || epsilon}","${curr}")</span> = `

        par.innerHTML += `<br/>${conf} &#955;x.(x`
        if(ReverseString.join('') == '')
            par.innerHTML += `(${alphEnc[epsilon]}`;
        else if(ReverseString.join('').length == 1)
            par.innerHTML += `(${alphEnc[ReverseString.join('')]}`;
        else
            translateString(ReverseString.join(''), par);

        par.innerHTML += `) (${alphEnc[fakeArray[i-1]] ?? alphEnc[blank]}`;

        if(!fakeArray.slice(i+1).join(''))
            par.innerHTML += `) (${alphEnc[epsilon]}`;
        else if(fakeArray.slice(i+1).join('').length == 1)
            par.innerHTML += `) (${alphEnc[fakeArray.slice(i+1).join('')]}`
        else{
            par.innerHTML += ') ('
            translateString(fakeArray.slice(i+1).join(''), par);
        }
        par.innerHTML += `) (${statesEnc[curr]}))`  

        if(dati.machine.final_states.includes(curr)) break;
        curr = trans.next_state;
    } 
    genConfArray();
}

function genConfArray(){
    const par_trad = document.getElementById("write_here_trad");
    /* creating array with configurations encoding */
    let text = par_trad.innerHTML.split(`encoding of configurations:`)[1]
    
    for(let j = 1; j <= numOfConf; j++){
        let text2 = text;
        let split = text2.split(`C<sub>${j}</sub></span> = `)[1]
        let idx = split.split(` = `)[0];
        
        if(j === numOfConf){
            confEncArray.push({
                index: idx,
                conf: split.split(` = `)[1],
                nOfConf: j
            });
        } else {
            confEncArray.push({
                index: idx,
                conf: split.split(` = `)[1].split(`<span `)[0],
                nOfConf: j
            });
        }
        console.log(confEncArray)
    }
}

export function pre_trans(allM){
    const par = document.getElementById('write_here_sim')
    let lambda = `&#955;`
    transaux = `(${lambda}x.${lambda}k.${lambda}y.y(${lambda}u.${lambda}a.${lambda}v.${lambda}q.q${Object.keys(allM).join('')}aukv))`;
    
    par.innerHTML = `Q<sub>i</sub> := M<sub>i</sub>{x ← ${lambda}z.transz}
        </br>T<sub>i</sub><sup>j</sup> := N<sub>i</sub><sup>j</sup>{x ← ${lambda}z.transz}</br>
        transaux := ${transaux}</br></br>`
}

export function generateTranslation(trans, nextTrans, dati, numOfEl, numOfStates, allM, nConf){
    const par = document.getElementById('write_here_sim')
    let lambda = `&#955;`
    let N = '';
    let AlphBlank = [...dati.machine.alphabet];
    let blank = `&#9633;`
    let epsilon = `&epsilon;`
    let theta = `&theta;`

    AlphBlank.push(blank)
    let numOfElBlank = (AlphBlank).length;

    let M = allM[`M<sub>${trans.current_state.split('_')[1]}</sub>`]

    let Q = '';
    let T = '';
    for(let j = 0; j <= numOfStates; j++)
        Q += `Q<sub>${j}</sub>`

    let P = '';
    let R = '';

    let l = trans.next_state.split('_')[1]
    let h = trans.read || blank
    let i = nextTrans?.read || blank

    if(dati.machine.final_states.includes(trans.current_state))
        N = `${lambda}u.${lambda}k.${lambda}v.k\<u,<span style='text-decoration:overline'>${trans.read}</span>, v, <span style='text-decoration:overline'>${trans.current_state}</span>\>`
    else if(trans.direction == '-')//la testina resta ferma: da implementare
        N = `${lambda}u.${lambda}k.${lambda}v.xk\<u,<span style='text-decoration:overline'>${trans.write}</span>, v, <span style='text-decoration:overline'>${trans.next_state}</span>\>`
    else if(trans.direction == 'L'){
        N = `${lambda}u.u`
        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[j] === blank)
                N += `P<sup>${l}, ${h}</sup>`
            else
                N += `P<sup>${l}, ${h}</sup><sub>${AlphBlank[j]}</sub>`
        }
        if(i === blank)
            P = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<<span style='text-decoration:overline'>${epsilon}</span>, <span style='text-decoration:overline'>${i}</span>, w, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
        else
            P = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<u, <span style='text-decoration:overline'>${i}</span>, w, <span style='text-decoration:overline'>${trans.next_state}</span>>)`//implementare append
    } else if(trans.direction == 'R'){
        N = `${lambda}u.${lambda}v.v`
        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[j] === blank){
                if(trans.direction === 'R')
                    N += `R`
                else if(trans.direction === 'L')
                    N += `L`
                N += `<sup>${l}, ${h}</sup>`
            } else {
                if(trans.direction === 'R')
                    N += `R`
                else if(trans.direction === 'L')
                    N += `L`
                N += `<sup>${l}, ${h}</sup><sub>${AlphBlank[j]}</sub>`
            }
        }
        if(i === blank)
            R = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<w, <span style='text-decoration:overline'>${i}</span>, <span style='text-decoration:overline'>${epsilon}</span>, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
        else
            R = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk<w, <span style='text-decoration:overline'>${i}</span>, u, <span style='text-decoration:overline'>${trans.next_state}</span>>)`
    }

    const confTrans = confEncArray.find(
        c => c.nOfConf === nConf
    )

    const overline = `<span style='border-top:1px solid black'>`
    const closeOv = `</span>`
    const C = `${overline}C<sub>${nConf}</sub>${closeOv}`
    const placeholder = `(${lambda}u.${lambda}a.${lambda}v.${lambda}q.q${Q}aukv)`

    let encoding = {}

    const content = confTrans.index.match(/<span[^>]*>([\s\S]*?)<\/span>/)[1];//estrae il contenuto dello span
    const values = [...content.matchAll(/"([^"]*)"/g)].map(m => m[1]);

    //s
    let s = `${overline}${values[0]}${closeOv}`
    encoding[s] = `${confTrans.conf.split('(x')[1].split(' ')[0]}`
    //a
    let a = `${overline}${values[1]}${closeOv}`
    encoding[a] = `${confTrans.conf.split(') ')[1]})`
    //r
    let r = `${overline}${values[2]}${closeOv}`
    encoding[r] = `${confTrans.conf.split(') ')[2]})`
    //q
    let q = `${overline}${values[3]}${closeOv}`
    encoding[q] = `${confTrans.conf.split(') ')[3].split('))')[0]})`

    let translation = '';
    translation += `transk${C} = ${theta}transauxk${C}</br>
        →<sub>det</sub>transaux(${lambda}z.${theta}transauxz)k${C}</br>
        = <span style='color:var(--olive)'>transaux</span>(${lambda}z.transz)k${C}</br>
        = <span style='color:var(--olive)'>${transaux}</span>(${lambda}z.transz)k${C}</br>
        →<sub>det</sub>${C}(${lambda}u.${lambda}a.${lambda}v.${lambda}q.((q${Object.keys(allM).join('')}){x ← ${lambda}z.transz}aukv))</br>
        = ${C}${placeholder}</br>
        = ${confTrans.index}${placeholder}</br>
        = (${lambda}x.(x${Object.keys(encoding).join(' ')}))${placeholder}</br>
        →<sub>det</sub>${placeholder}${Object.keys(encoding).join(' ')}</br>
        →<sub>det</sub>${q}${Q}${a} ${s}k${r}}</br>
        = ${encoding[q]}${Q}${a} ${s}k${r}</br>
        →<sub>det</sub><span style='color:var(--orange)'>Q<sub>${trans.current_state.split('_')[1]}</sub></span>${a} ${s}k${r}</br>
        = <span style='color:var(--orange)'>(${M.replaceAll('N', 'T')}u)</span>${a} ${s}k${r}</br>
        →<sub>det</sub>${a}${M.replaceAll('N', 'T').split(`a.a`)[1]}${s} k ${r}</br>
        = ${encoding[a]}${M.replaceAll('N', 'T').split(`a.a`)[1]}${s} k ${r}</br>
        →<sub>det</sub>T<sup>${values[1]}</sup><sub>${trans.current_state.split('_')[1]}</sub>${s} k ${r}</br>
        = ${N.replaceAll('x', `(${lambda}z.transz)`)}${s} k ${r}</br>
        </br>`

    /*if(dati.machine.final_states.includes(trans.current_state)){
        translation += ``
    } else if(trans.direction === '-') {

    } else if(trans.direction === 'L') {

    } else if(trans.direction === 'R') {

    }*/

    par.innerHTML += translation + '</br>';
}