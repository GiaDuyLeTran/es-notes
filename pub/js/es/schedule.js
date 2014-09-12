
function drawReq(ctx, startX, startY, col, rt, per, tw, tmax) {
    if (per <= rt) {
        alert("Period must be greater than Run Time");
        return;
    }

    ctx.fillStyle = col;
    ctx.strokeStyle = "black";

    for(t = 0; t < tmax; ) {
        ctx.fillRect(t * tw + startX, startY, rt * tw, tw);
        t = t + per;
    };

}

function drawRun(ctx, startX, startY, col, t, tw) {
    ctx.fillStyle = col;
    ctx.fillRect(t * tw + startX, startY, tw, tw);
}

function drawMissed(ctx, startX, startY, col, t, tw) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.strokeRect(t * tw - 5 + startX, startY - 5, 10, tw + 10);
}

function fps(ctx, runqueue, tw, tmax, x, y, col) {
    var total_missed = 0;
    for (t = 0; t < tmax; t++) {
        var missed = [];
        // Refresh timeslices at the end of each period
        for (task in runqueue) {
            if(t % runqueue[task].per == 0) {
                if (runqueue[task].ts > 0) {
                    missed.push(task);
                    total_missed++;
                }
                runqueue[task].ts = runqueue[task].rt;
                console.log("Refreshed " + runqueue[task].id + " to " + runqueue[task].ts)
            }
        }

        // Pick task to run based on priority (FPS)
        var torun = null;
        for (task in runqueue) {
            if (runqueue[task].ts == 0) {
                continue;
            }

            if (torun == null || runqueue[torun].p < runqueue[task].p) {
                torun = task;
            }
        }

        // Draw missed deadline if applicable
        for (m in missed) {
            var id = runqueue[m].id - 1
            drawMissed(ctx, x, y + 2 * id, col[id], t, tw);
        }

        // No eligable tasks
        if (torun == null) {
            console.log("No task to run")
            continue;
        }

        // Run a task
        console.log("Running task " + runqueue[torun].id + " (" + runqueue[torun].ts + " left)");
        drawRun(ctx, x, y, col[runqueue[torun].id - 1], t, tw);
        runqueue[torun].ts = runqueue[torun].ts - 1;
    }
    return total_missed;
}


function to_dead(t, per) {
    return per - (t % per);
}

function edf(ctx, runqueue, tw, tmax, x, y, col) {
    var total_missed = 0;
    for (t = 0; t < tmax; t++) {
        var missed = [];
        // Refresh timeslices at the end of each period
        for (task in runqueue) {
            if(t % runqueue[task].per == 0) {
                if (runqueue[task].ts > 0) {
                    missed.push(task);
                    total_missed++;
                }
                runqueue[task].ts = runqueue[task].rt;
                console.log("Refreshed " + runqueue[task].id + " to " + runqueue[task].ts)
            }
        }

        // Pick task to run based on time to next period (deadline)
        var torun = null;
        for (task in runqueue) {
            if (runqueue[task].ts == 0) {
                continue;
            }

            if (torun == null || to_dead(t, runqueue[task].per) < to_dead(t, runqueue[torun].per)) {
                torun = task;
            }
        }

        // Draw missed deadline if applicable
        for (m in missed) {
            var id = runqueue[missed[m]].id - 1
            drawMissed(ctx, x + 2 * m, y + 2 * m, col[id], t, tw);
        }

        // No eligable tasks
        if (torun == null) {
            console.log("No task to run")
            continue;
        }

        // Run a task
        console.log("Running task " + runqueue[torun].id + " (" + runqueue[torun].ts + " left)");
        drawRun(ctx, x, y, col[runqueue[torun].id - 1], t, tw);
        runqueue[torun].ts = runqueue[torun].ts - 1;
    }

    return total_missed;
}

function schedule() {
    var c = document.getElementById("sched");
    var ctx = c.getContext("2d");

    var lh = 25, startX = 40;
    var tw = 20, tmax = Math.floor((c.width - startX) / tw);

    console.log("Tmax: " + tmax)

    var col = ["green", "blue", "red"];

    var rt1 = $( "#rt1" ).spinner("value"), per1 = $( "#per1" ).spinner("value"), pri1 = $( "#pri1" ).spinner("value");
    var rt2 = $( "#rt2" ).spinner("value"), per2 = $( "#per2" ).spinner("value"), pri2 = $( "#pri2" ).spinner("value");
    var rt3 = $( "#rt3" ).spinner("value"), per3 = $( "#per3" ).spinner("value"), pri3 = $( "#pri3" ).spinner("value");

    ctx.clearRect(0, 0, c.width, c.height);

    ctx.fillStyle = "black"
    ctx.font = "20px Verdana"
    ctx.fillText("1", 10, 1 * lh + 15)
    ctx.fillText("2", 10, 2 * lh + 15)
    ctx.fillText("3", 10, 3 * lh + 15)

    ctx.fillText("FP", 10, 4.5 * lh + 15)
    ctx.fillText("ED", 10, 6 * lh + 15)

    drawReq(ctx, startX, 1 * lh, col[0], rt1, per1, tw, tmax);
    drawReq(ctx, startX, 2 * lh, col[1], rt2, per2, tw, tmax);
    drawReq(ctx, startX, 3 * lh, col[2], rt3, per3, tw, tmax);

    runqueue = [ {id: 1, rt: rt1, per: per1, p: pri1, ts: 0},
                 {id: 2, rt: rt2, per: per2, p: pri2, ts: 0},
                 {id: 3, rt: rt3, per: per3, p: pri3, ts: 0} ];

    var f_missed = fps(ctx, runqueue, tw, tmax, startX, 4.5 * lh, col)

    runqueue = [ {id: 1, rt: rt1, per: per1, p: pri1, ts: 0},
                 {id: 2, rt: rt2, per: per2, p: pri2, ts: 0},
                 {id: 3, rt: rt3, per: per3, p: pri3, ts: 0} ];

    var e_missed = edf(ctx, runqueue, tw, tmax, startX, 6 * lh, col)

    $( "#fps_missed" ).html(f_missed);
    $( "#edf_missed" ).html(e_missed);

};

