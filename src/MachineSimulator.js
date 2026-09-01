//setInterval()
export function animation(dati, input, setActiveRead, setActiveState, pos){
    //generateTape(input, pos)
}

export function generateTape(input, pos){
    const tape = document.getElementById("tape");
    
    var inputArray = input.split('')
    inputArray.splice(0, 0, `&#9633;`)
    inputArray.splice(inputArray.length, 0, `&#9633;`)
    inputArray.splice(0, 0, `...`)
    inputArray.splice(inputArray.length, 0, `...`)

    let i = 0;
    let htmlContent = '';
    inputArray.forEach(el => {
        if(i == pos)
            htmlContent += `<p style='display:inline;border:5px solid #c3dec4;padding: 5px'>`
        else 
            htmlContent += `<p style='display:inline;border:1px solid black;padding: 5px'>`
        htmlContent += `${el}</p>`
        i++;
    })
    tape.innerHTML = htmlContent
}