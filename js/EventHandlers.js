export class EventHandlers {
    constructor(timeline, timelineCanvas) {
        this.timeline = timeline;
        this.timelineCanvas = timelineCanvas;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.timelineCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.timelineCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.timelineCanvas.addEventListener('mouseup', () => this.onMouseUp());
        this.timelineCanvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.timelineCanvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Touch events
        this.timelineCanvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.timelineCanvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.timelineCanvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Buttons
        document.getElementById('zoomIn').addEventListener('click', () => this.timeline.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.timeline.zoomOut());
        document.getElementById('reset').addEventListener('click', () => this.timeline.reset());

        // Window resize
        window.addEventListener('resize', () => this.onResize());
    }

    onMouseDown(e) {
        this.timeline.startDrag(e.clientX);
    }

    onMouseMove(e) {
        this.timeline.drag(e.clientX);
    }

    onMouseUp() {
        this.timeline.endDrag();
    }

    onMouseLeave() {
        this.timeline.endDrag();
    }

    onWheel(e) {
        e.preventDefault();
        
        if (this.timeline.animationId) {
            cancelAnimationFrame(this.timeline.animationId);
            this.timeline.animationId = null;
        }
        
        const mouseX = e.clientX - this.timelineCanvas.getBoundingClientRect().left;
        const delta = e.deltaY > 0 ? 0.85 : 1.15;
        
        this.timeline.zoom(delta, mouseX);
    }

    onTouchStart(e) {
        this.timeline.touches = Array.from(e.touches);
        
        if (this.timeline.touches.length === 1) {
            this.timeline.startDrag(this.timeline.touches[0].clientX);
        } else if (this.timeline.touches.length === 2) {
            this.timeline.isDragging = false;
            this.timeline.handlePinchStart(this.timeline.touches[0], this.timeline.touches[1]);
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        
        this.timeline.touches = Array.from(e.touches);
        
        if (this.timeline.touches.length === 1 && this.timeline.isDragging) {
            this.timeline.drag(this.timeline.touches[0].clientX);
        } else if (this.timeline.touches.length === 2) {
            this.timeline.handlePinch(this.timeline.touches[0], this.timeline.touches[1]);
        }
    }

    onTouchEnd(e) {
        this.timeline.touches = Array.from(e.touches);
        
        if (this.timeline.touches.length === 0) {
            this.timeline.endDrag();
        } else if (this.timeline.touches.length === 1) {
            this.timeline.startDrag(this.timeline.touches[0].clientX);
        }
    }

    onResize() {
        this.timeline.initCanvas();
        this.timeline.render();
    }
}

