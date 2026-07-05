import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    Pencil, Type, Square, Circle, Minus, Eraser, Trash2,
    Download, Undo, Redo, X, Maximize2, Minimize2,
    MousePointer, Highlighter, ArrowRight, Triangle,
    Move, GripVertical, Sparkles
} from 'lucide-react';

const Whiteboard = ({ isOpen, onClose, isFullscreen, onToggleFullscreen, socket, roomId }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Inter');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState('');
    const [textPosition, setTextPosition] = useState(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [lastPoint, setLastPoint] = useState(null);
    const [velocity, setVelocity] = useState(0);
    const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

    // Text objects that can be moved
    const [textObjects, setTextObjects] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);
    const [isDraggingText, setIsDraggingText] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const colors = [
        '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#000000',
        '#fef3c7', '#d1fae5', '#e0e7ff', '#fce7f3', '#f3e8ff'
    ];

    const brushSizes = [1, 2, 4, 6, 8, 12, 16, 24];
    const fontSizes = [12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
    const fontFamilies = [
        { name: 'Inter', label: 'Sans Serif' },
        { name: 'Georgia', label: 'Serif' },
        { name: 'Courier New', label: 'Monospace' },
        { name: 'Comic Sans MS', label: 'Casual' },
        { name: 'Brush Script MT', label: 'Script' }
    ];

    const tools = [
        { id: 'select', icon: MousePointer, label: 'Select & Move', group: 'pointer' },
        { id: 'pen', icon: Pencil, label: 'Pen', group: 'draw' },
        { id: 'marker', icon: Sparkles, label: 'Marker', group: 'draw' },
        { id: 'highlighter', icon: Highlighter, label: 'Highlighter', group: 'draw' },
        { id: 'text', icon: Type, label: 'Text', group: 'text' },
        { id: 'line', icon: Minus, label: 'Line', group: 'shape' },
        { id: 'arrow', icon: ArrowRight, label: 'Arrow', group: 'shape' },
        { id: 'rectangle', icon: Square, label: 'Rectangle', group: 'shape' },
        { id: 'circle', icon: Circle, label: 'Circle', group: 'shape' },
        { id: 'triangle', icon: Triangle, label: 'Triangle', group: 'shape' },
        { id: 'eraser', icon: Eraser, label: 'Eraser', group: 'eraser' },
    ];

    // Handle browser fullscreen
    const enterBrowserFullscreen = async () => {
        try {
            if (containerRef.current) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if (containerRef.current.webkitRequestFullscreen) {
                    await containerRef.current.webkitRequestFullscreen();
                } else if (containerRef.current.msRequestFullscreen) {
                    await containerRef.current.msRequestFullscreen();
                }
                setIsBrowserFullscreen(true);
            }
        } catch (err) {
            console.error('Failed to enter fullscreen:', err);
        }
    };

    const exitBrowserFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
            setIsBrowserFullscreen(false);
        } catch (err) {
            console.error('Failed to exit fullscreen:', err);
        }
    };

    const toggleBrowserFullscreen = () => {
        if (isBrowserFullscreen) {
            exitBrowserFullscreen();
        } else {
            enterBrowserFullscreen();
        }
    };

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsBrowserFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            const container = containerRef.current;
            if (container) {
                const toolbarHeight = 60;
                const statusBarHeight = 40;
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight - toolbarHeight - statusBarHeight;

                // Draw background
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add grid pattern
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 0.5;
                const gridSize = 40;
                for (let x = 0; x < canvas.width; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                }
                for (let y = 0; y < canvas.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }

                // Restore from history
                if (history.length > 0 && historyIndex >= 0) {
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0);
                    img.src = history[historyIndex];
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Also resize on fullscreen change
        const handleFSChange = () => setTimeout(resizeCanvas, 100);
        document.addEventListener('fullscreenchange', handleFSChange);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('fullscreenchange', handleFSChange);
        };
    }, [isOpen, isBrowserFullscreen, history, historyIndex]);

    // Save state to history
    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);

        if (newHistory.length > 50) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Undo
    const handleUndo = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[newIndex];
    };

    // Redo
    const handleRedo = () => {
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[newIndex];
    };

    // Clear canvas
    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Clear text objects
        setTextObjects([]);
        setSelectedTextId(null);
        saveToHistory();

        // Emit clear to room
        if (socket && roomId) {
            socket.emit('room:whiteboardClear', { roomId });
        }
    };

    // Download canvas as image
    const handleDownload = () => {
        const canvas = canvasRef.current;

        // Create a temporary canvas to include text objects
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw existing canvas
        tempCtx.drawImage(canvas, 0, 0);

        // Draw text objects
        textObjects.forEach(textObj => {
            tempCtx.font = `${textObj.fontSize}px '${textObj.fontFamily}', sans-serif`;
            tempCtx.fillStyle = textObj.color;
            tempCtx.shadowColor = 'rgba(0,0,0,0.5)';
            tempCtx.shadowBlur = 4;
            tempCtx.shadowOffsetX = 2;
            tempCtx.shadowOffsetY = 2;

            const lines = textObj.text.split('\n');
            lines.forEach((line, index) => {
                tempCtx.fillText(line, textObj.x, textObj.y + (index * textObj.fontSize * 1.2));
            });
        });

        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL();
        link.click();
    };

    // Get mouse/touch position relative to canvas
    const getPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // Find text object at position
    const findTextAtPosition = (pos) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        for (let i = textObjects.length - 1; i >= 0; i--) {
            const textObj = textObjects[i];
            ctx.font = `${textObj.fontSize}px '${textObj.fontFamily}', sans-serif`;
            const metrics = ctx.measureText(textObj.text);
            const textHeight = textObj.fontSize * (textObj.text.split('\n').length) * 1.2;

            if (
                pos.x >= textObj.x - 10 &&
                pos.x <= textObj.x + metrics.width + 10 &&
                pos.y >= textObj.y - textObj.fontSize - 10 &&
                pos.y <= textObj.y + textHeight + 10
            ) {
                return textObj;
            }
        }
        return null;
    };

    // Modern pen stroke with variable width
    const drawModernStroke = (ctx, from, to, currentVelocity) => {
        const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
        const newVelocity = Math.min(distance, 50);
        const smoothVelocity = velocity * 0.7 + newVelocity * 0.3;
        setVelocity(smoothVelocity);

        let dynamicSize = brushSize;
        if (tool === 'pen') {
            dynamicSize = Math.max(brushSize * 0.3, brushSize * (1 - smoothVelocity / 100));
        } else if (tool === 'marker') {
            dynamicSize = brushSize * 1.5;
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.quadraticCurveTo(from.x, from.y, midX, midY);
        ctx.lineTo(to.x, to.y);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = dynamicSize;

        if (tool === 'highlighter') {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize * 3;
        } else if (tool === 'marker') {
            ctx.globalAlpha = 0.85;
            ctx.strokeStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 3;
        } else {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : color;
            ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    };

    // Start drawing/selecting
    const handleStart = (e) => {
        e.preventDefault();
        const pos = getPosition(e);
        setStartPos(pos);
        setLastPoint(pos);
        setVelocity(0);

        // If select tool, check for text objects
        if (tool === 'select') {
            const clickedText = findTextAtPosition(pos);
            if (clickedText) {
                setSelectedTextId(clickedText.id);
                setIsDraggingText(true);
                setDragOffset({
                    x: pos.x - clickedText.x,
                    y: pos.y - clickedText.y
                });
                return;
            } else {
                setSelectedTextId(null);
            }
            return;
        }

        if (tool === 'text') {
            setTextPosition(pos);
            setShowTextInput(true);
            return;
        }

        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (tool === 'pen' || tool === 'marker' || tool === 'highlighter' || tool === 'eraser') {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = tool === 'eraser' ? '#1e293b' : color;
            if (tool === 'highlighter') ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;

            if (socket && roomId) {
                socket.emit('room:whiteboardDraw', {
                    roomId,
                    startPoint: pos,
                    endPoint: pos,
                    color,
                    brushSize,
                    tool
                });
            }
        }
    };

    // Drawing/dragging
    const handleMove = (e) => {
        const pos = getPosition(e);

        // Handle text dragging
        if (isDraggingText && selectedTextId) {
            e.preventDefault();
            setTextObjects(prev => prev.map(t =>
                t.id === selectedTextId
                    ? { ...t, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
                    : t
            ));
            return;
        }

        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (tool === 'pen' || tool === 'marker' || tool === 'highlighter' || tool === 'eraser') {
            if (lastPoint) {
                drawModernStroke(ctx, lastPoint, pos, velocity);
                if (socket && roomId) {
                    socket.emit('room:whiteboardDraw', {
                        roomId,
                        startPoint: lastPoint,
                        endPoint: pos,
                        color,
                        brushSize,
                        tool
                    });
                }
            }
            setLastPoint(pos);
        }
    };

    // End drawing/dragging
    const handleEnd = (e) => {
        // End text dragging
        if (isDraggingText) {
            setIsDraggingText(false);
            if (socket && roomId && selectedTextId) {
                const draggedText = textObjects.find(t => t.id === selectedTextId);
                if (draggedText) {
                    socket.emit('room:whiteboardText', {
                        roomId,
                        ...draggedText
                    });
                }
            }
            return;
        }

        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = e.changedTouches ?
            {
                x: e.changedTouches[0].clientX - canvas.getBoundingClientRect().left,
                y: e.changedTouches[0].clientY - canvas.getBoundingClientRect().top
            }
            : getPosition(e);

        // Draw shapes
        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (tool === 'arrow') {
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.stroke();

            const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
            const headLength = 15 + brushSize * 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(
                pos.x - headLength * Math.cos(angle - Math.PI / 6),
                pos.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(
                pos.x - headLength * Math.cos(angle + Math.PI / 6),
                pos.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
        } else if (tool === 'rectangle') {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(
                Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
            );
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.stroke();
        } else if (tool === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(startPos.x + (pos.x - startPos.x) / 2, startPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineTo(startPos.x, pos.y);
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.stroke();
        }

        if (socket && roomId && ['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(tool)) {
            socket.emit('room:whiteboardDraw', {
                roomId,
                startPoint: startPos,
                endPoint: pos,
                color,
                brushSize,
                tool
            });
        }

        setIsDrawing(false);
        setLastPoint(null);
        saveToHistory();
    };

    // Add text object
    const handleAddText = () => {
        if (!textInput.trim() || !textPosition) return;

        const newTextObject = {
            id: Date.now(),
            text: textInput,
            x: textPosition.x,
            y: textPosition.y,
            fontSize,
            fontFamily,
            color
        };

        setTextObjects(prev => [...prev, newTextObject]);

        if (socket && roomId) {
            socket.emit('room:whiteboardText', {
                roomId,
                ...newTextObject
            });
        }

        setTextInput('');
        setShowTextInput(false);
        setTextPosition(null);
        setSelectedTextId(newTextObject.id);
    };

    // Delete selected text
    const handleDeleteSelectedText = () => {
        if (selectedTextId) {
            setTextObjects(prev => prev.filter(t => t.id !== selectedTextId));
            if (socket && roomId) {
                socket.emit('room:whiteboardDeleteText', { roomId, id: selectedTextId });
            }
            setSelectedTextId(null);
        }
    };


    // Expose snapshot for autosaving
    useEffect(() => {
        window.__getWhiteboardSnapshot = () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);
            textObjects.forEach(textObj => {
                tempCtx.font = `${textObj.fontSize}px '${textObj.fontFamily}', sans-serif`;
                tempCtx.fillStyle = textObj.color;
                tempCtx.shadowColor = 'rgba(0,0,0,0.5)';
                tempCtx.shadowBlur = 4;
                tempCtx.shadowOffsetX = 2;
                tempCtx.shadowOffsetY = 2;
                const lines = textObj.text.split('\n');
                lines.forEach((line, index) => {
                    tempCtx.fillText(line, textObj.x, textObj.y + (index * textObj.fontSize * 1.2));
                });
            });
            return tempCanvas.toDataURL('image/png');
        };
        return () => {
            delete window.__getWhiteboardSnapshot;
        };
    }, [textObjects]);
    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedTextId && tool === 'select') {
                    handleDeleteSelectedText();
                }
            }
            if (e.key === 'Escape') {
                setSelectedTextId(null);
                setShowTextInput(false);
                if (isBrowserFullscreen) {
                    exitBrowserFullscreen();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTextId, tool, isBrowserFullscreen]);

    // Collaborative Socket Sync Listener
    useEffect(() => {
        if (!socket || !roomId) return;

        const handleRemoteDraw = (data) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            if (['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(data.tool)) {
                // Draw remote shapes
                if (data.tool === 'line') {
                    ctx.moveTo(data.startPoint.x, data.startPoint.y);
                    ctx.lineTo(data.endPoint.x, data.endPoint.y);
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.brushSize;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                } else if (data.tool === 'arrow') {
                    ctx.moveTo(data.startPoint.x, data.startPoint.y);
                    ctx.lineTo(data.endPoint.x, data.endPoint.y);
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.brushSize;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    const angle = Math.atan2(data.endPoint.y - data.startPoint.y, data.endPoint.x - data.startPoint.x);
                    const headLength = 15 + data.brushSize * 2;
                    ctx.beginPath();
                    ctx.moveTo(data.endPoint.x, data.endPoint.y);
                    ctx.lineTo(
                        data.endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
                        data.endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.moveTo(data.endPoint.x, data.endPoint.y);
                    ctx.lineTo(
                        data.endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
                        data.endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.stroke();
                } else if (data.tool === 'rectangle') {
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.brushSize;
                    ctx.strokeRect(data.startPoint.x, data.startPoint.y, data.endPoint.x - data.startPoint.x, data.endPoint.y - data.startPoint.y);
                } else if (data.tool === 'circle') {
                    const radius = Math.sqrt(
                        Math.pow(data.endPoint.x - data.startPoint.x, 2) + Math.pow(data.endPoint.y - data.startPoint.y, 2)
                    );
                    ctx.arc(data.startPoint.x, data.startPoint.y, radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.brushSize;
                    ctx.stroke();
                } else if (data.tool === 'triangle') {
                    ctx.moveTo(data.startPoint.x + (data.endPoint.x - data.startPoint.x) / 2, data.startPoint.y);
                    ctx.lineTo(data.endPoint.x, data.endPoint.y);
                    ctx.lineTo(data.startPoint.x, data.endPoint.y);
                    ctx.closePath();
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.brushSize;
                    ctx.stroke();
                }
            } else {
                // Draw freehand drawing lines or dots
                if (data.startPoint.x === data.endPoint.x && data.startPoint.y === data.endPoint.y) {
                    ctx.arc(data.startPoint.x, data.startPoint.y, data.brushSize / 2, 0, Math.PI * 2);
                    ctx.fillStyle = data.tool === 'eraser' ? '#1e293b' : data.color;
                    if (data.tool === 'highlighter') ctx.globalAlpha = 0.3;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                } else {
                    ctx.moveTo(data.startPoint.x, data.startPoint.y);
                    ctx.lineTo(data.endPoint.x, data.endPoint.y);
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.lineWidth = data.brushSize;

                    if (data.tool === 'highlighter') {
                        ctx.globalAlpha = 0.3;
                        ctx.strokeStyle = data.color;
                        ctx.lineWidth = data.brushSize * 3;
                    } else if (data.tool === 'marker') {
                        ctx.globalAlpha = 0.85;
                        ctx.strokeStyle = data.color;
                        ctx.shadowColor = data.color;
                        ctx.shadowBlur = 3;
                    } else {
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = data.tool === 'eraser' ? '#1e293b' : data.color;
                        ctx.shadowBlur = 0;
                    }
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        };

        const handleRemoteClear = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Redraw grid
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 0.5;
            const gridSize = 40;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            setTextObjects([]);
            setSelectedTextId(null);
        };

        const handleRemoteText = (data) => {
            setTextObjects(prev => {
                if (prev.some(t => t.id === data.id)) {
                    return prev.map(t => t.id === data.id ? data : t);
                }
                return [...prev, data];
            });
        };

        const handleRemoteDeleteText = (data) => {
            setTextObjects(prev => prev.filter(t => t.id !== data.id));
        };

        socket.on('room:whiteboardDraw', handleRemoteDraw);
        socket.on('room:whiteboardClear', handleRemoteClear);
        socket.on('room:whiteboardText', handleRemoteText);
        socket.on('room:whiteboardDeleteText', handleRemoteDeleteText);

        return () => {
            socket.off('room:whiteboardDraw', handleRemoteDraw);
            socket.off('room:whiteboardClear', handleRemoteClear);
            socket.off('room:whiteboardText', handleRemoteText);
            socket.off('room:whiteboardDeleteText', handleRemoteDeleteText);
        };
    }, [socket, roomId]);

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className={`bg-[var(--bg-secondary)] flex flex-col ${(isBrowserFullscreen || isFullscreen)
                ? 'fixed inset-0 z-[99999]'
                : 'relative w-full h-[600px] rounded-2xl overflow-hidden'
                }`}
            style={(isBrowserFullscreen || isFullscreen) ? { width: '100vw', height: '100vh' } : {}}
        >
            {/* Main Toolbar */}
            <div className="flex items-center justify-between gap-2 p-3 bg-[var(--glass-bg)] backdrop-blur-sm border-b border-[var(--border-color)] flex-shrink-0">
                {/* Drawing Tools */}
                <div className="flex items-center gap-1">
                    {tools.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTool(t.id);
                                if (t.id !== 'select') setSelectedTextId(null);
                            }}
                            className={`p-2.5 rounded-lg transition-all relative group ${tool === t.id
                                ? 'bg-gradient-to-r from-cyan- to-purple-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/30'
                                : 'bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                }`}
                            title={t.label}
                        >
                            <t.icon size={18} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--bg-secondary)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Brush/Font Size */}
                <div className="flex items-center gap-2 px-3 border-l border-r border-[var(--border-color)]">
                    {tool === 'text' ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--text-secondary)] font-bold">SIZE</span>
                                <select
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="bg-[var(--border-color)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                                >
                                    {fontSizes.map(size => (
                                        <option key={size} value={size}>{size}px</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--text-secondary)] font-bold">FONT</span>
                                <select
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="bg-[var(--border-color)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                                    style={{ fontFamily: fontFamily }}
                                >
                                    {fontFamilies.map(font => (
                                        <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-xs text-[var(--text-secondary)] font-bold">SIZE</span>
                            <div className="flex items-center gap-1">
                                {brushSizes.slice(0, 6).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setBrushSize(size)}
                                        className={`rounded-full transition-all flex items-center justify-center ${brushSize === size
                                            ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-800 scale-110'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{
                                            width: Math.max(size + 12, 20),
                                            height: Math.max(size + 12, 20),
                                            backgroundColor: color
                                        }}
                                        title={`Size ${size}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Colors */}
                <div className="flex items-center gap-1.5 px-3 border-r border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-secondary)] font-bold mr-1">COLOR</span>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {colors.slice(0, 10).map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full transition-all border-2 ${color === c
                                    ? 'border-white scale-125 ring-2 ring-violet-500'
                                    : 'border-[var(--border-color)] hover:scale-110 hover:border-white'
                                    }`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-2.5 rounded-lg bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Undo"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2.5 rounded-lg bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Redo"
                    >
                        <Redo size={18} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        title="Clear All"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                    <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
                    <button
                        onClick={toggleBrowserFullscreen}
                        className="p-2.5 rounded-lg bg-gradient-to-r from-cyan-/30 to-purple-500/30 text-violet-300 hover:from-cyan-/50 hover:to-purple-500/50 transition-all flex items-center gap-2"
                        title={isBrowserFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (Entire Screen)'}
                    >
                        {isBrowserFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        <span className="text-xs font-bold hidden sm:inline">
                            {isBrowserFullscreen ? 'Exit' : 'Fullscreen'}
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            if (isBrowserFullscreen) exitBrowserFullscreen();
                            onClose();
                        }}
                        className="p-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="relative flex-1 overflow-hidden">
                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 touch-none ${tool === 'text' ? 'cursor-text' :
                        tool === 'eraser' ? 'cursor-cell' :
                            tool === 'select' ? 'cursor-default' :
                                'cursor-crosshair'
                        }`}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />

                {/* Rendered Text Objects (moveable) */}
                {textObjects.map(textObj => (
                    <div
                        key={textObj.id}
                        className={`absolute cursor-move select-none transition-all ${selectedTextId === textObj.id
                            ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900 bg-cyan-500/10 rounded-lg'
                            : 'hover:ring-2 hover:ring-violet-500/50 hover:rounded-lg'
                            }`}
                        style={{
                            left: textObj.x,
                            top: textObj.y + 60, // Account for toolbar
                            color: textObj.color,
                            fontSize: `${textObj.fontSize}px`,
                            fontFamily: textObj.fontFamily,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            whiteSpace: 'pre-wrap',
                            padding: '4px 8px',
                            pointerEvents: tool === 'select' ? 'auto' : 'none'
                        }}
                        onMouseDown={(e) => {
                            if (tool === 'select') {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setSelectedTextId(textObj.id);
                                setIsDraggingText(true);
                                setDragOffset({
                                    x: e.clientX - rect.left + 8,
                                    y: e.clientY - rect.top + 60 + textObj.fontSize
                                });
                            }
                        }}
                    >
                        {textObj.text}
                        {selectedTextId === textObj.id && (
                            <div className="absolute -top-8 left-0 flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg px-2 py-1 shadow-lg">
                                <Move size={14} className="text-cyan-" />
                                <span className="text-xs text-[var(--text-secondary)]">Drag to move</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSelectedText();
                                    }}
                                    className="ml-2 p-1 bg-red-500/20 rounded text-red-400 hover:bg-red-500/30"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Text Input Modal */}
            {showTextInput && textPosition && (
                <div
                    className="absolute bg-[var(--bg-secondary)] border border-cyan-500/50 rounded-xl p-4 shadow-2xl shadow-violet-500/20 z-50"
                    style={{
                        left: Math.min(textPosition.x, (containerRef.current?.clientWidth || 500) - 350),
                        top: Math.min(textPosition.y + 70, (containerRef.current?.clientHeight || 500) - 250),
                        minWidth: '320px'
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[var(--text-primary)] font-bold flex items-center gap-2">
                            <Type size={18} className="text-cyan-" />
                            Add Text
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="bg-[var(--border-color)] text-[var(--text-primary)] px-2 py-1 rounded text-sm focus:outline-none"
                            >
                                {fontSizes.map(size => (
                                    <option key={size} value={size}>{size}px</option>
                                ))}
                            </select>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="bg-[var(--border-color)] text-[var(--text-primary)] px-2 py-1 rounded text-sm focus:outline-none"
                            >
                                {fontFamilies.map(font => (
                                    <option key={font.name} value={font.name}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your text here..."
                        autoFocus
                        rows={3}
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 resize-none"
                        style={{ color, fontSize: `${Math.min(fontSize * 0.7, 24)}px`, fontFamily }}
                    />

                    <div className="flex items-center gap-2 mt-3 mb-3">
                        <span className="text-xs text-[var(--text-secondary)]">Color:</span>
                        <div className="flex gap-1 flex-wrap">
                            {colors.slice(0, 10).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-violet-500 scale-110' : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAddText}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan- to-purple-500 text-[var(--text-primary)] rounded-lg font-bold hover:from-cyan- hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Type size={16} />
                            Add Text
                        </button>
                        <button
                            onClick={() => {
                                setShowTextInput(false);
                                setTextInput('');
                                setTextPosition(null);
                            }}
                            className="px-4 py-2.5 bg-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-bold hover:bg-[var(--bg-secondary)] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <div className="px-4 py-2 bg-[var(--glass-bg)] backdrop-blur-sm border-t border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--text-secondary)]">
                        <span className="text-cyan- font-bold">{tools.find(t => t.id === tool)?.label}</span>
                    </span>
                    {selectedTextId && (
                        <span className="text-sm text-emerald-400 flex items-center gap-1">
                            <Move size={14} />
                            Text selected - Drag to move, Delete to remove
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    {isBrowserFullscreen && <span className="text-cyan-">Press Esc to exit fullscreen</span>}
                    <span>•</span>
                    <span>Select tool to move text</span>
                </div>
            </div>
        </div>
    );
};

export default Whiteboard;
