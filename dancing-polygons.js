(function () {
    function gcd(a, b) {
        while (b !== 0) {
            let t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    const ca = document.getElementById("canvas");
    const ct = ca.getContext("2d");
    const tau = 6.28318530718;
    const colors = ['#7FBD6B', '#6BA8BD', '#A86BBD', '#BD806B', '#988B9B', '#887B8B'];

    let scale = 1.0;
    let pixelSize = 1.0;

    function resize() {
        let dpr;
        dpr = window.devicePixelRatio || 1;
        ca.style.width = window.innerWidth + "px";
        ca.style.height = window.innerHeight + "px";
        ca.width = dpr * window.innerWidth;
        ca.height = dpr * window.innerHeight;
        let dim = Math.min(ca.width, ca.height);
        scale = dim * 0.48;
        pixelSize = dpr / scale;
    }
    window.addEventListener('resize', resize);
    ct.save();
    resize();

    function cycleLineThickness(n, t) {
        const period = 10000.0;
        if (!cycleShapes)
            return 2.0;
        let phase = (t % period) / period;
        phase = (phase + n / 3.0) % 1.0;
        phase = Math.abs(phase * 2 - 1);
        phase = phase * 10 - 4.5;
        return Math.max(0.25, Math.min(3.0, phase));
    }

    let polygonCount = parseInt(document.getElementById("polygon-count").value);
    let edgeCount = parseInt(document.getElementById("polygon-side-count").value);
    document.getElementById("polygon-count-value").textContent = polygonCount;
    document.getElementById("polygon-side-count-value").textContent = edgeCount;
    let rollRadius;
    let circleRadius;
    let cordLength, cordMid;
    let polygonRadius;
    let commonDivisor = 1;
    let pts = [];
    let path;
    let speed = 1.0 / 12000.0;

    function calculateRadii() {
        rollRadius = Math.max(polygonCount, edgeCount) / (polygonCount + edgeCount);
        circleRadius = Math.min(polygonCount, edgeCount) / (polygonCount + edgeCount);
        let arcLength = tau * Math.min(polygonCount, edgeCount) / (polygonCount + edgeCount);
        let x = Math.cos(arcLength) - 1.0;
        let y = Math.sin(arcLength);
        cordLength = Math.sqrt(Math.pow(x, 2.0) + Math.pow(y, 2.0));
        cordMid = Math.sqrt(1.0 - Math.pow(cordLength / 2, 2.0));
        let cordRest = 1.0 - cordMid;
        polygonRadius = cordRest - circleRadius;
        commonDivisor = gcd(polygonCount, edgeCount);

        pts.length = polygonCount * edgeCount;
        for (let i = 0; i < pts.length; ++i) {
            pts[i] = [0, 0];
        }

        path = [];
        for (let f = 0; f < edgeCount / commonDivisor; f += 1e-2) {
            let rollerAngle = f * tau;
            let vertexAngle = - f * tau * (rollRadius / circleRadius);
            let cx = rollRadius * Math.cos(rollerAngle) + polygonRadius * Math.cos(vertexAngle);
            let cy = rollRadius * Math.sin(rollerAngle) + polygonRadius * Math.sin(vertexAngle);
            path.push([cx, cy]);
        }
    }
    calculateRadii();

    let showDots = document.getElementById('show-dots').checked
    let showInnerPolygons = document.getElementById('show-inner-polygons').checked;
    let showOuterPolygons = document.getElementById('show-outer-polygons').checked;
    let showPath = document.getElementById('path').checked;
    let showCircles = document.getElementById('show-circles').checked;
    let showGhostPolygon = document.getElementById('show-ghost-polygon').checked;
    let cycleShapes = document.getElementById('cycle-shapes').checked;
    let showStar = document.getElementById('show-star').checked
    let relativeSpeed = parseFloat(document.getElementById("speed").value);
    let timeReference = null;
    let lastTime = null;
    let lastRenderTime = null;
    let timeOffset = null;

    document.addEventListener('keypress', (e) => {
        if (e.key == 'd') {
            showDots = !showDots;
            document.getElementById('show-dots').checked = showDots;
        } else if (e.key == 'c') {
            showCircles = !showCircles;
            document.getElementById('show-circles').checked = showCircles;
        } else if (e.key == 'i') {
            showInnerPolygons = !showInnerPolygons;
            document.getElementById('show-inner-polygons').checked = showInnerPolygons;
        } else if (e.key == 'o') {
            showOuterPolygons = !showOuterPolygons;
            document.getElementById('show-outer-polygons').checked = showOuterPolygons;
        } else if (e.key == 'p') {
            showPath = !showPath;
            document.getElementById('path').checked = showPath;
        } else if (e.key == 'g') {
            showGhostPolygon = !showGhostPolygon;
            document.getElementById('show-ghost-polygon').checked = showGhostPolygon;
        } else if (e.key == 'y') {
            cycleShapes = !cycleShapes;
            document.getElementById('cycle-shapes').checked = cycleShapes;
        } else if (e.key == 's') {
            showStar = !showStar;
            document.getElementById('show-star').checked = showStar;
        } else if (e.key == 'a') {
            document.getElementById('polygon-count').focus();
        } else if (e.key == 'b') {
            document.getElementById('polygon-side-count').focus();
        } else if (e.key == 'e') {
            document.getElementById('speed').focus();
        }
    });

    document.getElementById("speed").addEventListener("input", function (e) {
        relativeSpeed = parseFloat(e.target.value);
        timeReference = lastTime;
        timeOffset = lastRenderTime;
    });

    document.getElementById("polygon-count").addEventListener("input", function (e) {
        polygonCount = parseInt(e.target.value);
        document.getElementById("polygon-count-value").textContent = e.target.value;
        if (polygonCount < edgeCount) {
            document.getElementById("polygon-side-count").value = polygonCount;
            document.getElementById("polygon-side-count-value").textContent = polygonCount;
            edgeCount = polygonCount;
        }
        calculateRadii();
    })

    document.getElementById("polygon-side-count").addEventListener("input", function (e) {
        edgeCount = parseInt(e.target.value);
        document.getElementById("polygon-side-count-value").textContent = e.target.value;
        if (edgeCount > polygonCount) {
            document.getElementById("polygon-count").value = edgeCount;
            document.getElementById("polygon-count-value").textContent = edgeCount;
            polygonCount = edgeCount;
        }
        calculateRadii();
    })

    document.getElementById("show-dots").addEventListener("change", function (e) {
        showDots = e.target.checked;
    });

    document.getElementById("path").addEventListener("change", function (e) {
        showPath = e.target.checked;
    });

    document.getElementById("show-inner-polygons").addEventListener("change", function (e) {
        showInnerPolygons = e.target.checked;
    });

    document.getElementById("show-outer-polygons").addEventListener("change", function (e) {
        showOuterPolygons = e.target.checked;
    });

    document.getElementById("show-circles").addEventListener("change", function (e) {
        showCircles = e.target.checked;
    });

    document.getElementById("cycle-shapes").addEventListener("change", function (e) {
        cycleShapes = e.target.checked;
    });

    document.getElementById("show-star").addEventListener("change", function (e) {
        showStar = e.target.checked;
    });

    function render(time) {
        let t;
        if (lastTime === null) {
            lastTime = time;
            t = time;
            timeReference = t;
            lastRenderTime = t;
            timeOffset = 0;
        } else {
            t = timeOffset + (time - timeReference) * relativeSpeed;
            lastTime = time;
            lastRenderTime = t;
        }

        ct.clearRect(0, 0, ca.width, ca.height);
        ct.save();

        let p = (polygonCount + edgeCount) / commonDivisor;
        let q = edgeCount / commonDivisor;
        ct.font = (24 * devicePixelRatio) + 'px serif';
        let text = (commonDivisor > 1) ? `${commonDivisor}x{${p}/${q}}` : `{${p}/${q}}`;
        ct.fillText(text, 10 * devicePixelRatio, ca.height - 18 * devicePixelRatio);

        ct.translate(ca.width / 2, ca.height / 2);
        ct.scale(scale, -scale);

        for (let i = 0; i < polygonCount; ++i) {
            for (let j = 0; j < edgeCount; ++j) {
                let rollerAngle = t * tau * speed + i * tau / polygonCount;
                let vertexAngle = - t * tau * speed * (rollRadius / circleRadius) + j * tau / edgeCount;
                let pt = pts[i * edgeCount + j];
                pt[0] = rollRadius * Math.cos(rollerAngle) + polygonRadius * Math.cos(vertexAngle);
                pt[1] = rollRadius * Math.sin(rollerAngle) + polygonRadius * Math.sin(vertexAngle);
            }
        }

        if (showOuterPolygons) {
            ct.lineWidth = cycleLineThickness(1, t) * pixelSize;
            ct.strokeStyle = colors[0];
            ct.beginPath();
            for (let j = 0; j < edgeCount; ++j) {
                ct.moveTo(...pts[j]);
                for (let i = 1; i < polygonCount; ++i) {
                    ct.lineTo(...pts[i * edgeCount + j]);
                }
                ct.closePath();
                ct.stroke();
            }
        }

        if (showInnerPolygons) {
            ct.lineWidth = cycleLineThickness(0, t) * pixelSize;
            ct.strokeStyle = colors[1];
            ct.beginPath();
            for (let i = 0; i < polygonCount; ++i) {
                ct.moveTo(...pts[i * edgeCount]);
                for (let j = 1; j < edgeCount; ++j) {
                    ct.lineTo(...pts[i * edgeCount + j], 4 / scale, 0, tau, false);
                }
                ct.closePath();
            }
            ct.stroke();
        }

        // star
        if (showStar) {
            ct.beginPath();
            ct.lineWidth = cycleLineThickness(2, t) * pixelSize;
            ct.strokeStyle = colors[2];
            for (let subStarIndex = 0; subStarIndex < commonDivisor; ++subStarIndex) {
                let firstVertexAngle = subStarIndex * tau / (polygonCount + edgeCount);
                ct.moveTo(Math.cos(firstVertexAngle), Math.sin(firstVertexAngle));
                let vertexCount = (polygonCount + edgeCount) / commonDivisor;
                for (let i = 1; i < vertexCount; ++i) {
                    let vertexAngle = i * tau * Math.max(polygonCount, edgeCount) / (polygonCount + edgeCount) + firstVertexAngle;
                    ct.lineTo(Math.cos(vertexAngle), Math.sin(vertexAngle));
                }
                ct.closePath();
            }
            ct.lineJoin = 'round';
            ct.stroke();
        }

        if (showPath) {
            ct.lineWidth = cycleLineThickness(2, t) * pixelSize;
            ct.strokeStyle = colors[3];
            ct.beginPath();
            for (let subStarIndex = 0; subStarIndex < commonDivisor; ++subStarIndex) {
                ct.save();
                ct.rotate(subStarIndex * tau / (polygonCount + edgeCount));
                ct.moveTo(...path[0]);
                for (let i = 1; i < path.length; ++i)
                    ct.lineTo(...path[i]);
                ct.closePath();
                ct.restore();
            }
            ct.stroke();
        }

        if (showCircles) {
            ct.save();
            /* Chose a dash length that makes everything align */
            let dashLength = circleRadius * tau / (polygonCount * edgeCount) * commonDivisor;
            /* Ensure a maximum dash length */
            dashLength /= Math.max(1.0, Math.round(dashLength / 0.05));

            /* Draw rolling circles */
            ct.beginPath();
            ct.lineWidth = 2 * pixelSize;
            for (let i = 0; i < polygonCount; ++i) {
                let rollerAngle = t * tau * speed + i * tau / polygonCount;
                let firstVertexAngle = - t * tau * speed * (rollRadius / circleRadius);
                let rollerX = rollRadius * Math.cos(rollerAngle);
                let rollerY = rollRadius * Math.sin(rollerAngle);
                ct.moveTo(rollerX + circleRadius * Math.cos(firstVertexAngle), rollerY + circleRadius * Math.sin(firstVertexAngle));
                ct.arc(rollerX, rollerY, circleRadius, firstVertexAngle, firstVertexAngle + tau, false);
            }
            ct.setLineDash([dashLength * 5 / 6, dashLength / 6]);
            ct.strokeStyle = colors[4];
            ct.stroke();

            /* Draw the outer circle */
            ct.beginPath();
            ct.moveTo(1, 0);
            ct.arc(0, 0, 1, 0, tau, false);
            ct.stroke();
            ct.restore();
        }

        if (showGhostPolygon) {
            ct.beginPath();
            let deltaPolygonSides = polygonCount - edgeCount;
            let deltaPolygonRadius = rollRadius - polygonRadius;
            let deltaStartAngle = (polygonCount / deltaPolygonSides * 2) * t * tau * speed;
            if (deltaPolygonSides % 2 == polygonCount % 2)
                deltaStartAngle += tau / deltaPolygonSides / 2;
            for (let vertexIndex = 0; vertexIndex < deltaPolygonSides; ++vertexIndex) {
                let vertexAngle = deltaStartAngle + vertexIndex * tau / deltaPolygonSides;
                ct.lineTo(deltaPolygonRadius * Math.cos(vertexAngle), deltaPolygonRadius * Math.sin(vertexAngle));
            }
            ct.lineWidth = 2 * pixelSize;
            ct.closePath();
            ct.stroke();
        }

        // dots
        if (showDots) {
            ct.beginPath();
            for (let i = 0; i < polygonCount; ++i) {
                for (let j = 0; j < edgeCount; ++j) {
                    const point = pts[i * edgeCount + j];
                    ct.moveTo(...point);
                    ct.arc(...point, 4 * pixelSize, 0, tau, false);
                }
            }
            ct.fill();
        }

        ct.restore();

        window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
})();
