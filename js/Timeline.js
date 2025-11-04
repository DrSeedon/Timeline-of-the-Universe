import { historicalPeriods, MIN_YEAR, TOTAL_YEARS } from './data.js';
import { Renderer } from './Renderer.js';

export class Timeline {
    constructor(canvas, timelineCanvas, timelineContent, tooltip) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.timelineCanvas = timelineCanvas;
        this.timelineContent = timelineContent;
        this.tooltip = tooltip;
        
        this.renderer = new Renderer(canvas, this.ctx);
        
        // State
        this.scale = 1;
        this.offsetX = 0;
        this.isDragging = false;
        this.startDragX = 0;
        this.startOffsetX = 0;
        this.renderInProgress = false;
        this.animationId = null;
        
        // Touch state
        this.touches = [];
        this.initialPinchDistance = 0;
        this.initialScale = 1;
        
        this.initCanvas();
    }

    initCanvas() {
        this.canvas.width = this.timelineCanvas.clientWidth;
        this.canvas.height = this.timelineCanvas.clientHeight;
    }

    render() {
        if (this.renderInProgress) return;
        
        this.renderInProgress = true;
        requestAnimationFrame(() => {
            this.forceRender();
            this.renderInProgress = false;
        });
    }

    forceRender() {
        this.renderer.drawTimeline(this.scale, this.offsetX);
        this.renderer.renderEvents(
            this.scale, 
            this.offsetX, 
            this.timelineContent,
            (event, period, e) => this.showTooltip(event, period, e),
            () => this.hideTooltip()
        );
        this.renderer.updateZoomInfo(this.scale);
    }

    showTooltip(event, period, mouseEvent) {
        const periodInfo = period ? `${period.icon} ${period.name}` : 'Неизвестный период';
        
        this.tooltip.querySelector('.tooltip-icon').textContent = period ? period.icon : '📍';
        this.tooltip.querySelector('.tooltip-title').textContent = event.title;
        this.tooltip.querySelector('.tooltip-year').textContent = `${this.renderer.formatYear(event.year)} • ${periodInfo}`;
        this.tooltip.querySelector('.tooltip-description').textContent = event.desc;
        
        // Show tooltip to get its dimensions
        this.tooltip.style.opacity = '0';
        this.tooltip.style.display = 'block';
        
        const rect = mouseEvent.target.getBoundingClientRect();
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
        
        const screenWidth = window.innerWidth;
        const eventCenterX = rect.left + rect.width / 2;
        const eventCenterY = rect.top + rect.height / 2;
        
        let left, top;
        
        // Проверяем где больше места - справа или слева от события
        const spaceOnRight = screenWidth - rect.right;
        const spaceOnLeft = rect.left;
        
        if (spaceOnRight >= spaceOnLeft) {
            // Показываем справа
            left = rect.right + 15;
        } else {
            // Показываем слева
            left = rect.left - tooltipWidth - 15;
        }
        
        // Центрируем по вертикали относительно события
        top = eventCenterY - tooltipHeight / 2;
        
        // Проверка чтобы не вылез за верхний край экрана
        if (top < 10) top = 10;
        
        // Проверка чтобы не вылез за нижний край экрана
        if (top + tooltipHeight > window.innerHeight - 10) {
            top = window.innerHeight - tooltipHeight - 10;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.opacity = '';
        this.tooltip.style.display = '';
        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        this.tooltip.classList.remove('visible');
    }

    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    animateToPosition(targetScale, targetOffsetX, duration = 1000) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const startScale = this.scale;
        const startOffsetX = this.offsetX;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            this.scale = startScale + (targetScale - startScale) * eased;
            this.offsetX = startOffsetX + (targetOffsetX - startOffsetX) * eased;
            
            this.forceRender();
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    jumpToPeriod(period) {
        const periodDuration = period.end - period.start;
        const centerYear = (period.start + period.end) / 2;
        
        const targetVisibleYears = periodDuration * 1.3;
        const targetScale = TOTAL_YEARS / targetVisibleYears;
        
        const centerX = this.canvas.width / 2;
        const targetOffsetX = centerX - ((centerYear - MIN_YEAR) / TOTAL_YEARS) * this.canvas.width * targetScale;
        
        this.animateToPosition(targetScale, targetOffsetX, 1000);
    }

    reset() {
        this.animateToPosition(1, 0, 1000);
    }

    zoom(delta, mouseX) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        const yearAtMouse = this.renderer.xToYear(mouseX, this.scale, this.offsetX);
        this.scale *= delta;
        this.scale = Math.max(0.1, this.scale);
        
        const newX = this.renderer.yearToX(yearAtMouse, this.scale, this.offsetX);
        this.offsetX += (mouseX - newX);
        
        this.render();
    }

    zoomIn() {
        const centerX = this.canvas.width / 2;
        this.zoom(2, centerX);
    }

    zoomOut() {
        const centerX = this.canvas.width / 2;
        this.zoom(0.5, centerX);
    }

    startDrag(clientX) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isDragging = true;
        this.startDragX = clientX;
        this.startOffsetX = this.offsetX;
    }

    drag(clientX) {
        if (this.isDragging) {
            const deltaX = clientX - this.startDragX;
            this.offsetX = this.startOffsetX + deltaX;
            this.render();
        }
    }

    endDrag() {
        this.isDragging = false;
    }

    handlePinchStart(touch1, touch2) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        this.initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
        this.initialScale = this.scale;
    }

    handlePinch(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        const pinchScale = currentDistance / this.initialPinchDistance;
        this.scale = this.initialScale * pinchScale;
        this.scale = Math.max(0.1, this.scale);
        
        const centerX = (touch1.clientX + touch2.clientX) / 2 - this.timelineCanvas.getBoundingClientRect().left;
        const yearAtCenter = this.renderer.xToYear(centerX, this.scale, this.offsetX);
        const newX = this.renderer.yearToX(yearAtCenter, this.scale, this.offsetX);
        this.offsetX += (centerX - newX);
        
        this.render();
    }

    createPeriodButtons(container) {
        container.innerHTML = '';
        
        const groups = [
            {
                title: '🌌 Космос и Земля',
                periods: historicalPeriods.slice(0, 4)
            },
            {
                title: '🦠 Древняя жизнь',
                periods: historicalPeriods.slice(4, 11)
            },
            {
                title: '🦖 Эра динозавров',
                periods: historicalPeriods.slice(11, 14)
            },
            {
                title: '🐘 Млекопитающие',
                periods: historicalPeriods.slice(14, 17)
            },
            {
                title: '🏛️ Цивилизация',
                periods: historicalPeriods.slice(17, 27)
            }
        ];
        
        groups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'period-group';
            
            const groupTitle = document.createElement('div');
            groupTitle.className = 'period-group-title';
            groupTitle.textContent = group.title;
            groupDiv.appendChild(groupTitle);
            
            const buttonsRow = document.createElement('div');
            buttonsRow.className = 'period-buttons-row';
            
            group.periods.forEach((period) => {
                const btn = document.createElement('button');
                btn.className = 'period-btn';
                btn.textContent = `${period.icon} ${period.name}`;
                
                const baseColor = period.color;
                btn.style.background = `linear-gradient(135deg, ${baseColor} 0%, ${this.adjustColor(baseColor, 30)} 100%)`;
                btn.style.color = this.getContrastColor(baseColor);
                
                btn.addEventListener('click', () => this.jumpToPeriod(period));
                
                buttonsRow.appendChild(btn);
            });
            
            groupDiv.appendChild(buttonsRow);
            container.appendChild(groupDiv);
        });
    }

    adjustColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + percent));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    getContrastColor(hexColor) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000' : '#fff';
    }
}

