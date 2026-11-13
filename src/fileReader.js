//fileReader = API nativa del browser
export function text_extractor(file, setError, error){
    return new Promise((resolve, reject) =>{
        if(!file){
            reject("Nessun file selezionato");
            return;
        }

        const lettore = new FileReader();
        lettore.readAsText(file);//legge come stringa

        lettore.onload = function(e) {
            const content = e.target.result; // Contiene i dati del file
            
            if (file.name.endsWith('.json')) {
                let parsingDati = JSON.parse(content)
                const datiValidi =
                    parsingDati?.machine != {} &&
                    parsingDati?.machine?.set_of_states?.length > 0 &&
                    parsingDati?.machine?.alphabet?.length > 0 &&
                    parsingDati?.machine?.initial_state &&
                    parsingDati?.machine?.final_state &&
                    parsingDati?.transitions != [] &&
                    parsingDati?.transitions?.every(trans =>
                        trans.current_state &&
                        trans.read &&
                        trans.write &&
                        trans.direction &&
                        trans.next_state
                    );
                if(datiValidi){
                    if(error) setError(false)
                    resolve(parsingDati);
                } else {
                    setError(true);
                    reject("La macchina non rispetta la struttura prestabilita.");
                    return ;
                }
            } else if (file.name.endsWith('.csv')) {
                const lines = content.trim().split("\n");

                const data = {
                    "machine": {},
                    "transitions": [],
                }

                for(let i = 1; i < lines.length; i++){
                    const line = [];
                    let current = "";

                    let quotMarks = false;
                    for(let char of lines[i]){
                        if (char === '"')
                            quotMarks = !quotMarks;
                        else if (char === ',' && !quotMarks){
                            line.push(current.trim());
                            current = "";
                        } else {
                            current += char;
                        }
                    }

                    line.push(current.trim());

                 if(line[0] == 'machine'){
                        data.machine.alphabet = line[1].split(",");
                        data.machine.set_of_states = line[2].split(",");
                        data.machine.initial_state = line[3];
                        data.machine.final_state = line[4];
                    } else if(line[0] == 'transition'){
                        data.transitions.push({
                            current_state: line[5],
                            read: line[6],
                            write: line[7],
                            direction: line[8],
                            next_state: line[9]
                        });
                    }
                }

                const datiValidi =
                    data?.machine != {} &&
                    data?.machine?.set_of_states?.length > 0 &&
                    data?.machine?.alphabet?.length > 0 &&
                    data?.machine?.initial_state &&
                    data?.machine?.final_state &&
                    data?.transitions != [] &&
                    data?.transitions?.every(trans =>
                        trans.current_state &&
                        trans.read &&
                        trans.write &&
                        trans.direction &&
                        trans.next_state
                    );
                if(datiValidi){
                    if(error) setError(false)
                    resolve(data);
                } else{
                    setError = true;
                    reject("La macchina non rispetta la struttura prestabilita.");
                    return ;
                }
            } else {
                reject("Formato non supportato.");
                return ;
            }
        };

        lettore.onerror = () => {
            reject("Errore lettura file");
        }
    })
}
