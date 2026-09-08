import { translateString } from "./fileTranslator";

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

    var blank = `&#9633;`
    var epsilon = `&epsilon;`
    var init = `<div style='text-decoration:overline; display:inline'>("${epsilon}", "${blank}", "${fakeArray.slice(1).join('')}","${curr}")</div> = `
    var initEnc = `(${alphEnc[epsilon]}, ${alphEnc[blank]},`;
    par.innerHTML += `<br/>${init + initEnc}`
    translateString(fakeArray.slice(1).join(''), par)
    par.innerHTML += `, ${statesEnc[curr]})`

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

                console.log(fakeArray.length)
                console.log(i)
                curr = trans.next_state;
                if(curr == dati.machine.final_states && i == fakeArray.length-1){
                    div.innerHTML += ' stringa accettata'
                }
                
                //gestire caso direzione L
                var ReverseString = [];
                var beforeHead = fakeArray.slice(0, i).join('')
                for(let n = i-1; n >= 0; n--){
                    ReverseString = [...ReverseString, beforeHead[n]]
                }
                var conf = `<div style='text-decoration:overline; display:inline'>("${beforeHead == '' ? epsilon : beforeHead}","${fakeArray[i+1] || blank}","${fakeArray.slice(i+2).join('') || epsilon}","${curr}")</div> = `

                par.innerHTML += `<br/>${conf}`
                if(ReverseString.join('') == '')
                    par.innerHTML += `(${alphEnc[epsilon]}`;
                else if(ReverseString.join('').length == 1)
                    par.innerHTML += `(${alphEnc[ReverseString.join('')]}`;
                else 
                    translateString(ReverseString.join(''), par);

                par.innerHTML += `, ${alphEnc[fakeArray[i+1]] ?? alphEnc[blank]}`

                if(!fakeArray.slice(i+2).join(''))
                    par.innerHTML += `, ${alphEnc[epsilon]}`;
                else if(fakeArray.slice(i+2).join('').length == 1)
                    par.innerHTML += `, ${alphEnc[fakeArray.slice(i+2).join('')]}`;
                else 
                    translateString(fakeArray.slice(i+2).join(''), par);
                
                par.innerHTML += `, ${statesEnc[curr]})`
            }
        });
    }  
}
