import '@xyflow/react/dist/style.css' //https://reactflow.dev/learn
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, MarkerType } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateConfigurationsTree } from './Configuration.js';
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
    const [toDo, setToDo] = useState(1); //0 = translate, default = 1 = simulate
    
    const { dati, input, alphEnc, statesEnc } = useOutletContext();

    const [activeState, setActiveState] = useState('');
    const [activeRead, setActiveRead] = useState('');
    const [go, setGo] = useState(false);
    const [cell, setCell] = useState(1)
    const charToRead = useRef(0)

    useEffect(() => {
        if (!dati || !input) return;

        setActiveState(dati.machine?.initial_state || '');
        setActiveRead(input[charToRead.current] || '');

        translator(dati, input, alphEnc, statesEnc);
        generateConfigurationsTree(dati, input, alphEnc, statesEnc);

        setNodes(
            dati.machine.set_of_states.map((node, index) => {
                const isFinal = dati.machine.final_states.includes(node);
                const isInitial = dati.machine.initial_state.includes(node);

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
        if(input && cell){
            generateTape(input);
            animation(1);
        }
    }, [dati])

    useEffect(()=> {
        animation(cell)
    }, [cell])

    useEffect(()=>{
        if(!dati?.transitions || !go ) return;

        const timer = setTimeout(() => { 
            const trans = dati.transitions.find(
                (trans) => trans.current_state === activeState && trans.read === activeRead 
            );
            if(!trans) return;

            console.log(trans)

            if(trans?.direction == 'R')
                setCell(prev => prev + 1);
            else if(trans?.direction == 'L')
                setCell(prev => prev - 1)

            charToRead.current++;
            console.log(input[charToRead.current])
            const nextTrans = dati.transitions.find(
                (nextTrans) => nextTrans.current_state === trans.next_state && 
                nextTrans.read === input[charToRead.current]
            );

            if (nextTrans) {
                console.log(nextTrans)
                setActiveRead(input[charToRead.current]);
                setActiveState(nextTrans.current_state);
            } else {
                charToRead.current = 0;
                setCell(1)
                setActiveRead(input[charToRead.current] || '');
                setActiveState(dati.machine?.initial_state || '');
                setGo(false)
                return;
            } 
        }, 4100);

        return ()=> clearTimeout(timer);
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

    return(
        <div>
            <div className='d-flex justify-content-around m-4 vh-25'>
                <button onClick={()=>setToDo(0)} className="w-25 btn-st pt-2 rounded border-3 d-flex justify-content-center align-items-center fw-bold">Translate in Lambda Calculus</button>
                <button onClick={()=>setToDo(1)} className='w-25 btn-st p-2 rounded border-3 d-flex justify-content-center align-items-center fw-bold'>Simulate Turing Machine</button>
            </div>
            <div className="vh-75 m-2">
                <div className={toDo == 0 ? 'd-none' : ''}>
                    <div className='vh-10 row'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#ff0073" className="goButton col bi bi-play-circle" viewBox="0 0 16 16" onClick={()=>{setGo(true); setCell(2)}}>
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
                        </svg>
                        <div id='tape' className='col fs-3 d-flex justify-content-center align-items-center' style={{borderCollapse:'collapse'}}></div>
                    </div>
                    <div style={{height: '60vh', width: '100vw'}} >
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                            edgeTypes={edgeTypes}
                        />
                    </div>
                    <div id='write_here' className='vh-30 fs-5 mb-4'>
                    </div>
                </div>
                <div className={toDo == 0 ? 'vh-75' : 'd-none'}>
                    <div id='write_here_trad' className='vh-40'>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SimulateAndTranslate;