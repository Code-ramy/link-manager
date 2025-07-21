
"use client";

import React, { useEffect, useRef } from 'react';

// This class defines the properties and behavior of each particle.
class Particle {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private size: number;
    private x: number;
    private y: number;
    private directionX: number;
    private directionY: number;
    private color: string;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.size = Math.random() * 2 + 1;
        this.x = Math.random() * (this.canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (this.canvas.height - this.size * 2) + this.size;
        this.directionX = (Math.random() * 0.4) - 0.2;
        this.directionY = (Math.random() * 0.4) - 0.2;
        this.color = 'rgba(130, 87, 229, 0.25)';
    }

    // Draws the particle on the canvas
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    // Updates the particle's position and redraws it
    update() {
        if (this.x > this.canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > this.canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// The animated background component
export const AnimatedBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // useEffect to run and manage the animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let particlesArray: Particle[] = [];
        let animationFrameId: number;

        // Function to initialize the animation
        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesArray = [];
            const numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle(canvas, ctx));
            }
        };

        // Main animation function
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(particle => particle.update());
        };
        
        init();
        animate();

        // Listener for window resize
        const handleResize = () => init();
        window.addEventListener('resize', handleResize);

        // Cleanup function on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <canvas ref={canvasRef} id="particle-canvas" className="absolute top-0 left-0 w-full h-full"></canvas>
            <div className="liquid-shape shape1"></div>
            <div className="liquid-shape shape2"></div>
            <div className="liquid-shape shape3"></div>
        </div>
    );
};
