/**
 * Main annotation canvas component
 * Renders image with annotation overlays and drawing tools
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Annotation,
  AnnotationToolType,
  BoundingBoxAnnotation,
  PolygonAnnotation,
  Point,
} from './types';

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  selectedId: string | null;
  currentTool: AnnotationToolType;
  currentLabel: string;
  currentColor: string;
  onAnnotationCreate: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onAnnotationSelect: (id: string | null) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  className?: string;
}

export function AnnotationCanvas({
  imageUrl,
  annotations,
  selectedId,
  currentTool,
  currentLabel,
  currentColor,
  onAnnotationCreate,
  onAnnotationSelect,
  onAnnotationUpdate,
  onAnnotationDelete,
  className = '',
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [tempBbox, setTempBbox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      
      // Fit to container
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scaleX = containerWidth / img.naturalWidth;
        const scaleY = containerHeight / img.naturalHeight;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = (screenX - rect.left - offset.x) / scale;
    const y = (screenY - rect.top - offset.y) / scale;
    
    return {
      x: Math.max(0, Math.min(x, imageDimensions.width)),
      y: Math.max(0, Math.min(y, imageDimensions.height)),
    };
  }, [scale, offset, imageDimensions]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    
    // Draw existing annotations
    annotations.forEach((annotation) => {
      const isSelected = annotation.id === selectedId;
      const alpha = annotation.isAIGenerated ? 0.7 : 1;
      
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = `${annotation.color}33`;
      ctx.lineWidth = isSelected ? 3 : 2;
      
      if (annotation.type === 'bbox') {
        const { x, y, width, height } = annotation.bbox;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Draw label
        ctx.fillStyle = annotation.color;
        ctx.font = '14px sans-serif';
        const labelText = annotation.confidence 
          ? `${annotation.label} (${(annotation.confidence * 100).toFixed(0)}%)`
          : annotation.label;
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(x, y - 20, textWidth + 8, 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(labelText, x + 4, y - 6);
      } else if (annotation.type === 'polygon') {
        if (annotation.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          annotation.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Draw vertices
          annotation.points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = annotation.color;
            ctx.fill();
          });
        }
      }
    });
    
    // Draw temp bbox while drawing
    if (tempBbox && currentTool === 'bbox') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = `${currentColor}33`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillRect(tempBbox.x, tempBbox.y, tempBbox.width, tempBbox.height);
      ctx.strokeRect(tempBbox.x, tempBbox.y, tempBbox.width, tempBbox.height);
      ctx.setLineDash([]);
    }
    
    // Draw temp polygon while drawing
    if (currentPoints.length > 0 && currentTool === 'polygon') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = `${currentColor}33`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw vertices
      currentPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
      });
    }
    
    ctx.restore();
  }, [annotations, selectedId, scale, offset, tempBbox, currentPoints, currentTool, currentColor]);

  // Redraw on changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });
    
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = screenToImage(e.clientX, e.clientY);
    
    if (currentTool === 'select') {
      // Check if clicking on an annotation
      for (const annotation of annotations) {
        if (annotation.type === 'bbox') {
          const { x, y, width, height } = annotation.bbox;
          if (point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height) {
            onAnnotationSelect(annotation.id);
            return;
          }
        }
      }
      onAnnotationSelect(null);
    } else if (currentTool === 'bbox') {
      setIsDrawing(true);
      setDrawStart(point);
    } else if (currentTool === 'polygon') {
      setCurrentPoints([...currentPoints, point]);
    }
  }, [currentTool, annotations, screenToImage, onAnnotationSelect, currentPoints]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    
    const point = screenToImage(e.clientX, e.clientY);
    
    if (currentTool === 'bbox') {
      setTempBbox({
        x: Math.min(drawStart.x, point.x),
        y: Math.min(drawStart.y, point.y),
        width: Math.abs(point.x - drawStart.x),
        height: Math.abs(point.y - drawStart.y),
      });
    }
  }, [isDrawing, drawStart, currentTool, screenToImage]);

  const handleMouseUp = useCallback(() => {
    if (currentTool === 'bbox' && tempBbox && tempBbox.width > 5 && tempBbox.height > 5) {
      onAnnotationCreate({
        type: 'bbox',
        label: currentLabel,
        color: currentColor,
        bbox: tempBbox,
      });
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setTempBbox(null);
  }, [currentTool, tempBbox, currentLabel, currentColor, onAnnotationCreate]);

  const handleDoubleClick = useCallback(() => {
    // Complete polygon on double click
    if (currentTool === 'polygon' && currentPoints.length >= 3) {
      onAnnotationCreate({
        type: 'polygon',
        label: currentLabel,
        color: currentColor,
        points: currentPoints,
      });
      setCurrentPoints([]);
    }
  }, [currentTool, currentPoints, currentLabel, currentColor, onAnnotationCreate]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          onAnnotationDelete(selectedId);
        }
      }
      if (e.key === 'Escape') {
        setCurrentPoints([]);
        setIsDrawing(false);
        setTempBbox(null);
        onAnnotationSelect(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onAnnotationDelete, onAnnotationSelect]);

  const cursorStyle = useMemo(() => {
    switch (currentTool) {
      case 'bbox':
        return 'crosshair';
      case 'polygon':
        return 'crosshair';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  }, [currentTool]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 ${className}`}
      style={{ cursor: cursorStyle }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="absolute inset-0"
      />
      
      {/* Instructions overlay */}
      {currentTool === 'polygon' && currentPoints.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
          Nhấp để thêm điểm • Nhấp đúp để hoàn thành • ESC để hủy
        </div>
      )}
    </div>
  );
}

