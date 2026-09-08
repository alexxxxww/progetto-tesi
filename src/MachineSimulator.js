export function generateTape(input){
    const tape = document.getElementById("tape");
    
    let inputArray = input.split('')
    inputArray.splice(0, 0, `&#9633;`)
    inputArray.splice(inputArray.length, 0, `&#9633;`)
    inputArray.splice(0, 0, `...`)
    inputArray.splice(inputArray.length, 0, `...`)

    let i = 0;
    let htmlContent = '';
    inputArray.forEach(el => {
        htmlContent += `<p id='el-${i}' style='display:inline;border:1px solid black;padding: 5px'>${el}</p>`
        i++;
    })
    tape.innerHTML = htmlContent
}


export function animation(pos){
    const tape = document.getElementById("tape");

    if(!tape) return

    const cells = tape.querySelectorAll("p");

    cells.forEach(cell =>{
        cell.style.border = '1px solid black'
    })

    const current_cell = document.getElementById(`el-${pos}`);
    if(current_cell){
        current_cell.style.border = '5px solid #c3dec4'
    }
}