import { Timeline } from './Timeline.js';
import { EventHandlers } from './EventHandlers.js';

// Initialize timeline
const canvas = document.getElementById('canvas');
const timelineCanvas = document.getElementById('timelineCanvas');
const timelineContent = document.getElementById('timelineContent');
const tooltip = document.getElementById('tooltip');

const timeline = new Timeline(canvas, timelineCanvas, timelineContent, tooltip);
const eventHandlers = new EventHandlers(timeline, timelineCanvas);

// Create period buttons
const periodButtonsContainer = document.getElementById('periodButtons');
timeline.createPeriodButtons(periodButtonsContainer);

// Initial render
timeline.render();

console.log('🌌 Timeline of the Universe initialized!');

