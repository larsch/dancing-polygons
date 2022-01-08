(function () {
    function gcd(a, b) {
        while (b !== 0) {
            let t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    let ca = document.getElementById("canvas");
    let ct = ca.getContext("2d");
    let tau = 6.28318530718;
    const colors = ['#7FBD6B', '#6BA8BD', '#A86BBD', '#BD806B'];

    let scale = 1.0;
    let lineWidthScale = 1.0;

    function resize() {
        let dpr;
        dpr = window.devicePixelRatio || 1;
        ca.style.width = window.innerWidth + "px";
        ca.style.height = window.innerHeight + "px";
        ca.width = dpr * window.innerWidth;
        ca.height = dpr * window.innerHeight;
        let dim = Math.min(ca.width, ca.height);
        scale = dim * 0.48;
        lineWidthScale = dpr / scale;

        ct.restore(); // restore default transformation
        ct.save(); // save default again
        ct.translate(ca.width / 2, ca.height / 2);
        ct.scale(scale, -scale);

    }
    window.addEventListener('resize', resize);
    ct.save();
    resize();

    let period = 10000.0;

    function amp(n, t) {
        if (!cycleShapes)
            return 2.0;
        let phase = (t % period) / period;
        phase = (phase + n / 3.0) % 1.0;
        phase = Math.abs(phase * 2 - 1);
        phase = phase * 10 - 4.5;
        return Math.max(0.25, Math.min(3.0, phase));
    }

    let n1 = parseInt(document.getElementById("n1").value);
    let n2 = parseInt(document.getElementById("n2").value);
    document.getElementById("n1value").textContent = n1;
    document.getElementById("n2value").textContent = n2;
    let r1;
    let r2;
    let cordLength, cordMid;
    let r2f;
    let commonDivisor = 1;
    let pts = [];
    let path;
    let speed = 1.0 / 12000.0;

    function calculateRadii() {
        r1 = Math.max(n1, n2) / (n1 + n2);
        r2 = Math.min(n1, n2) / (n1 + n2);
        let arcLength = tau * Math.min(n1, n2) / (n1 + n2);
        let x = Math.cos(arcLength) - 1.0;
        let y = Math.sin(arcLength);
        cordLength = Math.sqrt(Math.pow(x, 2.0) + Math.pow(y, 2.0));
        cordMid = Math.sqrt(1.0 - Math.pow(cordLength / 2, 2.0));
        let cordRest = 1.0 - cordMid;
        r2f = cordRest - r2;
        commonDivisor = gcd(n1, n2);

        pts.length = n1 * n2;
        for (let i = 0; i < pts.length; ++i) {
            pts[i] = [0, 0];
        }

        path = [];
        for (let f = 0; f < n2 / commonDivisor; f += 1e-2) {
            let a1 = f * tau;
            let a2 = - f * tau * (r1 / r2);
            let cx = r1 * Math.cos(a1) + r2f * Math.cos(a2);
            let cy = r1 * Math.sin(a1) + r2f * Math.sin(a2);
            path.push([cx, cy]);
        }
    }
    calculateRadii();

    let showDots = document.getElementById('show-dots').checked
    let showShapeA = document.getElementById('shape-a').checked;
    let showShapeB = document.getElementById('shape-b').checked;
    let showPath = document.getElementById('path').checked;
    let showCircles = document.getElementById('show-circles').checked;
    let cycleShapes = document.getElementById('cycle-shapes').checked;
    let showStar = document.getElementById('show-star').checked
    let relativeSpeed = 1;
    let timeReference = null;
    let lastTime = null;
    let lastRenderTime = null;

    document.addEventListener('keypress', (e) => {
        if (e.key == 'd') {
            showDots = !showDots;
            document.getElementById('show-dots').checked = showDots;
        } else if (e.key == 'c') {
            showCircles = !showCircles;
            document.getElementById('show-circles').checked = showCircles;
        } else if (e.key == 'a') {
            showShapeA = !showShapeA;
            document.getElementById('shape-a').checked = showShapeA;
        } else if (e.key == 'b') {
            showShapeB = !showShapeB;
            document.getElementById('shape-b').checked = showShapeB;
        } else if (e.key == 'p') {
            showPath = !showPath;
            document.getElementById('path').checked = showPath;
        } else if (e.key == 'y') {
            cycleShapes = !cycleShapes;
            document.getElementById('cycle-shapes').checked = cycleShapes;
        } else if (e.key == 's') {
            showStar = !showStar;
            document.getElementById('show-star').checked = showStar;
        }
    });

    document.getElementById("speed").addEventListener("input", function (e) {
        relativeSpeed = parseFloat(e.target.value);
        timeReference = lastTime;
        timeOffset = lastRenderTime;
    });

    document.getElementById("n1").addEventListener("input", function (e) {
        n1 = parseInt(e.target.value);
        document.getElementById("n1value").textContent = e.target.value;
        if (n1 < n2) {
            document.getElementById("n2").value = n1;
            document.getElementById("n2value").textContent = n1;
            n2 = n1;
        }
        calculateRadii();
    })

    document.getElementById("n2").addEventListener("input", function (e) {
        n2 = parseInt(e.target.value);
        document.getElementById("n2value").textContent = e.target.value;
        if (n2 > n1) {
            document.getElementById("n1").value = n2;
            document.getElementById("n1value").textContent = n2;
            n1 = n2;
        }
        calculateRadii();
    })

    document.getElementById("show-dots").addEventListener("change", function (e) {
        showDots = e.target.checked;
    });

    document.getElementById("path").addEventListener("change", function (e) {
        showPath = e.target.checked;
    });

    document.getElementById("shape-a").addEventListener("change", function (e) {
        showShapeA = e.target.checked;
    });

    document.getElementById("shape-b").addEventListener("change", function (e) {
        showShapeB = e.target.checked;
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

        ct.clearRect(-2.0, -2.0, 4.0, 4.0);
        ct.save();

        for (let i = 0; i < n1; ++i) {
            for (let j = 0; j < n2; ++j) {
                let a1 = t * tau * speed + i * tau / n1;
                let a2 = - t * tau * speed * (r1 / r2) + j * tau / n2;
                let cx = r1 * Math.cos(a1) + r2f * Math.cos(a2);
                let cy = r1 * Math.sin(a1) + r2f * Math.sin(a2);
                let pt = pts[i * n2 + j];
                pt[0] = cx;
                pt[1] = cy;
            }
        }

        // each in n2
        if (showShapeA) {
            ct.lineWidth = amp(1, t) * lineWidthScale;
            ct.strokeStyle = colors[0];
            ct.beginPath();
            for (let j = 0; j < n2; ++j) {
                ct.moveTo(...pts[j]);
                for (let i = 1; i < n1; ++i) {
                    ct.lineTo(...pts[i * n2 + j]);
                }
                ct.closePath();
                ct.stroke();
            }
        }

        // each in n1
        if (showShapeB) {
            ct.lineWidth = amp(0, t) * lineWidthScale;
            ct.strokeStyle = colors[1];
            ct.beginPath();
            for (let i = 0; i < n1; ++i) {
                ct.moveTo(...pts[i * n2]);
                for (let j = 1; j < n2; ++j) {
                    ct.lineTo(...pts[i * n2 + j], 4 / scale, 0, tau, false);
                }
                ct.closePath();
            }
            ct.stroke();
        }

        // star
        if (showStar) {
            ct.beginPath();
            ct.lineWidth = amp(2, t) * lineWidthScale;
            ct.strokeStyle = colors[2];
            for (let h = 0; h < commonDivisor; ++h) {
                let a1 = h * tau / (n1 + n2);
                ct.moveTo(Math.cos(a1), Math.sin(a1));
                let steps = (n1 + n2) / commonDivisor;
                for (let i = 1; i < steps; ++i) {
                    let a = i * tau * Math.max(n1, n2) / (n1 + n2) + a1;
                    let x = Math.cos(a);
                    let y = Math.sin(a);
                    ct.lineTo(x, y);
                }
                ct.closePath();
            }
            ct.stroke();
        }

        if (showCircles) {
            ct.beginPath();
            ct.lineWidth = 2 / scale;
            ct.strokeStyle = 'black';
            for (let i = 0; i < n1; ++i) {
                let a1 = t * tau * speed + i * tau / n1;
                let cx = r1 * Math.cos(a1);
                let cy = r1 * Math.sin(a1);
                ct.moveTo(cx + r2, cy);
                ct.arc(cx, cy, r2, 0, tau, false);
            }
            ct.stroke();
        }

        if (showPath) {
            ct.lineWidth = amp(2, t) * lineWidthScale;
            ct.strokeStyle = colors[3];
            ct.beginPath();
            for (let q = 0; q < commonDivisor; ++q) {
                ct.save();
                ct.rotate(q * tau / (n1 + n2));
                ct.moveTo(...path[0]);
                for (let i = 1; i < path.length; ++i)
                    ct.lineTo(...path[i]);
                ct.closePath();
                ct.restore();
            }
            ct.stroke();
        }

        // dots
        if (showDots) {
            ct.beginPath();
            for (let i = 0; i < n1; ++i) {
                for (let j = 0; j < n2; ++j) {
                    const pt = pts[i * n2 + j];
                    ct.moveTo(...pt);
                    ct.arc(...pt, 4 * lineWidthScale, 0, tau, false);
                }
            }
            ct.fill();
        }

        ct.restore();

        window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
})();
