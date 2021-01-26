import flags from './flags.js';
import { mapRange, toRadians } from './utils.js';
import Vector from './vector.js';
export default class Boid {
    constructor(position) {
        this.position = position;
        this.acceleration = new Vector();
        this.velocity = new Vector();
        this.currentSearch = null;
        this.debugInfo = {
            slowing: false,
        };
    }
    static createInRandomPosition(borders) {
        return new Boid(Vector.randomInRect(borders.getFreeZone().withPadding(Boid.radius)));
    }
    calcNetForce(dt, boids, borders) {
        const boidsInView = boids.filter((boid) => boid !== this && this.position.distLTE(boid.position, Boid.viewDistance));
        const seesBoids = boidsInView.length > 0;
        if (seesBoids)
            this.currentSearch = null;
        return (seesBoids ? this.calcFlockForce(boidsInView, dt) : this.calcSearchForce(dt, borders)).add(this.calcBordersForce(borders));
    }
    calcFlockForce(boidsInView, dt) {
        return this.calcSeparationForce(boidsInView, dt)
            .add(this.calcAlignmentForce(boidsInView, dt))
            .add(this.calcCohesionForce(boidsInView, dt));
    }
    calcSeparationForce(boidsInView, dt) {
        // NOTE probably can be improved
        const d = Boid.desiredSeparationDistance;
        const forces = boidsInView
            .filter((other) => this.position.distLT(other.position, d))
            .map((other) => this.position.sub(other.position)
            .withMag(mapRange(this.position.dist(other.position), 0, d, Boid.maxForce, 0)));
        return Vector.sum(forces).div(dt).limitMag(Boid.maxForce);
    }
    calcAlignmentForce(boidsInView, dt) {
        const averageHeading = Vector.sum(boidsInView.map((boid) => boid.velocity.unit()));
        const desiredVelocity = averageHeading.withMag(Boid.desiredFlockSpeed);
        return this.calcSteerForce(desiredVelocity, dt);
    }
    calcCohesionForce(boidsInView, dt) {
        const averagePosition = Vector.average(boidsInView.map((boid) => boid.position));
        return this.calcArriveForce(averagePosition, dt);
    }
    calcSearchForce(dt, borders) {
        this.currentSearch ??= {
            targetPosition: Vector.randomInRect(borders.getFreeZone()),
            timeRemaining: Boid.searchTime,
        };
        return this.calcArriveForce(this.currentSearch.targetPosition, dt);
    }
    calcBordersForce(borders) {
        return borders.calcForce(this.position, Boid.radius);
    }
    calcArriveForce(targetPosition, dt) {
        // TODO adjust for 2d
        // currently this has the problem that it assumes you are in a straight line to the target,
        // therefore it slows down before it actually should (lower maxForce to see (because its harder to turn))
        const shouldSlow = this.position.distLTE(targetPosition, 0.5 * this.velocity.magSquared() / Boid.maxForce + Boid.maxSpeed * dt);
        this.debugInfo.slowing = shouldSlow;
        if (shouldSlow) {
            const forceToApply = 0.5 * this.velocity.magSquared() / this.position.dist(targetPosition);
            return this.velocity.withMag(-forceToApply).limitMag(Boid.maxForce);
        }
        const desiredVelocity = targetPosition.sub(this.position).withMag(Boid.maxSpeed);
        return this.calcSteerForce(desiredVelocity, dt);
    }
    /** Calculates the force needed to reach a velocity of `desiredVelocity` in `dt` seconds, limited to `maxForce`. */
    calcSteerForce(desiredVelocity, dt) {
        return desiredVelocity.sub(this.velocity).div(dt).limitMag(Boid.maxForce);
    }
    update(netForce, dt) {
        this.acceleration = netForce;
        // Move according to linear motion
        const finalVelocity = this.velocity.add(this.acceleration.mult(dt));
        const averageVelocity = this.velocity.add(finalVelocity).div(2);
        const displacement = averageVelocity.mult(dt);
        this.velocity = finalVelocity;
        this.position = this.position.add(displacement);
        if (this.currentSearch) {
            this.currentSearch.timeRemaining -= dt;
            const reachedSearchTarget = this.position.distLTE(this.currentSearch.targetPosition, Boid.searchTargetRadius + Boid.radius);
            if (this.currentSearch.timeRemaining <= 0 || reachedSearchTarget) {
                this.currentSearch = null;
            }
        }
    }
    // #region Drawing
    draw(ctx) {
        this.drawBody(ctx);
        if (flags.debug) {
            this.drawVelocity(ctx);
            this.drawAcceleration(ctx);
            this.drawView(ctx);
            if (this.currentSearch)
                this.drawSearch(ctx, this.currentSearch);
        }
    }
    drawBody(ctx) {
        ctx.strokeStyle = '#1D2';
        ctx.lineWidth = 1;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.velocity.angle());
        ctx.beginPath();
        ctx.moveTo(Boid.radius, 0);
        const angle = toRadians(150);
        ctx.lineTo(Math.cos(angle) * Boid.radius, -Math.sin(angle) * Boid.radius);
        ctx.lineTo(Math.cos(-angle) * Boid.radius, -Math.sin(-angle) * Boid.radius);
        ctx.closePath();
        ctx.restore();
        ctx.stroke();
    }
    drawVelocity(ctx) {
        ctx.strokeStyle = this.debugInfo.slowing ? 'blue'
            : this.velocity.magGTE(Boid.maxSpeed - 1) ? 'red'
                : 'yellow';
        ctx.lineWidth = 50;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.velocity.x, this.velocity.y);
        ctx.restore();
        ctx.stroke();
    }
    drawAcceleration(ctx) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 20;
        ctx.save();
        ctx.translate(this.position.x + this.velocity.x / 144, this.position.y + this.velocity.y / 144);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.acceleration.x, this.acceleration.y);
        ctx.restore();
        ctx.stroke();
    }
    drawView(ctx) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, Boid.viewDistance, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawSearch(ctx, currentSearch) {
        ctx.strokeStyle = '#FA4';
        ctx.fillStyle = '#FA4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, Boid.searchTargetRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(currentSearch.targetPosition.x, currentSearch.targetPosition.y);
        ctx.stroke();
    }
}
Boid.maxSpeed = 4 * 144;
Boid.maxForce = 1 * Boid.maxSpeed;
Boid.viewDistance = 100;
Boid.radius = 10;
Boid.desiredFlockSpeed = Boid.maxSpeed / 2;
Boid.desiredSeparationDistance = Boid.viewDistance / 4;
Boid.searchTargetRadius = 15;
Boid.searchTime = 50;
