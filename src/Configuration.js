import { translateString } from "./fileTranslator";

var numOfConf;
var confEncArray = [];
var transaux = '';

export function generateConfigurationsTree(dati, input, alphEnc, statesEnc, setAcceptedString){
    const div = document.getElementById("write_here");
    const par = document.getElementById("write_here_trad");
    var curr = dati.machine.initial_state;
    var inputArray = input.split('');
    var i = 0;
    
    let plchldFakeArray = [...inputArray]
    let fakeArray = [...inputArray];
    fakeArray.splice(i, 0, curr);

    div.innerHTML = '';

    numOfConf = 0;

    //traduzione prima configurazione
    par.innerHTML += '</br>encoding of configurations:'
    let blank = `&#9633;`
    let epsilon = `&#949;`
    let init = `<span style = 'border-top: 1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${epsilon}", "${blank}", "${fakeArray.slice(1).join('')}","${curr}")</span> = `
    let initEnc = `&#955;x.(x(${alphEnc[epsilon]}) (${alphEnc[blank]}) (`;
    par.innerHTML += `<br/>${init + initEnc}`
    translateString(fakeArray.slice(1).join(''), par)
    par.innerHTML += `) (${statesEnc[curr]}))`

    var pre_write = '';

    ciclo: //label
    while(true){
        const trans = dati.transitions.find(
            t => (t.current_state == curr && t.read == plchldFakeArray[i])
        )

        /*if(!trans && dati.machine.final_state !== curr){
            div.innerHTML += ' transizione non trovata'
            par.innerHTML += '</br>transizione non trovata'
            break ciclo
        }*/

        if(pre_write !== '') plchldFakeArray[i-1] = pre_write
        let fakeArray = [...plchldFakeArray];
        plchldFakeArray = [...fakeArray]
        pre_write = trans?.write

        fakeArray.splice(i, 0, curr)
        div.innerHTML += `${fakeArray.join('')}`
        div.innerHTML += ' &#8866; '

        numOfConf++;

        //gestire caso direzione L
        var ReverseString = [];
        var beforeHead = i > 0 ? fakeArray.slice(0, i).join('') : epsilon
        var afterHead = i < fakeArray.length - 2 ? fakeArray.slice(i+2).join('') : epsilon
        var head = i < fakeArray.length - 1 ? fakeArray[i+1] : blank
        var state = fakeArray[i]

        for(let n = i-1; n >= 0; n--){
            ReverseString = [...ReverseString, beforeHead[n]]
        }

        var conf = `<span style='border-top:1px solid black'>C<sub>${numOfConf}</sub></span> = <span style='text-decoration:overline; display:inline'>("${beforeHead}","${head}","${afterHead}","${state}")</span> = `

        par.innerHTML += `<br/>${conf} &#955;x.(x`
        if(beforeHead == epsilon){
            par.innerHTML += `(${alphEnc[epsilon]}`;
        }else if(beforeHead.length == 1)
            par.innerHTML += `(${alphEnc[beforeHead]}`;
        else if(beforeHead.length > 1)
            translateString(beforeHead.split('').reverse().join(''), par);

        par.innerHTML += `) (${alphEnc[head]}`;

        if(afterHead == epsilon){
            par.innerHTML += `) (${alphEnc[epsilon]}`
        } else if(afterHead.length == 1)
            par.innerHTML += `) (${alphEnc[afterHead]}`
        else if(afterHead.length > 1){
            par.innerHTML += ') ('
            translateString(afterHead.split('').reverse().join(''), par);
        }
        par.innerHTML += `) (${statesEnc[state]}))`  

        if(dati.machine.final_state === curr){
            setAcceptedString(true)
            div.innerHTML += ' stringa accettata'
            break ciclo
        } 
        if(!trans && dati.machine.final_state !== curr){
            div.innerHTML += ' transizione non trovata'
            par.innerHTML += '</br>transizione non trovata'
            break ciclo
        }
        
        if(!trans) i++

        if(trans?.direction == 'R'){
            i++;//posizione testina
        }
        else if(trans?.direction == 'L'){
            i--
        }
        
        curr = trans.next_state;
    } 
    genConfArray();
}

function genConfArray(){
    confEncArray = []
    const par_trad = document.getElementById("write_here_trad");
    /* creating array with configurations encoding */
    let text = par_trad.innerHTML.split(`encoding of configurations:`)[1]
    
    for(let j = 0; j <= numOfConf; j++){
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
    }
}

export function pre_trans(allM){
    const par = document.getElementById('write_here_sim')
    let lambda = `&#955;`
    transaux = `(${lambda}x.${lambda}k.${lambda}y.y(${lambda}u.${lambda}a.${lambda}v.${lambda}q.q${Object.keys(allM).join('')}aukv))`;
    
    par.innerHTML = `Q<sub>i</sub> := M<sub>i</sub>{x ← ${lambda}z.transz}</br>
        T<sub>i</sub><sup>j</sup> := N<sub>i</sub><sup>j</sup>{x ← ${lambda}z.transz}</br>
        V<sub>i</sub> := R<sub>i</sub>{x ← ${lambda}z.transz}</br>
        U<sub>i</sub> := P<sub>i</sub>{x ← ${lambda}z.transz}</br>
        transaux := ${transaux}</br></br>`
}

export function generateTranslation(trans, nextTrans, dati, alphEnc, numOfStates, allM, nConf, input){
    const par = document.getElementById('write_here_sim')
    let lambda = `&#955;`
    let N = '';
    let AlphBlank = [...dati.machine.alphabet];
    let blank = `&#9633;`
    let epsilon = `&epsilon;`
    let theta = `&theta;`
    let sigma = `&#931;`

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
    let h = trans.write || blank
    let i = nextTrans?.read || blank

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
    
    let sRevArray = [];
        let sEl = values[0].split('')
        for(let n = sEl.length; n >= 0 ; n--){
            sRevArray = [...sRevArray, sEl[n]]
    }

    let encodingKeys = []
    //s
    let s = `${overline}${sRevArray.join('')}${closeOv}`
    encoding[s] = `${confTrans.conf.split('(x')[1].split(' ')[0]}`
    encodingKeys.push(s)

    let sNotRev = values[0]

    //a
    let a = `${overline}${values[1]}${closeOv}`
    encoding[a] = `${confTrans.conf.split(') ')[1]})`
    encodingKeys.push(a)

    //r
    let r = `${overline}${values[2]}${closeOv}`
    encoding[r] = `${confTrans.conf.split(') ')[2]})`
    encodingKeys.push(r)

    //q
    let q = `${overline}${values[3]}${closeOv}`
    encoding[q] = `${confTrans.conf.split(') ')[3].split('))')[0]})`
    encodingKeys.push(q)

    let translation = '';

    if(nConf === 0){
        translation += `${overline}M${closeOv} ${overline}s${closeOv} = init(${lambda}y.trans(${lambda}x.final(${lambda}w.w)x)y)${overline}${input}${closeOv}</br></br>`
        
        translation += `initk${overline}${input}${closeOv}</br>
            = (${lambda}k.lift<sub>${sigma}</sub>(${lambda}r.k&lt;${overline}${epsilon}${closeOv}, ${overline}${blank}${closeOv}, r, ${overline}${dati.machine.initial_state}${closeOv}&gt;))k${overline}${input}${closeOv}</br>
            →<sub>det</sub> lift<sub>${sigma}</sub>(${lambda}r.(k&lt;${overline}${epsilon}${closeOv}, ${overline}${blank}${closeOv}, r, ${overline}${dati.machine.initial_state}${closeOv}&gt;))${overline}${input}${closeOv}</br>
            →<sub>det</sub> (${lambda}r.(k&lt;${overline}${epsilon}${closeOv}, ${overline}${blank}${closeOv}, r, ${overline}${dati.machine.initial_state}${closeOv}&gt;))${overline}${input}${closeOv}</br>
            →<sub>det</sub> k&lt;${overline}${epsilon}${closeOv}, ${overline}${blank}${closeOv}, ${overline}${input}${closeOv}, ${overline}${dati.machine.initial_state}${closeOv}&gt;</br>
            = k${overline}(${epsilon}, ${blank}, ${input}, ${dati.machine.initial_state})${closeOv}</br>
            = <span style='color:var(--orange)'>k</span>${overline}C<sub>${nConf}</sub>${closeOv}</br>
            = <span style='color:var(--orange)'>(${lambda}y.trans(${lambda}x.final(${lambda}w.w)x)y)</span>C<sub>${nConf}</sub>${closeOv}</br>
            = transkC<sub>${nConf}</sub>${closeOv}</br></br>`
    }

    translation += `transk${C} = ${theta}transauxk${C}</br>
        →<sub>det</sub>transaux(${lambda}z.${theta}transauxz)k${C}</br>
        = <span style='color:var(--olive)'>transaux</span>(${lambda}z.transz)k${C}</br>
        = <span style='color:var(--olive)'>${transaux}</span>(${lambda}z.transz)k${C}</br>
        →<sub>det</sub>${C}(${lambda}u.${lambda}a.${lambda}v.${lambda}q.((q${Object.keys(allM).join('')}){x ← ${lambda}z.transz}aukv))</br>
        = ${C}${placeholder}</br>
        = ${confTrans.index}${placeholder}</br>
        = (${lambda}x.(x${encodingKeys.join(' ')}))${placeholder}</br>
        →<sub>det</sub>${placeholder}${encodingKeys.join(' ')}</br>
        →<sub>det</sub>${q}${Q}${a} ${s}k${r}</br>
        = ${encoding[q]}${Q}${a} ${s}k${r}</br>
        →<sub>det</sub><span style='color:var(--orange)'>Q<sub>${trans.current_state.split('_')[1]}</sub></span>${a} ${s}k${r}</br>
        = <span style='color:var(--orange)'>(${M.replaceAll('N', 'T')}u)</span>${a} ${s}k${r}</br>
        →<sub>det</sub>${a}${M.replaceAll('N', 'T').split(`a.a`)[1]}${s} k ${r}</br>
        = ${encoding[a]}${M.replaceAll('N', 'T').split(`a.a`)[1]}${s} k ${r}</br>
        →<sub>det</sub>T<sup>${values[1]}</sup><sub>${trans.current_state.split('_')[1]}</sub>${s} k ${r}</br>`
    
    if(dati.machine.final_state === trans.current_state){
        N = `${lambda}u.${lambda}k.${lambda}v.k&lt;u,${overline}${trans.read}${closeOv}, v, ${overline}${trans.current_state}${closeOv}&gt;`
        translation += `=${N}${s} k ${r}</br>
            →k&lt;${encodingKeys.join(' ')}&gt;</br>
            =k${confTrans.index}</br>
            =<span style='color: var(--orange)'>k</span>${C}</br></br>`

        translation += `CONVENZIONE: C<sub>fin</sub> := (${epsilon}, ${blank}, ${input}, ${dati.machine.final_state})</br>`
        translation += `<span style='color: var(--orange)'>(${lambda}x.final(${lambda}w.w)x)</span> ${overline}C<sub>fin</sub>${closeOv}</br>
        = (${lambda}k.${lambda}y.y(${lambda}v.${lambda}a.${lambda}s.${lambda}q.flat<sub>${sigma}<sub>${blank}</sub></sub>ks))k${overline}C<sub>fin</sub>${closeOv}</br>
        →<sub>det</sub> ${overline}C<sub>fin</sub>${closeOv}(${lambda}v.${lambda}a.${lambda}s.${lambda}q.flat<sub>${sigma}<sub>${blank}</sub></sub>ks)</br>
        = ${overline}(${epsilon}, ${blank}, ${input}, ${dati.machine.final_state})${closeOv}(${lambda}v.${lambda}a.${lambda}s.${lambda}q.flat<sub>${sigma}<sub>${blank}</sub></sub>ks)</br>
        = (${lambda}x.x${overline}${epsilon}${closeOv} ${overline}${blank}${closeOv} ${overline}${input}${closeOv} ${overline}${dati.machine.final_state}${closeOv})(${lambda}v.${lambda}a.${lambda}s.${lambda}q.flat<sub>${sigma}<sub>${blank}</sub></sub>ks)</br>
        →<sub>det</sub> (${lambda}v.${lambda}a.${lambda}s.${lambda}q.flat<sub>${sigma}<sub>${blank}</sub></sub>ks)${overline}${epsilon}${closeOv} ${overline}${blank}${closeOv} ${overline}${input}${closeOv} ${overline}${dati.machine.final_state}${closeOv}</br>
        →<sub>det</sub> flat<sub>${sigma}<sub>${blank}</sub></sub>k${overline}${input}${closeOv}</br>
        →<sub>det</sub> k${overline}${input}${closeOv}`
    } else if(trans.direction === '-'){
        N = `${lambda}u.${lambda}k.${lambda}v.xk&lt;u,${overline}${trans.write}${closeOv}, v, ${overline}${trans.next_state}${closeOv}&gt;`
        let Nrplc = N.replaceAll('x', `{${lambda}z.transz}`)
        translation += `= (${Nrplc})${s}k${r}</br>
            →<sub>det</sub> ${Nrplc.split('v.')[1].replace('u,', `${s},`).replace('v,', `${r},`).split('&gt;)')}</br>
            = transk${overline}(${sNotRev}, ${a}, ${r}, q_${l})${closeOv}</br>
            = transk${overline}C<sub>${nConf+1}</sub>${closeOv}</br>`
    } else if(trans.direction === 'L') {
        N = `${lambda}u.u`

        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[j] === blank){
                N += `P<sup>${l}, ${h}</sup>`
            }else{
                N += `P<sup>${l}, ${h}</sup><sub>${AlphBlank[j]}</sub>`
            }
        }

        let sRev = values[0].split('').reverse().join('')
        let sRevOv = `${overline}${sRev}${closeOv}`
        let P_abb = '';
        let a_p = sRev.split('')[0]
        let pRev = sRev.split('').slice(1).length > 0 ? sRev.split('').slice(1) : epsilon

        if(s === blank){
            P = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk&lt;${overline}${epsilon}${closeOv}, ${overline}${s}${closeOv}, w, ${overline}${trans.next_state}${closeOv}&gt;)`
            P_abb = `P<sup>${l}, ${h}</sup>`
        }else{
            P = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk&lt;u, ${overline}${s}${closeOv}, w, ${overline}${trans.next_state}${closeOv}&gt;)`//implementare append
            P_abb = `P<sup>${l}, ${h}</sup><sub>${a_p}</sub>`
        }

        let Nrplc = N.replaceAll('P', 'U')
        let plhold = P.replace('x', `(${lambda}z.transz)`)

        translation += `= (${N}{x ← ${lambda}z.transz})${sRevOv}k${r}</br>
            = (${Nrplc})${sRevOv}k${r}</br>
            →<sub>det</sub> ${Nrplc.split('u.')[1].replace('u', `${sRevOv}`)}k${r}</br>`
        if(values[0] == 'ε'){
            translation += `= ${encoding[s]}${Nrplc.split('u.u')[1]}k${r}</br>
                →<sub>det</sub> U<sup>${l}, ${h}</sup>k${r}</br>
                = (${plhold})k${r}</br>
                →<sub>det</sub> ${plhold.split('k.')[1].split('))')[0]})${r}</br>
                →<sub>det</sub> ${plhold.split('</sup>')[1]}${overline}(${h}${r})${closeOv}</br>
                = ${plhold.split(`w.`)[1].replace('w', `${overline}(${h}${r})${closeOv}`).split(`&gt;)`)}&gt;</br>
                = (${lambda}z.transz)k${overline}(ε, ${blank}, ${overline}(${h}${r})${closeOv}, q_${l})${closeOv}`
        } else { 
            translation += `= ${overline}${a_p}${closeOv} ${overline}${pRev}${closeOv}${Nrplc.split('u.u')[1]}k${r}</br>
                = (${alphEnc[a_p]}${overline}${pRev}${closeOv})${Nrplc.split('u.u')[1]}k${r}</br>
                →<sub>det</sub> ${P_abb.replace('P', 'U')}${overline}${pRev}${closeOv}k${r}</br>
                = (${plhold})${overline}${pRev}${closeOv}k${r}</br>
                →<sub>det</sub> ${plhold.split(`${lambda}k.`)[1].replace('u,', `${overline}${pRev}${closeOv}, `)}${r}</br>
                →<sub>det</sub> ${plhold.split(`</sup>`)[1].replace('u,', `${overline}${pRev}${closeOv}, `)}${overline}(${h}${r})${closeOv}</br>
                →<sub>det</sub> ${plhold.split(`w.`)[1].replace('u,', `${overline}${pRev}${closeOv}, `).replace('w', `${overline}(${h}${r})${closeOv}`).split('&gt;)')[0]}&gt;</br>
                = (${lambda}z.transz)k${overline}(${pRev !== epsilon ? pRev.split('').reverse().join('') : epsilon}, ${a_p}, ${h !== blank ? h : blank}${r}, q_${l})${closeOv}</br>`
        }
        translation += `= (${lambda}z.transz)k${overline}C<sub>${nConf+1}</sub>${closeOv}</br>
                →<sub>det</sub> transk${overline}C<sub>${nConf+1}</sub>${closeOv}</br>`
    } else if(trans.direction == 'R'){
        N = `${lambda}u.${lambda}k.${lambda}v.v`
        for(let j = 0; j < numOfElBlank; j++){
            if(AlphBlank[j] === blank){
                N += `R`
                N += `<sup>${l}, ${h}</sup>`
            } else {
                N += `R`
                N += `<sup>${l}, ${h}</sup><sub>${AlphBlank[j]}</sub>`
            }
        }
        N += `ku`
        let a_p = values[2] == 'ε' ? blank : r.split('>')[1][0] 
        
        let R_abb = ''
        if(i === blank){
            R = `${lambda}k.append<sup>${h}</sup>(${lambda}w.xk&lt;w, ${overline}${i}${closeOv}, ${overline}${epsilon}${closeOv}, ${overline}${trans.next_state}${closeOv}&gt;)`
            R_abb = `R<sup>${l}, ${h}</sup>`
        } else {
            R = `${lambda}u.${lambda}k.append<sup>${h}</sup>(${lambda}w.xk&lt;w, ${overline}${i}${closeOv}, u, ${overline}${trans.next_state}${closeOv}&gt;)`
            R_abb = `R<sup>${l}, ${h}</sup><sub>${a_p}</sub>`
        }
        translation += `=(${N}){x ← ${lambda}z.transz}${s} k ${r}</br>
            =(${N.replaceAll('R', 'V')})${s} k ${r}</br>
            →<sub>det</sub>${r}${N.replaceAll('R','V').split('v.v')[1].split('k')[0]}k${s}</br>`

        var plhold = R.replace('x', `(${lambda}z.transz)`)
        var rplcU = r.split('>')[1].split('</')[0].substring(1) || epsilon 
        if(values[2] == 'ε'){
            translation += `= ${encoding[r]}${N.replaceAll('R','V').split('v.v')[1].split('k')[0]}k${s}</br>
                →<sub>det</sub>V<sup>${l}, ${h}</sup>k${s}</br>
                = (${plhold})k${s}</br>
                →<sub>det</sub>(${plhold.split('k.')[1].split('))')[0]})${s}</br>
                →<sub>det</sub>${plhold.split('</sup>')[1].replace('u,', `${overline}${rplcU}${closeOv}, `)}${overline}(${a}${s})${closeOv}</br>
                →<sub>det</sub>${plhold.split(`w.`)[1].replace('u,', `${overline}${rplcU}${closeOv}, `).replace('w', `${overline}(${a}${s})${closeOv}`).split(`&gt;)`)}&gt;</br>`
        } else { 
            translation += `= ${overline}${r.split('>')[1][0]}${closeOv} ${overline}${rplcU}${closeOv}${N.replaceAll('R','V').split('v.v')[1].split('k')[0]}k${s}</br>
                = (${alphEnc[a_p]}${overline}${rplcU}${closeOv})${N.replaceAll('R','V').split('v.v')[1].split('k')[0]}k${s}</br>
                →<sub>det</sub>${R_abb.replace('R', 'V')}${overline}${rplcU}${closeOv}k${s}</br>
                = ${plhold}${overline}${rplcU}${closeOv}k${s}</br>
                →<sub>det</sub>${plhold.split(`${lambda}k.`)[1].replace('u,', `${overline}${rplcU}${closeOv}, `)}${s}</br>
                →<sub>det</sub>${plhold.split(`</sup>`)[1].replace('u,', `${overline}${rplcU}${closeOv}, `)}${overline}(${h}${s})${closeOv}</br>
                →<sub>det</sub>${plhold.split(`w.`)[1].replace('u,', `${overline}${rplcU}${closeOv}, `).replace('w', `${overline}(${h}${s})${closeOv}`).split('&gt;)')[0]}&gt;</br>
                →<sub>det</sub>transk${plhold.split(`)k`)[1].replace('u,', `${overline}${rplcU}${closeOv}, `).replace('w', `${overline}(${h}${values[0] !== 'ε' ? s : ""})${closeOv}`).split('&gt;)')[0]}&gt;</br>`
        }
        translation += `= transk${overline}(${values[0] !== 'ε' ? sNotRev : ""}${h !== blank ? h : 'ε'}, ${a_p}, ${rplcU}, q_${l})${closeOv}</br>
                = transk${overline}C<sub>${nConf+1}</sub>${closeOv}</br>`
    }
    
   
    par.innerHTML += translation + '</br>';
}