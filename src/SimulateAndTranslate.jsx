import '@xyflow/react/dist/style.css' //https://reactflow.dev/learn
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, MarkerType } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateConfigurationsTree, generateTranslation, pre_trans } from './Configuration.js';
import { translator } from "./fileTranslator.js";
import "./SimulateAndTranslate.css"
import SelfConnecting from './selfConnectingEdge';
import { animation, generateTape } from './MachineSimulator.js';

const edgeTypes = {
    SelfConn: SelfConnecting,
};

function SimulateAndTranslate(){
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    
    const { dati, input, alphEnc, statesEnc } = useOutletContext();

    const [activeState, setActiveState] = useState('');
    const [activeRead, setActiveRead] = useState('');
    const [go, setGo] = useState(false);
    const [cell, setCell] = useState(1)
    const [overflow, setOverflow] = useState()
    const [conf, setConf] = useState(1);
    const [inputArr, setInputArr] = useState(input || '')
    const [tape, setTape] = useState( ['...', `&#9633;`, ...inputArr.split(''), `&#9633;`, '...'])

    const charToRead = useRef(0)
    const container = useRef();
    const containerTranslate = useRef();

    const timerRef = useRef(null);
    const transitionRef = useRef(null);

    var allM = {};

    var numOfStates = dati.machine.set_of_states.length;
    var numOfEl = dati.machine.alphabet.length;

    useEffect(() => {
        if (!dati || !input) return;

        setActiveState(dati.machine?.initial_state || '');
        setActiveRead(inputArr[charToRead.current] || '');

        translator(dati, inputArr, alphEnc, statesEnc);
        generateConfigurationsTree(dati, inputArr, alphEnc, statesEnc);

        setNodes(
            dati.machine.set_of_states.map((node, index) => {
                const isFinal = dati.machine.final_state === node;
                const isInitial = dati.machine.initial_state === node;

                return {
                id: node,
                position: { x: index * 150, y: 100 },
                data: { label: `${node}${isFinal ? ' - FINAL NODE' : isInitial ? ' - INITIAL NODE' : ''}` },
                style: {
                    borderRadius: '100%',
                    width: '70px',
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isFinal ? '#b5c2c7' : isInitial ? '#c3dec4' : 'white',
                    fontSize: isFinal || isInitial ? '10px' : ''
                },
            }})
        );
    }, [dati, input]);

    useEffect(()=>{
        setTape(['...', `&#9633;`, ...inputArr.split(''), `&#9633;`, '...'])
    }, [inputArr])

    useEffect(()=>{
        if(tape && cell){
            generateTape(tape);
            animation(1);
            console.log(tape)
        }
    }, [dati, tape])

    useEffect(()=> {
        animation(cell)
    }, [cell])

    useEffect(()=>{
        if(!dati?.transitions || !go ) return;

        let lambda = `&#955;`
        let set_of_states = [...dati.machine.set_of_states];
        let blank = `&#9633;`

        //M_i := lambda a.aN..N
        for(let j = 0; j < numOfStates; j++){
            let index = `M<sub>${set_of_states[j].split('_')[1]}</sub>`
            allM[index] = `${lambda}a.a`;
            for(let n = 0; n < numOfEl+1; n++){
                if(n === numOfEl)
                    allM[index] += `N<sup>${blank}</sup><sub>${j}</sub>`
                else
                    allM[index] += `N<sup>${dati.machine.alphabet[n]}</sup><sub>${j}</sub>`
            }
        }

        if(conf === 1){
            pre_trans(allM)
            const firstTrans = {
                current_state: dati.machine.initial_state,
                read: blank,
                write: blank,
                direction: 'R',
                next_state: dati.machine.initial_state 
            }
            const secTrans = dati.transitions.find(
                (trans) => trans.current_state === dati.machine.initial_state && trans.read === inputArr[0] 
            );
            generateTranslation(firstTrans, secTrans, dati, alphEnc, numOfStates, allM, 0, tape);
        }

        let executed = false;

        const executeTransition = () => { 
            if (executed) return;
            executed = true;

            const trans = dati.transitions.find(
                (trans) => trans.current_state === activeState && trans.read === activeRead 
            );
            if(!trans){
                setGo(false)
                return;
            }

            setTape(prev => {
                const newTape = [...prev];
                newTape[cell] = trans.write;
                return newTape;
            });

            if(trans?.direction == 'R'){
                setCell(prev => prev + 1);
                charToRead.current++;
            }
            else if(trans?.direction == 'L'){
                setCell(prev => prev - 1)
                charToRead.current--;
            }

            const nextTrans = dati.transitions.find(
                (nextTrans) => nextTrans.current_state === trans.next_state && 
                nextTrans.read === inputArr[charToRead.current]
            );

            if(conf === 1) {
                generateTranslation(trans, nextTrans, dati, alphEnc, numOfStates, allM, 1, tape);
            } else {
                generateTranslation(trans, nextTrans, dati, alphEnc, numOfStates, allM, conf, tape);
            }

            if (nextTrans) {
                setConf(prev => prev + 1)
                setActiveRead(inputArr[charToRead.current]);
                setActiveState(nextTrans.current_state);
            } else {
                const lastTrans = {
                    current_state: trans.next_state,
                    read: blank,
                    write: blank,
                    direction: trans.direction,
                    next_state: trans.next_state 
                }
                generateTranslation(lastTrans, lastTrans, dati, alphEnc, numOfStates, allM, conf+1, tape);
                charToRead.current = 0;
                setCell(1)
                setActiveRead(inputArr[charToRead.current] || '');
                setActiveState(dati.machine?.initial_state || '');
                setConf(1)
                setGo(false)
                return;
            } 
        }

        //prima di programmare il timer assegno la funzione a transitionRef
        transitionRef.current = executeTransition;
        timerRef.current = setTimeout(executeTransition, 4100);

        return ()=> clearTimeout(timerRef.current);
    }, [dati, activeRead, activeState, go])
    
    const labels = {}
        
    useEffect(()=>{
        setEdges(dati?.transitions.map((edge, index) => {

            const isActive = edge.current_state === activeState && edge.read === activeRead && go;

            const key = edge.current_state+edge.next_state;

            if(!labels[key]){
                labels[key] = [];
            }
            labels[key].push(`${edge.read}|${edge.write}, ${edge.direction}`)

            return {
                id: `e${index}`,
                source: edge.current_state,
                target: edge.next_state,
                label: labels[key].join(';'),
                type: 'SelfConn',  
                animated: isActive,
                data:{
                    animatedCircle: isActive,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                }
            }})
        );
    }, [activeRead, activeState, go, dati])

    const onNodesChange = useCallback((changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []);
    const onEdgesChange = useCallback((changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []);
    const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []);

    const handleScroll = () => {
        const element = container.current;

        if (!element) return;

        const hasOverflow = element.scrollHeight > element.clientHeight;

        setOverflow(hasOverflow);
    };

    return(
        <>
            <div className="p-2" style={{height:'100vh', overflow:'hidden'}}>
                <div className='row m-0' style={{height: '90vh', width: '100%', flexWrap: 'nowrap'}} >
                    <div className='col-6 vh-90' style={{flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0}}>
                        <div className='row m-0 d-flex justify-content-center align-items-center' style={{flex: '0 0 20%', minHeight: 0}}>
                            <span className='col d-flex justify-content-around'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="var(--text)" className="goButton bi bi-play-circle btnSvg" viewBox="0 0 16 16" onClick={()=>{setGo(true); setCell(2)}}>
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="var(--text)" className="bi bi-fast-forward-circle btnSvg" viewBox="0 0 16 16" onClick={()=>{clearTimeout(timerRef.current); transitionRef.current?.()/*esegui la funzione contenuta in transitionRef se esiste*/}}>
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="M4.271 5.055a.5.5 0 0 1 .52.038L8 7.386V5.5a.5.5 0 0 1 .79-.407l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 8 10.5V8.614l-3.21 2.293A.5.5 0 0 1 4 10.5v-5a.5.5 0 0 1 .271-.445"/>
                                </svg>
                            </span>
                            <div id='tape' className='col fs-3 d-flex justify-content-center align-items-center' style={{borderCollapse:'collapse'}}></div>
                        </div>
                        <div style={{flex: '0 0 80%', minHeight: 0}}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                fitView
                                edgeTypes={edgeTypes}
                                style={{width:'100%', height:'100%'}}
                            />
                        </div>
                    </div>
                    <div className='col-6 vh-90' style={{textWrap: 'wrap', flex: '1 1 0', fontSize: '15px', display: 'flex', flexDirection: 'column', minHeight: 0}}>
                        <div id='write_here_trad' ref={container} onScroll={handleScroll} style={{flex: '1 1 0', overflowY: 'auto'}} className='p-3'>
                            {overflow && (<p id="scrollMessage" className='p-1 text-center rounded border border-black' style={{width:'fit-content'}}>Scroll to see more ↓</p>)}
                        </div>
                        <hr/>
                        <div id='write_here_sim' ref={containerTranslate} style={{flex: '1 1 0', overflowY: 'auto'}} className='p-3'></div>
                    </div>
                </div>
                <div id='write_here' className='vh-10 fs-5'>
                </div>
            </div>
        </>
    )
}

export default SimulateAndTranslate;