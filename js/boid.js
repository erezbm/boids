import flags from './flags.js';
import { clamp, mapRange } from './utils.js';
import Vector from './vector.js';
export default class Boid {
    constructor(position) {
        this.position = position;
        this.acceleration = new Vector();
        this.velocity = new Vector();
        this.radius = Boid.radius;
        this.viewDistance = Boid.viewDistance;
    }
    static createInRandomPosition(width, height) {
        return new Boid(Vector.randomInRect(Boid.radius, Boid.radius, width - 2 * Boid.radius, height - 2 * Boid.radius));
    }
    calcNetForce(boids, width, height) {
        const boidsInView = boids.filter((boid) => this.position.distLessThan(boid.position, this.viewDistance));
        const seperationForce = this.calcSeperationForce(boidsInView);
        const alignmentForce = this.calcAlignmentForce(boidsInView);
        const cohesionForce = this.calcCohesionForce(boidsInView);
        const bordersForce = this.calcBordersForce(width, height);
        return seperationForce.add(alignmentForce).add(cohesionForce).add(bordersForce);
    }
    calcSeperationForce(boidsInView) {
        return new Vector();
    }
    calcAlignmentForce(boidsInView) {
        return new Vector();
    }
    calcCohesionForce(boidsInView) {
        return new Vector();
    }
    calcBordersForce(width, height) {
        const margin = 50;
        const bordersStuff = [
            { normalDirection: new Vector(1, 0), distance: this.position.x - this.radius },
            { normalDirection: new Vector(0, 1), distance: this.position.y - this.radius },
            { normalDirection: new Vector(-1, 0), distance: width - (this.position.x + this.radius) },
            { normalDirection: new Vector(0, -1), distance: height - (this.position.y + this.radius) },
        ];
        return bordersStuff
            .map(({ normalDirection, distance }) => normalDirection.withMag(mapRange(clamp(distance, 0, margin), 0, margin, Boid.maxForce, 0)))
            .reduce((sum, current) => sum.add(current));
    }
    update(netForce, dt) {
        this.acceleration = netForce;
        // Move according to linear motion
        const finalVelocity = this.velocity.add(this.acceleration.mult(dt));
        const averageVelocity = this.velocity.add(finalVelocity).div(2);
        const displacement = averageVelocity.mult(dt);
        this.velocity = finalVelocity;
        this.position = this.position.add(displacement);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        if (flags.debug) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.viewDistance, 0, 2 * Math.PI);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
        }
    }
}
Boid.maxForce = 50;
Boid.radius = 5;
Boid.viewDistance = 50;
