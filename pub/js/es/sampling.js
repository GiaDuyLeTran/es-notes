var tw = 25;
var tmax;

var p = {wave: 0, sample: 0}

function draw_axes(c, ctx) {
    ctx.beginPath()
    ctx.strokeStyle = "grey"

    for(i = 0; i < tmax; i++) {
        ctx.moveTo(i * tw, 0)
        ctx.lineTo(i * tw, c.height)
        ctx.stroke()
    }

    ctx.moveTo(0, c.height / 2)
    ctx.lineTo(c.width, c.height / 2)
    ctx.stroke()

}

function plot_sine(c, ctx, period, colour, phase) {
    var ymid = c.height / 2

    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.moveTo(0, ymid)

    for(i = 0; i < c.width; i++) {
        ctx.lineTo(i, phase * ymid * Math.sin(2 * i / (tw * period) * Math.PI) + ymid)
    }

    ctx.stroke()
}

function plot_samplepoints(c, ctx, wave, sample, colour) {
    var ymid = c.height / 2
    var npoints = Math.ceil(tmax / sample)

    ctx.fillStyle = colour

    for(i = 0; i < npoints; i++) {
        var x = i * tw * sample;
        var y = ymid * Math.sin(2 * i * sample / wave * Math.PI) + ymid
        var r = 4
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2*Math.PI)
        ctx.fill()
    }
}

function sample() {
    var c = $( "#sample_canvas" )[0]
    var ctx = c.getContext("2d")

    tmax = Math.floor(c.width / tw)

    var wave_period = p.wave
    var sample_period = p.sample

    var fw = 1 / p.wave, fs = 1 / p.sample

    var phase = 1
    fa = fw % fs
    if (fa > fs / 2) {
        fa = fs - fa
        phase = -1
    }

    if (Math.abs(2 * fa - fs) < 0.001) {
        fa = 0
    }

    // js deals correctly with the Infinity if fa == 0
    var aliased_period = 1 / fa

    ctx.clearRect(0, 0, c.width, c.height)

    console.log(wave_period, sample_period, aliased_period)

    draw_axes(c, ctx)

    plot_sine(c, ctx, wave_period, "red", 1)
    plot_sine(c, ctx, aliased_period, "blue", phase)

    plot_samplepoints(c, ctx, wave_period, sample_period, "green")

    $( "#fs" ).html(fs.toFixed(2))
    $( "#fw" ).html(fw.toFixed(2))
    $( "#fa" ).html(fa.toFixed(2))

};

