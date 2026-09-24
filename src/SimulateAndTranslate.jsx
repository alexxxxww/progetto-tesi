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
    
    const { dati, input, alphEnc, statesEnc } = useOutletContext();

    const [activeState, setActiveState] = useState('');
    const [activeRead, setActiveRead] = useState('');
    const [go, setGo] = useState(false);
    const [cell, setCell] = useState(1)
    const [overflow, setOverflow] = useState()
    const charToRead = useRef(0)
    const container = useRef();

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
                        <div className='row m-0 d-flex justify-content-center align-items-center' style={{flex: '0 0 10%', minHeight: 0}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#ff0073" className="goButton col bi bi-play-circle" viewBox="0 0 16 16" onClick={()=>{setGo(true); setCell(2)}}>
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
                            </svg>
                            <div id='tape' className='col fs-3 d-flex justify-content-center align-items-center' style={{borderCollapse:'collapse'}}></div>
                        </div>
                        <div style={{flex: '0 0 90%', minHeight: 0}}>
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
                        <div style={{flex: '1 1 0', overflowY: 'auto'}} className='p-3 text-center text-secondary'>Here will be generated the translation during the simulation of the Turing Machine...</div>
                    </div>
                </div>
                <div id='write_here' className='vh-10 fs-5'>
                </div>
            </div>
        </>
    )
}

export default SimulateAndTranslate;