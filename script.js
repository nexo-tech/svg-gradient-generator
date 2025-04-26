class GradientGenerator {
    constructor() {
        this.preview = document.getElementById('gradientPreview');
        this.startColor = document.getElementById('startColor');
        this.endColor = document.getElementById('endColor');
        this.width = document.getElementById('width');
        this.height = document.getElementById('height');
        this.cloudDensity = document.getElementById('cloudDensity');
        this.distortionLevel = document.getElementById('distortionLevel');
        this.downloadBtn = document.getElementById('downloadBtn');

        // Value displays
        this.widthValue = document.getElementById('widthValue');
        this.heightValue = document.getElementById('heightValue');
        this.cloudDensityValue = document.getElementById('cloudDensityValue');
        this.distortionLevelValue = document.getElementById('distortionLevelValue');

        this.setupEventListeners();
        this.updateValueDisplays();
        this.generateGradient();
    }

    setupEventListeners() {
        // Real-time updates for all controls
        [this.startColor, this.endColor, this.width, this.height, 
         this.cloudDensity, this.distortionLevel].forEach(control => {
            control.addEventListener('input', () => {
                this.updateValueDisplays();
                this.generateGradient();
            });
        });

        this.downloadBtn.addEventListener('click', () => this.downloadSVG());
    }

    updateValueDisplays() {
        this.widthValue.textContent = `${this.width.value}px`;
        this.heightValue.textContent = `${this.height.value}px`;
        this.cloudDensityValue.textContent = this.cloudDensity.value;
        this.distortionLevelValue.textContent = this.distortionLevel.value;
    }

    generateNoisePattern() {
        const size = 100;
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'noise');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', size);
        pattern.setAttribute('height', size);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', 'white');
        pattern.appendChild(rect);

        const density = this.cloudDensity.value;
        for (let i = 0; i < density * 10; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 20 + 5;
            const opacity = Math.random() * 0.5 + 0.1;

            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', 'black');
            circle.setAttribute('opacity', opacity);
            pattern.appendChild(circle);
        }

        return pattern;
    }

    createTurbulenceFilter() {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'turbulence');
        
        const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
        turbulence.setAttribute('type', 'fractalNoise');
        turbulence.setAttribute('baseFrequency', '0.01');
        turbulence.setAttribute('numOctaves', '3');
        turbulence.setAttribute('result', 'noise');
        
        const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        displacement.setAttribute('in', 'SourceGraphic');
        displacement.setAttribute('in2', 'noise');
        displacement.setAttribute('scale', this.distortionLevel.value);
        displacement.setAttribute('xChannelSelector', 'R');
        displacement.setAttribute('yChannelSelector', 'G');
        
        filter.appendChild(turbulence);
        filter.appendChild(displacement);
        
        return filter;
    }

    generateGradient() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.width.value);
        svg.setAttribute('height', this.height.value);
        svg.setAttribute('viewBox', `0 0 ${this.width.value} ${this.height.value}`);

        // Add definitions
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', this.startColor.value);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', this.endColor.value);

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);

        // Add noise pattern and turbulence filter
        defs.appendChild(this.generateNoisePattern());
        defs.appendChild(this.createTurbulenceFilter());

        svg.appendChild(defs);

        // Create main rectangle with gradient and effects
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'url(#gradient)');
        rect.setAttribute('filter', 'url(#turbulence)');

        svg.appendChild(rect);

        // Clear previous content and add new SVG
        this.preview.innerHTML = '';
        this.preview.appendChild(svg);
    }

    downloadSVG() {
        const svg = this.preview.querySelector('svg');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        
        // Add XML declaration
        source = '<?xml version="1.0" standalone="no"?>\n' + source;
        
        // Create download link
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'gradient.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GradientGenerator();
}); 
