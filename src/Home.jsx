import './Home.css';
import { text_extractor } from './fileReader';
import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext} from 'react-router-dom';
import { useDropzone } from "react-dropzone";

function Home(){
    const [file, setFile] = useState(null);
    const [exToOpen, setExToOpen] = useState(-1);
    const [exampleContent, setExampleContent] = useState('');

    const {dati, setDati} = useOutletContext();
    const {setInput} = useOutletContext();

    useEffect(() => {
        if(exToOpen === 0){ // 0 = CSV; 1 = JSON
            fetch('/examples/example.csv')
            .then(response => response.text())
            .then(text => setExampleContent(text))
            .catch(err => console.error("Errore nel caricamento del file CSV:", err));
        } else {
            fetch('/examples/example.json')
            .then(response => response.text())
            .then(text => setExampleContent(text))
            .catch(err => console.error("Errore nel caricamento del file CSV:", err));
        }
        
    }, [exToOpen]);

    useEffect(()=>{
        if(file){
            text_extractor(file)
                .then(data => {setDati(data)})
                .catch(err => console.error(err));
        }
    }, [file]);
    
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: false,
        accept: {
            "application/json": [".json"],
            "text/csv": [".csv"]
        },
        multiple: false //just 1 file at time
    });

    return(
        <>
            <div className="vh-100 vw-100 row">
                <div className='col-3 h-100 bg-image text-end d-flex flex-column align-items-end justify-content-end p-4 text-light'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle mb-2" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                    <p>
                        A Turing Machine is a theoretical model of computation created by Alan Turing in 1936. 
                        It uses an infinite tape for memory, a head that reads and writes symbols, 
                        and a set of rules to process data.
                    </p>
                </div>
                <div className='col-9'>
                    <div className='h-25 w-100 row text-center align-items-center' style={{fontFamily: 'Fantasy'}}>
                        <p className='fs-1 text-end col' style={{color: 'var(--grey)'}}>TURING <br/>MACHINE</p>
                        <p className='fs-6 col text-start position-relative' id="titleDesign" style={{color: 'var(--olive-dark)'}}>SIMULATOR <br/>AND<br/>TRANSLATOR</p>
                    </div>
                    <div className='h-75 w-100 d-flex justify-content-center align-items-center'>
                        <form>
                            <div className='d-flex justify-content-center'>
                                <div className='w-75 border rounded-5 shadow d-flex justify-content-center position-relative'>
                                    <div id="upload-icon" className='d-flex justify-content-center align-items-center bg-white rounded-4 position-absolute'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cloud-arrow-up" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708z"/>
                                            <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                                        </svg>
                                    </div>
                                    <div className='p-4' id='input-space'>
                                        <div className='text-center' id='formats'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" fill="currentColor" className="bi bi-filetype-json" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM4.151 15.29a1.2 1.2 0 0 1-.111-.449h.764a.58.58 0 0 0 .255.384q.105.073.25.114.142.041.319.041.245 0 .413-.07a.56.56 0 0 0 .255-.193.5.5 0 0 0 .084-.29.39.39 0 0 0-.152-.326q-.152-.12-.463-.193l-.618-.143a1.7 1.7 0 0 1-.539-.214 1 1 0 0 1-.352-.367 1.1 1.1 0 0 1-.123-.524q0-.366.19-.639.192-.272.528-.422.337-.15.777-.149.456 0 .779.152.326.153.5.41.18.255.2.566h-.75a.56.56 0 0 0-.12-.258.6.6 0 0 0-.246-.181.9.9 0 0 0-.37-.068q-.324 0-.512.152a.47.47 0 0 0-.185.384q0 .18.144.3a1 1 0 0 0 .404.175l.621.143q.326.075.566.211a1 1 0 0 1 .375.358q.135.222.135.56 0 .37-.188.656a1.2 1.2 0 0 1-.539.439q-.351.158-.858.158-.381 0-.665-.09a1.4 1.4 0 0 1-.478-.252 1.1 1.1 0 0 1-.29-.375m-3.104-.033a1.3 1.3 0 0 1-.082-.466h.764a.6.6 0 0 0 .074.27.5.5 0 0 0 .454.246q.285 0 .422-.164.137-.165.137-.466v-2.745h.791v2.725q0 .66-.357 1.005-.355.345-.985.345a1.6 1.6 0 0 1-.568-.094 1.15 1.15 0 0 1-.407-.266 1.1 1.1 0 0 1-.243-.39m9.091-1.585v.522q0 .384-.117.641a.86.86 0 0 1-.322.387.9.9 0 0 1-.47.126.9.9 0 0 1-.47-.126.87.87 0 0 1-.32-.387 1.55 1.55 0 0 1-.117-.641v-.522q0-.386.117-.641a.87.87 0 0 1 .32-.387.87.87 0 0 1 .47-.129q.265 0 .47.129a.86.86 0 0 1 .322.387q.117.255.117.641m.803.519v-.513q0-.565-.205-.973a1.46 1.46 0 0 0-.59-.63q-.38-.22-.916-.22-.534 0-.92.22a1.44 1.44 0 0 0-.589.628q-.205.407-.205.975v.513q0 .562.205.973.205.407.589.626.386.217.92.217.536 0 .917-.217.384-.22.589-.626.204-.41.205-.973m1.29-.935v2.675h-.746v-3.999h.662l1.752 2.66h.032v-2.66h.75v4h-.656l-1.761-2.676z"/>
                                            </svg>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" fill="currentColor" className="bi bi-filetype-csv" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
                                            </svg>
                                        </div>
                                        <label className='pt-4'>Upload your Turing Machine: </label>
                                        <br/>
                                        <div 
                                            {...getRootProps()} 
                                            className={`p-4 m-2 text-center rounded-4 style-pointer transition-all ${
                                                isDragActive ? 'bg-light border-primary text-primary' : 'border-secondary text-muted'
                                            }`}
                                            style={{ cursor: 'pointer', border: '2px dashed grey' }}
                                        >
                                            <input {...getInputProps()} />
                                                {isDragActive ? (
                                                    <p className="mb-0 fw-bold">Release the file here...</p>
                                                ) : (
                                                <p className="mb-0">
                                                    {file ? `Selected file: ${file.name}` : "Drag your .csv or .json file here, or click to search for it"}
                                                </p>
                                            )}
                                        </div>
                                        {dati && <p>File uploaded successfully!</p>}
                                    </div>
                                </div>
                            </div>
                            <div className='text-center m-3'>
                                <label id='input' className='form-label'>Input:</label>
                                <input htmlFor="input" type='text' className='ms-2' onChange={(e)=>{e.preventDefault();setInput(e.target.value)}}></input>
                            </div>
                            <div className='row m-2'>
                                <div className='col'>The program only accepts files that respect a certain structure:</div>
                                <p className='col' data-bs-toggle="modal" data-bs-target="#modalEx">See Example</p>
                            </div>
                            <div className='d-flex justify-content-around'>
                                <Link to='/SimulateAndTranslate' className="w-50 btn border-3 mt-3 d-flex justify-content-center align-items-center fw-bold">Simulate and Translate Turing Machine</Link>
                            </div>
                        </form>
                        <div className="modal fade" id="modalEx" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">See Examples</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className='row'>
                                        <p className="col" onClick={()=>setExToOpen(1)}>See example for JSON file</p>
                                        <p className="col" onClick={()=>setExToOpen(0)}>See example for CSV file</p>
                                    </div>
                                
                                    <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                                        {exampleContent || "Loading..."}
                                    </pre>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary">Save changes</button>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;
//INPUT: CSV - JSON
