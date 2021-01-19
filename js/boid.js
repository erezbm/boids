import flags from './flags.js';
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
    calcNetForce(boids, borders) {
        const boidsInView = boids.filter((boid) => this.position.distLessThan(boid.position, this.viewDistance));
        const seperationForce = this.calcSeperationForce(boidsInView);
        const alignmentForce = this.calcAlignmentForce(boidsInView);
        const cohesionForce = this.calcCohesionForce(boidsInView);
        const bordersForce = this.calcBordersForce(borders);
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
    calcBordersForce(borders) {
        return borders
            .map((border) => border.calcNormalForce(this.position, this.radius))
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
Boid.maxForce = 10;
Boid.radius = 5;
Boid.viewDistance = 50;
