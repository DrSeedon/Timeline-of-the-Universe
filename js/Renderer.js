import { historicalPeriods, events, MIN_YEAR, MAX_YEAR, TOTAL_YEARS } from './data.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    yearToX(year, scale, offsetX) {
        const normalizedYear = (year - MIN_YEAR) / TOTAL_YEARS;
        return normalizedYear * this.canvas.width * scale + offsetX;
    }

    xToYear(x, scale, offsetX) {
        const normalized = (x - offsetX) / (this.canvas.width * scale);
        return normalized * TOTAL_YEARS + MIN_YEAR;
    }

    drawTimeline(scale, offsetX) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerY = this.canvas.height / 2;
        const periodHeight = 80;
        
        this.drawScaleRuler(scale, offsetX, centerY);
        
        const leftYear = this.xToYear(-200, scale, offsetX);
        const rightYear = this.xToYear(this.canvas.width + 200, scale, offsetX);
        
        // Draw periods
        for (const period of historicalPeriods) {
            if (period.end < leftYear || period.start > rightYear) continue;
            
            const startX = this.yearToX(period.start, scale, offsetX);
            const endX = this.yearToX(period.end, scale, offsetX);
            
            const clippedStartX = Math.max(0, startX);
            const clippedEndX = Math.min(this.canvas.width, endX);
            const clippedWidth = clippedEndX - clippedStartX;
            
            if (clippedWidth > 0) {
                this.ctx.fillStyle = period.color;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(clippedStartX, centerY - periodHeight / 2, clippedWidth, periodHeight);
                this.ctx.globalAlpha = 1;
                
                const originalWidth = endX - startX;
                if (originalWidth > 80) {
                    this.ctx.fillStyle = '#333';
                    this.ctx.font = originalWidth > 150 ? 'bold 14px Arial' : 'bold 11px Arial';
                    this.ctx.textAlign = 'center';
                    const labelX = startX + originalWidth / 2;
                    if (labelX > 0 && labelX < this.canvas.width) {
                        const label = originalWidth > 150 ? `${period.icon} ${period.name}` : period.icon;
                        this.ctx.fillText(label, labelX, centerY - periodHeight / 2 - 10);
                    }
                }
            }
        }
        
        // Draw main timeline
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.canvas.width, centerY);
        this.ctx.stroke();
        
        // Draw year markers
        this.drawYearMarkers(scale, offsetX, centerY);
    }

    drawScaleRuler(scale, offsetX, centerY) {
        const visibleYears = TOTAL_YEARS / scale;
        let interval, displayText;

        if (visibleYears > 5000000000) {
            interval = 1000000000;
            displayText = '1 млрд лет';
        } else if (visibleYears > 1000000000) {
            interval = 500000000;
            displayText = '500 млн лет';
        } else if (visibleYears > 100000000) {
            interval = 100000000;
            displayText = '100 млн лет';
        } else if (visibleYears > 10000000) {
            interval = 10000000;
            displayText = '10 млн лет';
        } else if (visibleYears > 1000000) {
            interval = 1000000;
            displayText = '1 млн лет';
        } else if (visibleYears > 100000) {
            interval = 100000;
            displayText = '100 тыс. лет';
        } else if (visibleYears > 10000) {
            interval = 10000;
            displayText = '10 тыс. лет';
        } else if (visibleYears > 1000) {
            interval = 1000;
            displayText = '1000 лет';
        } else if (visibleYears > 100) {
            interval = 100;
            displayText = '100 лет';
        } else {
            interval = 10;
            displayText = '10 лет';
        }

        const rulerWidth = (interval / TOTAL_YEARS) * this.canvas.width * scale;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(15, centerY + 50, rulerWidth + 20, 40);
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(20, centerY + 70);
        this.ctx.lineTo(20 + rulerWidth, centerY + 70);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(20, centerY + 65);
        this.ctx.lineTo(20, centerY + 75);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(20 + rulerWidth, centerY + 65);
        this.ctx.lineTo(20 + rulerWidth, centerY + 75);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(displayText, 20 + rulerWidth / 2, centerY + 85);
    }

    drawYearMarkers(scale, offsetX, centerY) {
        const visibleYears = TOTAL_YEARS / scale;
        let interval;
        
        if (visibleYears > 5000000000) {
            interval = 1000000000;
        } else if (visibleYears > 1000000000) {
            interval = 500000000;
        } else if (visibleYears > 500000000) {
            interval = 100000000;
        } else if (visibleYears > 100000000) {
            interval = 50000000;
        } else if (visibleYears > 50000000) {
            interval = 10000000;
        } else if (visibleYears > 10000000) {
            interval = 5000000;
        } else if (visibleYears > 1000000) {
            interval = 1000000;
        } else if (visibleYears > 100000) {
            interval = 100000;
        } else if (visibleYears > 10000) {
            interval = 10000;
        } else if (visibleYears > 5000) {
            interval = 1000;
        } else if (visibleYears > 1000) {
            interval = 500;
        } else if (visibleYears > 500) {
            interval = 100;
        } else if (visibleYears > 100) {
            interval = 50;
        } else if (visibleYears > 50) {
            interval = 10;
        } else if (visibleYears > 20) {
            interval = 5;
        } else {
            interval = 1;
        }
        
        const leftYear = this.xToYear(-100, scale, offsetX);
        const rightYear = this.xToYear(this.canvas.width + 100, scale, offsetX);
        const startYear = Math.ceil(leftYear / interval) * interval;
        const endYear = Math.min(rightYear, MAX_YEAR);
        
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        
        let tickCount = 0;
        const maxTicks = 30;
        
        for (let year = startYear; year <= endYear && tickCount < maxTicks; year += interval) {
            const x = this.yearToX(year, scale, offsetX);
            
            if (x < 0 || x > this.canvas.width) continue;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, centerY - 15);
            this.ctx.lineTo(x, centerY + 15);
            this.ctx.stroke();
            
            if (tickCount % 2 === 0 || visibleYears < 1000) {
                this.ctx.fillStyle = '#666';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.formatYear(year), x, centerY + 35);
            }
            
            tickCount++;
        }
    }

    formatYear(year) {
        if (year < 0) {
            const absYear = Math.abs(year);
            if (absYear >= 1000000000) {
                return (absYear / 1000000000).toFixed(1) + ' млрд лет назад';
            } else if (absYear >= 1000000) {
                return (absYear / 1000000).toFixed(1) + ' млн лет назад';
            } else if (absYear >= 1000) {
                return (absYear / 1000).toFixed(0) + ' тыс. лет назад';
            }
            return absYear + ' до н.э.';
        }
        return year + ' н.э.';
    }

    renderEvents(scale, offsetX, timelineContent, onEventEnter, onEventLeave) {
        const centerY = this.canvas.height / 2;
        const leftYear = this.xToYear(-100, scale, offsetX);
        const rightYear = this.xToYear(this.canvas.width + 100, scale, offsetX);
        
        const fragment = document.createDocumentFragment();
        let eventCount = 0;
        const maxEvents = 100;
        
        for (const event of events) {
            if (event.year < leftYear || event.year > rightYear) continue;
            if (eventCount >= maxEvents) break;
            
            const x = this.yearToX(event.year, scale, offsetX);
            const period = historicalPeriods.find(p => event.year >= p.start && event.year <= p.end);
            const color = period ? period.color : '#667eea';
            
            const marker = document.createElement('div');
            marker.className = 'event-marker';
            marker.style.left = x + 'px';
            marker.style.top = (centerY - 8) + 'px';
            
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dot.style.borderColor = color;
            
            const label = document.createElement('div');
            label.className = 'event-label';
            label.textContent = event.title;
            label.style.color = color;
            
            const yearLabel = document.createElement('div');
            yearLabel.className = 'event-year';
            yearLabel.textContent = this.formatYear(event.year);
            
            marker.appendChild(dot);
            marker.appendChild(label);
            marker.appendChild(yearLabel);
            
            marker.addEventListener('mouseenter', (e) => onEventEnter(event, period, e));
            marker.addEventListener('mouseleave', onEventLeave);
            
            fragment.appendChild(marker);
            eventCount++;
        }
        
        timelineContent.innerHTML = '';
        timelineContent.appendChild(fragment);
    }

    updateStats(scale, offsetX) {
        const leftYear = this.xToYear(0, scale, offsetX);
        const rightYear = this.xToYear(this.canvas.width, scale, offsetX);
        
        const visibleEvents = events.filter(e => e.year >= leftYear && e.year <= rightYear).length;
        const visiblePeriods = historicalPeriods.filter(p => 
            p.end >= leftYear && p.start <= rightYear
        ).length;
        
        const rangeYears = Math.abs(rightYear - leftYear);
        let rangeText;
        
        if (rangeYears >= 1000000000) {
            rangeText = (rangeYears / 1000000000).toFixed(1) + ' млрд лет';
        } else if (rangeYears >= 1000000) {
            rangeText = (rangeYears / 1000000).toFixed(1) + ' млн лет';
        } else if (rangeYears >= 1000) {
            rangeText = (rangeYears / 1000).toFixed(1) + ' тыс. лет';
        } else {
            rangeText = Math.round(rangeYears) + ' лет';
        }
        
        document.getElementById('statsEvents').textContent = visibleEvents;
        document.getElementById('statsPeriods').textContent = visiblePeriods;
        document.getElementById('statsRange').textContent = rangeText;
    }

    updateZoomInfo(scale) {
        const zoomInfo = document.getElementById('zoomInfo');
        const visibleYears = TOTAL_YEARS / scale;
        
        let info = '';
        if (visibleYears > 1000000000) {
            info = `На экране: ${(visibleYears / 1000000000).toFixed(1)} млрд лет`;
        } else if (visibleYears > 1000000) {
            info = `На экране: ${(visibleYears / 1000000).toFixed(1)} млн лет`;
        } else if (visibleYears > 1000) {
            info = `На экране: ${(visibleYears / 1000).toFixed(0)} тыс. лет`;
        } else {
            info = `На экране: ${Math.round(visibleYears)} лет`;
        }
        
        zoomInfo.textContent = info;
    }
}

